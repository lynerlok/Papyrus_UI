/*
 * Route.js
 *
 * Elisabeth Gueux, Salome Mialon, Quentin Piet, Axel Polin
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301, USA.
 *
 * Please visit : https://github.com/axel-polin/Papyrus_UI
 *
 */

/* This file contain all route for the server behind the static route in ServerExpress.js ;
 */

// Dependancies for the project;

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

var router = express.Router(); // Use Router to set route for the server;

// End dependancies;

// Utility path for the server (part 2 see part 1 in ServerExpress.js). Edit at your own risk !

// System path 
//    Mandatory path;

var passwordPath = __dirname + '/passwd.json';
var projectsPath = __dirname + '/projects.json';
var PapyrusTablePath = __dirname + '/PapyrusTable.json';
var datasPath = __dirname + '/../Client/secure/Datas';

//    Scripts path;

var pythonPathNode = '/usr/bin/python';
var tresholdScriptPath = __dirname + '/../Client/secure/Scripts/treshold.py';

// Server path;
//    Main path;

var mainPath = '/';
var indexPath = '/index.html';
var loginPath = '/login';

//    Mandatory path;

var interfacePath = '/secure/interface.html';
var logoutPath = '/secure/logout';
var refPath = '/secure/ref';

//    Optionnal path;

var createProjectPath = '/secure/wd';
var removeProjectPath = '/secure/rd';
var compUploadPath = '/secure/compUpload';
var destroyCMPPath = '/secure/DestroyCMP';
var metadatasPath = '/secure/metadatas';

//    Script path to run script on the server (not system path);

var tresholdPath = '/secure/treshold';

// Read the user/password file and the projects file;

var jsonFile = fs.readFileSync(passwordPath, 'utf8');
var creds = JSON.parse(jsonFile);

var jsonFile = fs.readFileSync(projectsPath, 'utf8');
var projects = JSON.parse(jsonFile);

module.exports = (function() { // Module creation for the main file of the server;

  router.get(interfacePath, function(req, res){ // Route : when GET interface.html redirect to the page if user is login or '/' otherwise;
    if(req.session.isAuthenticated === "Success"){
      res.redirect(interfacePath);
    } else {
      console.log("Access Denied !");
      res.redirect(mainPath);
    }
  });
	
  router.get(mainPath, function(req, res){ // Route : when GET '/' redirect to index.html;
    res.redirect(indexPath);
  });
  
  router.get(logoutPath, function(req, res){ // Route : when GET '/logout' redirect to '/';
    var user = req.session.user;
	   req.session.destroy(function(){ // On logout remove session file server side;
	      console.log("[INFO] : "+user+" logged out."); // Log in server the logout;
	   });
	   res.redirect(mainPath); // Redirect to '/';
	});
	
  router.get(removeProjectPath, function(req, res){ // Route : when GET rd make some action and redirect to logout;
    if(req.session.isAuthenticated === "Success" && req.session.user !== "main"){ // If the user is log in and the user is not main (main is for creation);
      var index = creds.users.indexOf(req.session.user); // Search the user in user array;
      if (index !== -1) creds.users.splice(index, 1); // Remove user from user array...
      if (index !== -1) creds.passwords.splice(index, 1); // ... and his password from password array;
      
      var index = projects.names.indexOf(req.session.user);
      if (index !== -1) projects.names.splice(index, 1); // Remove project name from projects array...
      if (index !== -1) projects.refs.splice(index, 1); // ... and remove all image reference associate (it doesn't remove any file !);
      
      fs.writeFile(passwordPath,JSON.stringify(creds), (err) => { // Save password file in case of server crash;
        if (err) throw err;
        console.log('INFO [USER REMOVED]: Passwords Files Updated !'); // Log info for server;
      });
      
      fs.writeFile(projectsPath,JSON.stringify(projects), (err) => { // Save projects file in case of server crash;
          if (err) throw err;
          console.log('INFO [USER REMOVED] : ImageRef updated !'); // Log info for server;
        });
      
      res.redirect(logoutPath); // Redirect on logout;
    }
    else {
      res.redirect(interfacePath); // If the user is not log in or is main, do a redirection attempt on interface;
      console.log("WARNING : A user try to delete an other user with no permissions : "+req.session.user); // Log the incident in server
    }
	});

  router.post(tresholdPath,function(req,res){ // Route : when POST treshold (body contains img ref) make some action and send 200 OK;
    if(req.session.isAuthenticated === "Success"){ // If the user is login;
      
      var img = req.body.img; // The body contain the image reference.
      var len = PapyrusMainFile.PapyrusTable.length;
      
      var imgSplit = img.split('/',10);
      var imgToScript = datasPath + '/' + imgSplit[imgSplit.length-1];
      
      var d = new Date();
      var currentTime = d.getTime();
      
      var options = {
        mode: 'text',
        pythonPath: pythonPathNode,
        args: [`-i ${imgToScript}`, `-o ${datasPath}`]
      };
      
      PythonShell.run(tresholdScriptPath, options, function (err, results) {
        if (err) throw err;
        
        fs.rename(datasPath + '/out.png',datasPath + '/Treshold_on_' + img + '_' + currentTime + '.png', function (err) {
        if (err) throw err;
        console.log("INFO [TRESHOLD] : Image "+ img +"tresholded and renamed");
        });
        
        var index = projects.names.indexOf(req.session.user);
  
        projects.refs[index].push('Treshold_on_' + img + '_' + currentTime);
      
        fs.writeFile(projectsPath,JSON.stringify(projects), (err) => {
          if (err) throw err;
          console.log('INFO [TRESHOLD] : ImageRef JSON of user '+req.session.user+' updated !');
        });
        
        
        var newPapyrus = {};
        newPapyrus['Ref']='Treshold_on_' + img + '_' + currentTime;
        newPapyrus['THB']='Treshold_on_' + img + '_' + currentTime + '_thb';
        newPapyrus['RCL']= datasPath + '/Treshold_on_' + img + '_' + currentTime + '.png';
        newPapyrus['VCL']='null';
        newPapyrus['RIR']='null';
        newPapyrus['VIR']='null';
        newPapyrus['MetaDatas']='null';
        newPapyrus['Owner']=req.session.user;
         
        PapyrusMainFile.PapyrusTable.push(newPapyrus);
        
        fs.writeFile(PapyrusTablePath,JSON.stringify(PapyrusMainFile.PapyrusTable), (err) => {
          if (err) throw err;
          console.log('INFO [TRESHOLD] : PapyrusTable updated !');
        });
        
        res.sendStatus(200);
      });
    }
    else {
        console.log('WARNING [TRESHOLD] : Access Denied ('+req.session.user+')');
        res.redirect(mainPath);
    }
	});
  
  router.post(loginPath,async function(req,res){
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
          res.redirect(interfacePath);
	      } else {
	        res.sendStatus(400);
	      }
	    } catch (err) {
	      console.log("ERROR while verifying hash password : "+err);
	    }
	  }
	  else {return res.sendStatus(400)}
	  
	});
  
  router.get(refPath, function(req,res){
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

	router.post(createProjectPath,async function(req,res){
		if(req.session.isAuthenticated === "Success"){
      var user=req.body.username;
      var pwd=req.body.password;
      var imgRefs=req.body.imgRefs;
      imgRefs = ["all"]
      
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
        projects.refs.push(imgRefs);
        
        fs.writeFile(passwordPath,JSON.stringify(creds), (err) => {
          if (err) throw err;
          console.log('INFO [USER CREATED] : Passwords Files Updated !');
        });
        
        fs.writeFile(projectsPath,JSON.stringify(projects), (err) => {
          if (err) throw err;
          console.log('INFO [USER CREATED] : ImageRef updated !');
        });
      
        res.redirect(logoutPath);
      }
      else {
        res.redirect(interfacePath);
        console.log("WARNING : A user try to register more than one time : "+user);
      }
    }
    else {return res.sendStatus(400)}
	});
  
  router.post(compUploadPath,function(req,res){
    
    if(req.session.isAuthenticated === "Success"){
      
      if(!req.body || req.session.user === "main") return res.sendStatus(400);
      var img = new Buffer.from(req.body[0].imgCompound, 'base64');
      var imgArray = req.body[1].areaImages;
      var src = req.body[1].src;
      
      var d = new Date();
      var currentTime = d.getTime();
      
      fs.writeFile(datasPath + '/Compound-'+currentTime+'.png',img, "binary", (err) => {
        if (err) throw err;
        console.log('INFO : Compound '+ currentTime + ' saved !');
      });
      fs.writeFile(datasPath + '/Compound-'+currentTime+'.json',JSON.stringify(imgArray), (err) => {
        if (err) throw err;
        console.log('INFO : Image table '+ currentTime + ' saved !');
      });
      
      res.sendStatus(200);
      
      var index = projects.names.indexOf(req.session.user);

      projects.refs[index].push('Compound-'+currentTime);
    
      fs.writeFile(projectsPath,JSON.stringify(projects), (err) => {
        if (err) throw err;
        console.log('INFO : ImageRef JSON of user '+req.session.user+' updated !');
      });
      
      
      var newPapyrus = {};
      newPapyrus['Ref']='Compound-'+currentTime;
      newPapyrus['THB']='Compound-'+currentTime+'_thb';
      newPapyrus['RCL']= 'null';
      newPapyrus['VCL']='null';
      newPapyrus['RIR']='null';
      newPapyrus['VIR']='null';
      newPapyrus['MetaDatas']='null';
      newPapyrus['Owner']=req.session.user;
      
      if (src.search("r_CL") != -1) {newPapyrus['RCL']= 'Datas' + '/Compound-'+currentTime+'.png'};
      if (src.search("r_IR") != -1) {newPapyrus['RIR']= 'Datas' + '/Compound-'+currentTime+'.png'};
      if (src.search("v_CL") != -1) {newPapyrus['VCL']= 'Datas' + '/Compound-'+currentTime+'.png'};
      if (src.search("v_IR") != -1) {newPapyrus['VIR']= 'Datas' + '/Compound-'+currentTime+'.png'};
      
      PapyrusMainFile.PapyrusTable.push(newPapyrus);
      
      fs.writeFile(PapyrusTablePath,JSON.stringify(PapyrusMainFile.PapyrusTable), (err) => {
        if (err) throw err;
        console.log('INFO : PapyrusTable updated !');
      });
      
    }
    else {res.redirect(mainPath);}

  });
  
  router.post(destroyCMPPath,function(req,res){
    
    if(req.session.isAuthenticated === "Success"){
      
      if(!req.body || req.session.user === "main") return res.sendStatus(400);
      
      del.sync([datasPath+'/'+req.body.compound+'.*'],{force:true});
      
      var l = PapyrusMainFile.PapyrusTable.length;

      for (var i=0;i<l;i++){
        if (PapyrusMainFile.PapyrusTable[i].Ref === req.body.compound) {
          PapyrusMainFile.PapyrusTable.splice(i,1);
        }
      }
      
      fs.writeFile(PapyrusTablePath,JSON.stringify(PapyrusMainFile.PapyrusTable), (err) => {
        if (err) throw err;
        console.log('INFO : PapyrusTable updated !');
      });
      
      var nameIndex = projects.names.indexOf(req.session.user);
      var index = projects.refs[nameIndex].indexOf(req.body.compound);
      
      projects.refs[nameIndex].splice(index,1);
      
      fs.writeFile(projectsPath,JSON.stringify(projects), (err) => {
        if (err) throw err;
        console.log('INFO : ImageRef JSON of user '+req.session.user+' updated !');
      });
  
      res.sendStatus(200);  
    }
    else {res.redirect(mainPath);}

  });
  
  router.post(metadatasPath,function(req,res){ // Prototype to modify metadatas of one papyrus;
    
    if(req.session.isAuthenticated === "Success"){
      res.sendStatus(200);  
    }
    else {res.redirect(mainPath);}
    
  });
	return router;
})();
