/*
 * Route.js
 *
 * Copyright (C) 2019 Elisabeth Gueux, Salome Mialon, Quentin Piet, Axel Polin
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

/* This file contain all route used by the server in ServerExpress.js;
 * Please refer to the manual at https://github.com/axel-polin/Papyrus_UI/wiki for further informations;
 * For question contact : univ_apolin@protonmail.com or directly on github with issue !
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

//var helmet = require('helmet');

var router = express.Router(); // Use Router to set route for the server;

var exec = require('child_process').exec;
function puts(error, stdout, stderr) { console.log("[INFO] Execute convert on image : Out: " + stdout + '\n' + "Error: " + stderr) }

// End dependancies;

// Utility path for the server (part 2 see part 1 in ServerExpress.js). Edit at your own risk !

// System path
//    Mandatory path;

var passwordPath = __dirname + '/passwd.json';
var projectsPath = __dirname + '/projects.json';
var PapyrusTablePath = __dirname + '/PapyrusTable.json';
var datasPath = __dirname + '/../Client/secure/Datas';
var convertPath = '/usr/bin/convert';

//    Scripts path;

var pythonPathNode = '/usr/bin/python3.6';
var tresholdScriptPath = __dirname + '/Scripts/treshold.py';

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
var destroyImgPath = '/secure/removeImg';
var metadatasPath = '/secure/metadatas';

//    Script path to run script on the server (not system path);

var tresholdPath = '/secure/treshold';

// Read the user/password file and the projects file;

var jsonFile = fs.readFileSync(passwordPath, 'utf8');
var creds = JSON.parse(jsonFile);

var jsonFile = fs.readFileSync(projectsPath, 'utf8');
var projects = JSON.parse(jsonFile);

module.exports = (function() { // Module creation for the main file of the server;
/*
 * name: module.exports
 * @param : nothing
 * @return : nothing
 * This the core function of the Router;
 *
 */

// **** BEGIN router.use ****

  router.use(function(req, res, next) {
/*
 *
 * name: router.use
 * @param
 * @return
 * All of the traffic throw in this function;
 *
 */
    // See https://www.owasp.org/index.php/OWASP_Secure_Headers_Project ;

    // [DANGER SECTION] EDIT HEADERS at your OWN risks

		res.setHeader('Referrer-Policy', 'no-referrer'); // or same-origin ( send or not send the referrer that is the question );
		res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
		res.setHeader('X-Frame-Options', 'deny');
		res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
		res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubdomains');

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
		res.setHeader('Pragma', 'no-cache');
		res.setHeader('Expires', 0);
		res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('Feature-Policy', "camera: 'none'; payment: 'none'; microphone: 'none'");
		res.setHeader('Content-Security-Policy', "default-src 'self' data:; font-src 'self' use.fontawesome.com ; style-src 'self' use.fontawesome.com www.w3schools.com 'unsafe-inline'; script-src 'self' code.angularjs.org ajax.googleapis.com 'unsafe-inline'");

    res.setHeader('Public-Key-Pins', 'pin-sha256="qvFAlNcPepF8XPAe+Hj/1sOMoIzPKqAlhl3hsFEH7tg="; \
								pin-sha256="LM/+L4/KK/O1MlrufMk7UXkgrsF9U/4IBwHR7VIIfLc="; \
								pin-sha256="QRG3nNFoIoIiF4677675m9NC8qBlirSJPYIxvG498ZY="; \
								max-age=36500'); // Change pins according your certificate;

    if (req.session.isAuthenticated === "Success") res.setHeader('X-CSRF-Token', req.session.csrfToken); // CSRF protection don't REMOVE !
// CSRF protection is set only for logged users but you should set for non-logged user too;

    return next();
  });

  //router.use(helmet()); // Or you can use helmet but be careful at the setup; uncomment helmet in the top of the document;

  router.use('/secure', function (req, res, next) { // For all request on /secure/* ...
/*
 *
 * name: router.use
 * @param
 * @return
 * All of the traffic throw in this function;
 *
 */
    if (req.session.isAuthenticated === "Success"){ // ... if the user is authenticated ...
        return next(); // ... continue
    } else {
      res.status(403).send('Hmm sorry access denied !'); // ... else send 403 access denied
    };

  });

  router.use(express.static(__dirname + '/../Client/')); // See router.use -^  and express.static in the express API

// **** END router.use ****

// **** BEGIN router.get and router.post see Express API

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

  router.get('/csrf',function(res,res){ // A simple route to get the header for the CSRF protection;
    return res.sendStatus(200); // Simply return 200 Ok (and a header);
  });

  router.get(refPath, function(req,res){ // Route : when get the papyrus images references path send references;
    var i=0;
    var j=0;
    var JsonTableSend = [];

    if (req.session.isAuthenticated === "Success"){

      var index = projects.names.indexOf(req.session.user); // Get the index of the project in the projects array (in projects.json)

      if (projects.refs[index][0] === "all"){ // If the reference is all send the entire papyrus array;
        JsonTableSend = PapyrusMainFile.PapyrusTable;
      }
      else { // Else get only the reference set by user (this option is not implemented client-side yet);
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

  router.get(logoutPath, function(req, res){ // Route : when GET '/logout' redirect to '/';
    var user = req.session.user;
	   req.session.destroy(function(){ // On logout remove session file server side;
	      console.log("[INFO] : "+user+" logged out."); // Log in server the logout;
	   });
	   res.redirect(mainPath); // Redirect to '/';
	});

  router.post(loginPath,async function(req,res){ // Route : first route check credentials;
    if(req.session.isAuthenticated !== "Success"){ // If the user is login;

      if(!req.body) return res.sendStatus(400); // If the user send no parameters send 400 ERROR;

      // PARAMS
      var user=req.body.username;
      var pwd=req.body.password;

      if (creds.users.includes(user)) { // If the username / project name is present in creds continue
        var index = creds.users.indexOf(user);
        try {
          if (await argon2i.verify(creds.passwords[index],pwd)) { // Check if password match with the password in the server JSON;
            // SET PARAMS in req.session

            req.session.isAuthenticated = "Success";
            req.session.user = user;
            // Make CSRF protection token;
            var secret = crypto.randomBytes(32);
            var salt = crypto.randomBytes(32);
            req.session.csrfToken = await argon2i.hash(secret, salt);
            // END CSRF TOKEN GENERATION;


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

    }
    else {return res.send("Vous êtes déjà identifié").status(200)}

	});

  router.post(tresholdPath,function(req,res){ // Route : when POST treshold (body contains img ref) make some action and send 200 OK;
    if(req.session.isAuthenticated === "Success"){ // If the user is login;

      var img = req.body.img; // The body contain the image path.

      if (!req.body.csrf) return res.sendStatus(400);
      var csrf = req.body.csrf;
      if (csrf !== req.session.csrfToken) return res.sendStatus(400);

      var imgSplit = img.split('/',10); // img path processing to extract only the image name (XXXX_X_XX.JPG for example)

      var imgSplit2 = imgSplit[5].split('.',10); // img path processing to extract only the file name without extension (for rename function below)
      img = imgSplit2[0];

      var len = PapyrusMainFile.PapyrusTable.length;

      var imgToScript = datasPath + '/' + imgSplit[imgSplit.length-1]; // Get the path of the image for the script input;

      if (imgToScript.includes('Treshold')) { // If the path of the image already contain the word 'Treshold' don't proceed;
        console.log('Treshold script execution aborted!  This image is already a tresholded version!');
        return;
      }

      var d = new Date();
      var currentTime = d.getTime(); // Get a timestamp to make the image unique;

      // Set options for python-shell
      var options = {
        mode: 'text',
        pythonPath: pythonPathNode,
        pythonOptions: ['-u'],
        args: [`-i ${imgToScript}`, `-o ${datasPath}`]
      };

      PythonShell.run(tresholdScriptPath, options, function (err, results) { // Run the script;
        if (err) throw 'An error occurs on treshold execution :' + err;

        // Save and rename the image;

        fs.rename(datasPath + '/out.png',datasPath + '/Treshold_on_' + img + '_' + currentTime + '.png', function (err) {
          if (err) throw 'ERROR [TRESHOLD] : An occur when Node rename out.png into tresholded image : ' + err;
          console.log("INFO [TRESHOLD] : Image "+ img +" tresholded and renamed");
        });

        // Alter the projects array;

        var index = projects.names.indexOf(req.session.user);
        projects.refs[index].push('Treshold_on_' + img + '_' + currentTime);

        // Save the projects array;

        fs.writeFile(projectsPath,JSON.stringify(projects), (err) => {
          if (err) throw 'FATAL ERROR [TRESHOLD] : An occur when Node refresh projects file : ' + err;
          console.log('INFO [TRESHOLD] : ImageRef JSON of user '+req.session.user+' updated !');
        });

        // Create a new papyrus for the papyrus table;

        var newPapyrus = {};
        newPapyrus['Ref']='Treshold_on_' + img + '_' + currentTime;
        newPapyrus['THB']='Treshold_on_' + img + '_' + currentTime + '_thb';
        newPapyrus['RCL']= 'Datas/Treshold_on_' + img + '_' + currentTime + '.png';
        newPapyrus['VCL']='null';
        newPapyrus['RIR']='null';
        newPapyrus['VIR']='null';

        newPapyrus['MetaDatas']='null';

        for (var i=0;i<PapyrusMainFile.PapyrusTable.length;i++){ // Search which image in papyrusTable match with our image to set the good metadatas file;
          if (PapyrusMainFile.PapyrusTable[i].RCL.includes(img)){
            newPapyrus['MetaDatas']=PapyrusMainFile.PapyrusTable[i].MetaDatas;
          }
          if (PapyrusMainFile.PapyrusTable[i].VCL.includes(img)){
            newPapyrus['MetaDatas']=PapyrusMainFile.PapyrusTable[i].MetaDatas;
          }
          if (PapyrusMainFile.PapyrusTable[i].RIR.includes(img)){
            newPapyrus['MetaDatas']=PapyrusMainFile.PapyrusTable[i].MetaDatas;
          }
          if (PapyrusMainFile.PapyrusTable[i].VIR.includes(img)){
            newPapyrus['MetaDatas']=PapyrusMainFile.PapyrusTable[i].MetaDatas;
          }
        }

        newPapyrus['Owner']=req.session.user; // Set the owner of the image with user / project name;

        PapyrusMainFile.PapyrusTable.push(newPapyrus); // Push into papyrus table;

        // Save papyrusTable;
        fs.writeFile(PapyrusTablePath,JSON.stringify(PapyrusMainFile.PapyrusTable), (err) => {
          if (err) throw 'FATAL ERROR [TRESHOLD] : An occur when Node refresh PapyrusTable file : ' + err;
          console.log('INFO [TRESHOLD] : PapyrusTable updated !');
        });

        del.sync([datasPath+'out.png','!'+datasPath]); // Remove the output of the script if it exists;

        res.sendStatus(200);
      });
    }
    else {
        console.log('WARNING [TRESHOLD] : Access Denied ('+req.session.user+')');
        res.redirect(mainPath);
    }
	});

	router.post(createProjectPath,async function(req,res){ // Route : for the project creation;
		if(req.session.isAuthenticated === "Success"){

      if (!req.body.csrf) return res.sendStatus(400); // CSRF protection verification
      var csrf = req.body.csrf; // Is actually the good user who make the request or very bas crasher ?;
      if (csrf !== req.session.csrfToken) return res.sendStatus(400); // If it's a very bad crasher return 400 ERROR;

      // GET params;
      var user=req.body.username;
      var pwd=req.body.password;
      var imgRefs=req.body.imgRefs;
      imgRefs = ["all"]; // For the moment set the image choice to 'all';

      var index = creds.users.indexOf(user); // Check if a project exists with the same name;
      if (index === -1){ // If the name doesn't exist hash the password;
        var salt = crypto.randomBytes(32); // Generate a salt with crypto library;
        try {
          var hashPass = await argon2i.hash(pwd, salt);
        } catch(err) {
          console.log("Error while hashing password : "+err);
        }
        creds.users.push(user); // Push user and password in respective array;
        creds.passwords.push(hashPass);

        projects.names.push(user);
        projects.refs.push(imgRefs);

        // Write files to save configuration;

        fs.writeFile(passwordPath,JSON.stringify(creds), (err) => {
          if (err) throw err;
          console.log('INFO [USER CREATED] : Passwords Files Updated !');
        });

        fs.writeFile(projectsPath,JSON.stringify(projects), (err) => {
          if (err) throw err;
          console.log('INFO [USER CREATED] : ImageRef updated !');
        });
        res.redirect(mainPath);
      }
      else {
        res.redirect(interfacePath);
        console.log("WARNING : A user try to register more than one time : "+user);
      }
    }
    else {return res.sendStatus(400)}
	});

  router.post(removeProjectPath, function(req, res){ // Route : when POST rd make some action and redirect to logout;
    if(req.session.isAuthenticated === "Success" && req.session.user !== "main"){ // If the user is log in and the user is not main (main is for creation);

      if (!req.body.csrf) return res.sendStatus(400);
      var csrf = req.body.csrf;
      if (csrf !== req.session.csrfToken) return res.sendStatus(400);

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

  router.post(compUploadPath,function(req,res){ // Route : save a compound send by user on POST wd;

    if(req.session.isAuthenticated === "Success"){

      if(!req.body || req.session.user === "main") return res.sendStatus(400);

      if (!req.body[0].csrf) return res.sendStatus(400);
      var csrf = req.body[0].csrf;
      if (csrf !== req.session.csrfToken) return res.sendStatus(400);

      var img = new Buffer.from(req.body[0].imgCompound, 'base64'); // Get the image in base64;
      var imgArray = req.body[1].areaImages; // Get the canvas configuration;
      var src = req.body[1].src; // Get the image src;

      var d = new Date();
      var currentTime = d.getTime(); // Timestamp;

      // Write the binary image;

      fs.writeFile(datasPath + '/Compound-'+currentTime+'.png',img, "binary", (err) => {
        if (err) throw err;
        console.log('INFO : Compound '+ currentTime + ' saved !');
      });

      // Perform a crop on image with imagemagick convert to keep only the compound and not the blank of the canvas;

      if (fs.existsSync(convertPath)) {
        exec('convert '+ datasPath + '/Compound-'+currentTime+'.png' + ' -trim ' + datasPath + '/Compound-'+currentTime+'.png' , puts);
      }

      // Write the canvas configuration associate to the image;
      fs.writeFile(datasPath + '/Compound-'+currentTime+'.json',JSON.stringify(imgArray), (err) => {
        if (err) throw err;
        console.log('INFO : Image table '+ currentTime + ' saved !');
      });

      // Update the projects array and save it;
      var index = projects.names.indexOf(req.session.user);

      projects.refs[index].push('Compound-'+currentTime);

      fs.writeFile(projectsPath,JSON.stringify(projects), (err) => {
        if (err) throw err;
        console.log('INFO : ImageRef JSON of user '+req.session.user+' updated !');
      });

      // Create a new papyrus, update the array and save it;
      var newPapyrus = {};
      newPapyrus['Ref']='Compound-'+currentTime;
      newPapyrus['THB']='Compound-'+currentTime+'_thb';
      newPapyrus['RCL']= 'null';
      newPapyrus['VCL']='null';
      newPapyrus['RIR']='null';
      newPapyrus['VIR']='null';
      newPapyrus['MetaDatas']='null';
      newPapyrus['Owner']=req.session.user;
      // Choose the good reference for the image according to the source ref;
      if (src.search("r_CL") != -1) {newPapyrus['RCL']= 'Datas' + '/Compound-'+currentTime+'.png'};
      if (src.search("r_IR") != -1) {newPapyrus['RIR']= 'Datas' + '/Compound-'+currentTime+'.png'};
      if (src.search("v_CL") != -1) {newPapyrus['VCL']= 'Datas' + '/Compound-'+currentTime+'.png'};
      if (src.search("v_IR") != -1) {newPapyrus['VIR']= 'Datas' + '/Compound-'+currentTime+'.png'};

      PapyrusMainFile.PapyrusTable.push(newPapyrus);

      fs.writeFile(PapyrusTablePath,JSON.stringify(PapyrusMainFile.PapyrusTable), (err) => {
        if (err) throw err;
        console.log('INFO : PapyrusTable updated !');
      });

      res.sendStatus(200);

    }
    else {res.redirect(mainPath);}

  });

  router.post(destroyCMPPath,function(req,res){ // Route : when POST DestroyCMP remove the compound from server and send the canvas configuration to the client;

    if(req.session.isAuthenticated === "Success"){

      var found = false; // Initialize the variable found : this variable is set to true if the compound exist in the array;

      if(!req.body || req.session.user === "main") return res.sendStatus(400);

      if (!req.body.csrf) return res.sendStatus(400);
      var csrf = req.body.csrf;
      if (csrf !== req.session.csrfToken) return res.sendStatus(400);

      for (var i=0;i<PapyrusMainFile.PapyrusTable.length;i++){
        if (PapyrusMainFile.PapyrusTable[i].Ref === req.body.compound){
          found = true; // The reference is found;
          if (PapyrusMainFile.PapyrusTable[i].Owner !== req.session.user) return res.sendStatus(400); // Check if the user is the owner of the image; If not return 400 ERROR;
        }
      }

      if (! found) return res.sendStatus(400); // If the image is not found in the array return 400 ERROR;

      if ( ! req.body.compound.includes("Compound-")) return res.sendStatus(400); // If the image is not (potentially) a compound return 400 ERROR;

      del.sync([datasPath+'/'+req.body.compound+'.*'],{force:true}); // Remove the image and the json and maybe the metadatas if exits;

      // Update the papyrusTable array and the projects array, and save in respective files;
      var l = PapyrusMainFile.PapyrusTable.length;

      for (var i=0;i<l;i++){
        if (PapyrusMainFile.PapyrusTable[i].Ref === req.body.compound) {
          PapyrusMainFile.PapyrusTable.splice(i,1);
        }
      }

      fs.writeFile(PapyrusTablePath,JSON.stringify(PapyrusMainFile.PapyrusTable), (err) => {
        if (err) throw err;
        console.log('INFO [Destroy Compound] : PapyrusTable updated !');
      });

      var nameIndex = projects.names.indexOf(req.session.user);
      var index = projects.refs[nameIndex].indexOf(req.body.compound);

      projects.refs[nameIndex].splice(index,1);

      fs.writeFile(projectsPath,JSON.stringify(projects), (err) => {
        if (err) throw err;
        console.log('INFO [Destroy Compound] : ImageRef JSON of user '+req.session.user+' updated !');
      });

      res.sendStatus(200);
    }
    else {res.redirect(mainPath);}

  });

  router.post(destroyImgPath,function(req,res){ // Route : when POST destroy image with a image ref to remove in the server;
  // Some of this code is in destroyCMPPath see -^
    if(req.session.isAuthenticated === "Success"){

      var found = false;
      var index = null;
      var imageArray = [];

      if(!req.body || req.session.user === "main") return res.sendStatus(400);

      if (!req.body.csrf) return res.sendStatus(400);
      var csrf = req.body.csrf;
      if (csrf !== req.session.csrfToken) return res.sendStatus(400);

      for (var i=0;i<PapyrusMainFile.PapyrusTable.length;i++){
        if (PapyrusMainFile.PapyrusTable[i].Ref === req.body.ref){
          found = true;
          index = i;
          imageArray.push(PapyrusMainFile.PapyrusTable[i]);

          if (PapyrusMainFile.PapyrusTable[i].Owner !== req.session.user) {return res.sendStatus(400);};
        }
      }

      if (! found) return res.sendStatus(400);

      // Remove all files associate to the image;
      del.sync([datasPath+'/../'+imageArray.RCL],{force:true});
      del.sync([datasPath+'/../'+imageArray.VCL],{force:true});
      del.sync([datasPath+'/../'+imageArray.RIR],{force:true});
      del.sync([datasPath+'/../'+imageArray.VIR],{force:true});
      del.sync([datasPath+'/../'+imageArray.MetaDatas],{force:true});

      // Update papyrusTable array, projects array and save in respective files;

      PapyrusMainFile.PapyrusTable.splice(index,1);

      fs.writeFile(PapyrusTablePath,JSON.stringify(PapyrusMainFile.PapyrusTable), (err) => {
        if (err) throw err;
        console.log('INFO [Destroy Image] : PapyrusTable updated !');
      });

      var nameIndex = projects.names.indexOf(req.session.user);
      var index = projects.refs[nameIndex].indexOf(imageArray.Ref);

      projects.refs[nameIndex].splice(index,1);

      fs.writeFile(projectsPath,JSON.stringify(projects), (err) => {
        if (err) throw err;
        console.log('INFO [Destroy Image] : ImageRef JSON of user '+req.session.user+' updated !');
      });

      res.sendStatus(200);
    }
    else {res.redirect(mainPath);}

  });

  router.post(metadatasPath,function(req,res){ // Prototype to modify metadatas of one papyrus;

    // Just a skeleton nothing append...

    if(req.session.isAuthenticated === "Success"){
      res.sendStatus(200);
    }
    else {res.redirect(mainPath);}

  });

  return router;
})();
