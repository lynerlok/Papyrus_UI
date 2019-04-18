var express = require("express");
var fs = require("fs");
var bodyParser = require('body-parser');
var uuid = require('uuid/v4');
var path = require('path');
var crypto = require('crypto');
var argon2i = require('argon2-ffi').argon2i;
var crypto = require('crypto');
var del = require('del');

var {PythonShell} = require('python-shell');

var jsonFile = fs.readFileSync('passwd.json', 'utf8');
var creds = JSON.parse(jsonFile);

var router = express.Router();

/*

*/

module.exports = (function() {
  router.use(function(req, res, next) {
    res.set({'X-Content-Type-Options' : 'nosniff', // \/!\/ Penser à remettre après les tests !!! 
            'X-Frame-Options' : 'DENY',
            'X-XSS-Protection' : '1; mode=block',
            'Strict-Transport-Security': 'max-age=36500; includeSubdomains; preload',
            'Public-Key-Pins': 'pin-sha256="qvFAlNcPepF8XPAe+Hj/1sOMoIzPKqAlhl3hsFEH7tg="; \
								pin-sha256="LM/+L4/KK/O1MlrufMk7UXkgrsF9U/4IBwHR7VIIfLc="; \
								pin-sha256="QRG3nNFoIoIiF4677675m9NC8qBlirSJPYIxvG498ZY="; \
								max-age=36500'
    })
    next();
  });

  router.get('/secure/ingterface.html', function(req, res){
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
  
  router.get('/logout', function(req, res){
	   req.session.destroy(function(){
	      console.log("user logged out.");
	   });
	   res.redirect('/');
	});
	
  router.get('/secure/rd', function(req, res){
    if(req.session.isAuthenticated === "Success" && req.session.user !== "main"){
      var index = creds.users.indexOf(req.session.user);
      if (index !== -1) creds.users.splice(index, 1);
      if (index !== -1) creds.passwords.splice(index, 1);
      fs.writeFile('passwd.json',JSON.stringify(creds), (err) => {
        if (err) throw err;
        console.log('INFO : Passwords Files Updated !');
      });
      del.sync(["../Client/secure/Projects/"+req.session.user+"/**"],{force:true});
      res.redirect('/logout');
    }
    else {
      res.redirect('/secure/interface.html');
      console.log("WARNING : A user try to delete an other user with no permissions : "+req.session.user);
    }
	});

  router.get('/secure/treshold',function(req,res){
    if(req.session.isAuthenticated === "Success"){
      var img = req.query.img;
      var path = path.join(__dirname, 'secure/Projects/', req.session.user);
      var options = {
        mode: 'text',
        args: [`-i ${img}`, `-o ${path}`]
      };
      pyPath = path.join(__dirname,'/../Client/secure/Scripts/treshold.py');
      PythonShell.run(pyPath, options, function (err, results) {
        if (err) throw err;
      });
    }
    else {
        console.log("WARNING : Access Denied on treshold execution");
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
         var imgJsonFile = fs.readFileSync(__dirname + '/../Client/secure/Projects/'+user+'/img.json', 'utf8');
         var imgRefData = JSON.parse(imgJsonFile);
         console.log(imgRefData);
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
  
  router.get('/login', function(req,res){
    
 	});   

	router.post('secure/metadatas',function(req,res){

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
        fs.writeFile('passwd.json',JSON.stringify(creds), (err) => {
          if (err) throw err;
          console.log('Passwords Files Updated !');
        });
        if (!fs.existsSync("../Client/secure/Projects/"+user)){
		    fs.mkdirSync("../Client/secure/Projects/"+user);
		}
        res.redirect('/logout');
      }
      else {
        res.redirect('/secure/interface.html');
        console.log("WARNING : A user try to register more than one time : "+user);
      }
    }
    else {return res.sendStatus(400)}
	});
  
  router.post('/secure/compound',async function(req,res){
    if(req.session.isAuthenticated === "Success"){
      if(!req.body) return res.sendStatus(400);
      
      var user=req.body.areaImages;
    } else {
      console.log("WARNING : Access Denied on compound !");
      res.redirect('/');
    }
	});
  
	return router;
})();
