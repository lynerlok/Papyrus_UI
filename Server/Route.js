var express = require("express");
var fs = require("fs");
var bodyParser = require('body-parser');
var uuid = require('uuid/v4');
var path = require('path');
var crypto = require('crypto');
var argon2i = require('argon2-ffi').argon2i;
var crypto = require('crypto');
var del = require('del');
var PapyrusMainFile = require('./PapyrusTable.js');
var {PythonShell} = require('python-shell');
var formidable = require('formidable'); 

var jsonFile = fs.readFileSync('passwd.json', 'utf8');
var creds = JSON.parse(jsonFile);

var jsonFile = fs.readFileSync('projects.json', 'utf8');
var projects = JSON.parse(jsonFile);

var router = express.Router();

var pythonPathNode = "/usr/bin/python";

/*

*/

module.exports = (function() {

  router.get('/secure/interface.html', function(req, res){
    if(req.session.isAuthenticated === "Success"){
      res.redirect('/secure/interface.html');
    } else {
      console.log("Access Denied !");
      res.redirect('/');
    }
  });
	
  router.get('/', function(req, res){
    res.redirect('/index.html');
  });
  
  router.get('/secure/logout', function(req, res){
	   req.session.destroy(function(){
	      console.log("user logged out.");
	   });
	   res.redirect('/');
	});
	
  router.get('/secure/rd', function(req, res){ // Supprimer aussi toutes les images qui appartiennent à user ??
    if(req.session.isAuthenticated === "Success" && req.session.user !== "main"){
      var index = creds.users.indexOf(req.session.user);
      if (index !== -1) creds.users.splice(index, 1);
      if (index !== -1) creds.passwords.splice(index, 1);
      
      var index = projects.names.indexOf(req.session.user);
      if (index !== -1) projects.names.splice(index, 1);
      if (index !== -1) projects.refs.splice(index, 1);
      
      fs.writeFile('passwd.json',JSON.stringify(creds), (err) => {
        if (err) throw err;
        console.log('INFO [USER REMOVED]: Passwords Files Updated !');
      });
      
      fs.writeFile(__dirname + '/projects.json',JSON.stringify(projects), (err) => {
          if (err) throw err;
          console.log('INFO [USER REMOVED] : ImageRef updated !');
        });
      
      res.redirect('/logout');
    }
    else {
      res.redirect('/secure/interface.html');
      console.log("WARNING : A user try to delete an other user with no permissions : "+req.session.user);
    }
	});

  router.post('/secure/treshold',function(req,res){
    if(req.session.isAuthenticated === "Success"){
      var img = req.body.img;
      var d = new Date();
      var currentTime = d.getTime();
      
      var path = __dirname + '/../Client/secure/Datas/';
      var options = {
        mode: 'text',
        pythonPath: pythonPathNode,
        args: [`-i ${img}`, `-o ${path}`]
      };
      pyPath = __dirname + '/../Client/secure/Scripts/treshold.py';
      PythonShell.run(pyPath, options, function (err, results) {
        if (err) throw err;
        
        fs.rename(path + 'out.png',path + 'Treshold_on_' + img + '_' + currentTime + '.png', function (err) {
        if (err) throw err;
        console.log("INFO [TRESHOLD] : Image "+ img +"tresholded and renamed");
        });
        
        var index = projects.names.indexOf(req.session.user);
  
        projects.refs[index].push('Treshold_on_' + img + '_' + currentTime);
      
        fs.writeFile(__dirname + '/projects.json',JSON.stringify(projects), (err) => {
          if (err) throw err;
          console.log('INFO [TRESHOLD] : ImageRef JSON of user '+req.session.user+' updated !');
        });
        
        
        var newPapyrus = {};
        newPapyrus['Ref']='Treshold_on_' + img + '_' + currentTime;
        newPapyrus['THB']='Treshold_on_' + img + '_' + currentTime + '_thb';
        newPapyrus['RCL']='Datas/Treshold_on_' + img + '_' + currentTime + '.png';
        newPapyrus['VCL']='null';
        newPapyrus['RIR']='null';
        newPapyrus['VIR']='null';
        newPapyrus['MetaDatas']='null';
        newPapyrus['Owner']=req.session.user;
         
        PapyrusMainFile.PapyrusTable.push(newPapyrus);
        
        fs.writeFile(__dirname + '/PapyrusTable.json',JSON.stringify(PapyrusMainFile.PapyrusTable), (err) => {
          if (err) throw err;
          console.log('INFO [TRESHOLD] : PapyrusTable updated !');
        });
        
        res.sendStatus(200);
      });
    }
    else {
        console.log('WARNING [TRESHOLD] : Access Denied ('+req.session.user+')');
        res.redirect('/');
    }
	});
  
  router.post('/login',async function(req,res){
		if(!req.body) return res.sendStatus(400);
	  
		var user=req.body.username;
		var pwd=req.body.password;
  
	  if (creds.users.includes(user)) {
	    var index = creds.users.indexOf(user);
	    try {
	      if (await argon2i.verify(creds.passwords[index],pwd)) {
          req.session.isAuthenticated = "Success";
          req.session.user = user;
          console.log("INFO : User log in :"+user);
          res.redirect('/secure/interface.html');
	      } else {
	        res.sendStatus(400);
	      }
	    } catch (err) {
	      console.log("ERROR while verifying hash password : "+err);
	    }
	  }
	  else {return res.sendStatus(400)}
	  
	});
  
  router.get('/secure/ref', function(req,res){
    var i=0;
    var j=0;
    var JsonTableSend = [];
    
    if (req.session.isAuthenticated === "Success"){

      var index = projects.names.indexOf(req.session.user);
      
      if (projects.refs[index][0] === "all"){
        JsonTableSend = PapyrusMainFile.PapyrusTable;
      }
      else {
        for (i=0;i<PapyrusMainFile.PapyrusTable.length;i++){
          for(j=0;j<projects.refs[index].length;j++){
            if(PapyrusMainFile.PapyrusTable[i].Ref === projects.refs[index][j]){
              JsonTableSend.push(PapyrusMainFile.PapyrusTable[i]);
            }
          }
        }
      }
      res.send(JSON.stringify(JsonTableSend));
    }
    else {res.redirect("/");}
 	});   

	router.post('/secure/wd',async function(req,res){
		if(req.session.isAuthenticated === "Success"){
      var user=req.body.username;
      var pwd=req.body.password;
      var index = creds.users.indexOf(user);
      if (index === -1){
        var salt = crypto.randomBytes(32);
        try {
          var hashPass = await argon2i.hash(pwd, salt); 
        } catch(err) {
          console.log("Error while hashing password : "+err);
        }
        creds.users.push(user); 
        creds.passwords.push(hashPass);
        
        projects.names.push(user);
        projects.refs.push(["all"]);
        
        fs.writeFile('passwd.json',JSON.stringify(creds), (err) => {
          if (err) throw err;
          console.log('INFO [USER CREATED] : Passwords Files Updated !');
        });
        
        fs.writeFile(__dirname + '/projects.json',JSON.stringify(projects), (err) => {
          if (err) throw err;
          console.log('INFO [USER CREATED] : ImageRef updated !');
        });
      
        res.redirect('/logout');
      }
      else {
        res.redirect('/secure/interface.html');
        console.log("WARNING : A user try to register more than one time : "+user);
      }
    }
    else {return res.sendStatus(400)}
	});
  
  router.post('/secure/compUpload',function(req,res){
    
    if(req.session.isAuthenticated === "Success"){
      
      if(!req.body || req.session.user === "main") return res.sendStatus(400);
      var img = new Buffer.from(req.body[0].imgCompound, 'base64');
      var imgArray = req.body[1].areaImages;
      var d = new Date();
      var currentTime = d.getTime();
      
      fs.writeFile( __dirname + '/../Client/secure/Datas/Compound-'+currentTime+'.png',img, "binary", (err) => {
        if (err) throw err;
        console.log('INFO : Compound '+ currentTime + ' saved !');
      });
      fs.writeFile(__dirname + '/../Client/secure/Datas/Compound-'+currentTime+'.json',JSON.stringify(imgArray), (err) => {
        if (err) throw err;
        console.log('INFO : Image table '+ currentTime + ' saved !');
      });
      
      res.sendStatus(200);
      
      var index = projects.names.indexOf(req.session.user);

      projects.refs[index].push('Compound-'+currentTime);
    
      fs.writeFile(__dirname + '/projects.json',JSON.stringify(projects), (err) => {
        if (err) throw err;
        console.log('INFO : ImageRef JSON of user '+req.session.user+' updated !');
      });
      
      
      var newPapyrus = {};
      newPapyrus['Ref']='Compound-'+currentTime;
      newPapyrus['THB']='Compound-'+currentTime+'_thb';
      newPapyrus['RCL']='Datas/Compound-'+currentTime+'.png';
      newPapyrus['VCL']='null';
      newPapyrus['RIR']='null';
      newPapyrus['VIR']='null';
      newPapyrus['MetaDatas']='null';
      newPapyrus['Owner']=req.session.user;
       
      PapyrusMainFile.PapyrusTable.push(newPapyrus);
      
      fs.writeFile(__dirname + '/PapyrusTable.json',JSON.stringify(PapyrusMainFile.PapyrusTable), (err) => {
        if (err) throw err;
        console.log('INFO : PapyrusTable updated !');
      });
      
    }
    else {res.redirect('/');}

  });
  
  router.post('/secure/DestroyCMP',function(req,res){
    
    if(req.session.isAuthenticated === "Success"){
      
      if(!req.body || req.session.user === "main") return res.sendStatus(400);
      
      del.sync([__dirname + '/../Client/secure/Datas/'+req.body.compound+'.*'],{force:true});
      
      var l = PapyrusMainFile.PapyrusTable.length;

      for (var i=0;i<l;i++){
        if (PapyrusMainFile.PapyrusTable[i].Ref === req.body.compound) {
          PapyrusMainFile.PapyrusTable.splice(i,1);
        }
      }
      
      fs.writeFile(__dirname + '/PapyrusTable.json',JSON.stringify(PapyrusMainFile.PapyrusTable), (err) => {
        if (err) throw err;
        console.log('INFO : PapyrusTable updated !');
      });
      
      var nameIndex = projects.names.indexOf(req.session.user);
      var index = projects.refs[nameIndex].indexOf(req.body.compound);
      
      projects.refs[nameIndex].splice(index,1);
      
      fs.writeFile(__dirname + '/projects.json',JSON.stringify(projects), (err) => {
        if (err) throw err;
        console.log('INFO : ImageRef JSON of user '+req.session.user+' updated !');
      });
  
      res.sendStatus(200);  
    }
    else {res.redirect('/');}

  });
  
	return router;
})();
