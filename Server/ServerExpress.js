var express = require("express");
var fs = require("fs");
var https = require('https');
var http = require('http');
var {PythonShell} = require('python-shell');
var bodyParser = require('body-parser');
var uuid = require('uuid/v4');
var path = require('path');
var argon2i = require('argon2-ffi').argon2i;
var crypto = require('crypto');

var jsonFile = fs.readFileSync('passwd.json', 'utf8');
var creds = JSON.parse(jsonFile);

var cookieParser = require('cookie-parser');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var router = express.Router();

var app = express();

var portHTTPS = 8443;
var portHTTP = 8081;
var secret = crypto.randomBytes(32);

var serverCredentials = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

var options = {
  dotfiles: 'allow',
  etag: false,
  extensions: false,
  index: "public/index.html",
  maxAge: '1d',
  redirect: true,
  setHeaders: function (res, path, stat) {
    res.set({'X-Content-Type-Options' : 'nosniff',
            'X-Frame-Options' : 'DENY',
            'X-XSS-Protection' : '1; mode=block',
            'Strict-Transport-Security': 'max-age=36500; includeSubdomains; preload',
            'Public-Key-Pins': 'pin-sha256="qvFAlNcPepF8XPAe+Hj/1sOMoIzPKqAlhl3hsFEH7tg="; \
								pin-sha256="LM/+L4/KK/O1MlrufMk7UXkgrsF9U/4IBwHR7VIIfLc="; \
								pin-sha256="QRG3nNFoIoIiF4677675m9NC8qBlirSJPYIxvG498ZY="; \
								max-age=36500'
            })
  }
}

app.use(express.static('../Client/',options));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  genid: (req) => {
    return uuid()
  },
  store: new FileStore(),
  secret: secret.toString('hex'),
  resave: false,
  secure: true,
  saveUninitialized: true}
  ));
app.use(router);

/*
crypto.randomBytes(32, function(err, salt) { 
	if(err) throw err; 
  argon2i.hash("main", salt).then(hash => { 
    console.log(hash); 
  }); 
}); 
*/

router.get('/protected/*', function(req, res){
  if(req.session.isAuthenticated === "Success"){
    res.redirect('/protected/interface.html');
    // res.json({"isAuthenticated": req.session.isAuthenticated, "redirect": "/protected/interface.html"});
   } else {
      console.log("Access Denied !");
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
       // res.json({"isAuthenticated": req.session.isAuthenticated, "redirect": "/protected/interface.html"});
       res.redirect('/protected/interface.html');
      } else {
        res.sendStatus(400);
      }
    } catch (err) {
      console.log("ERROR while verifying hash password : "+err);
    }
    console.log("User name = "+user+", password is "+pwd);
  }
  else {return res.sendStatus(400)}
  
});

router.get('/logout', function(req, res){
   req.session.destroy(function(){
      console.log("user logged out.");
   });
   res.redirect('/');
});

router.use('/protected/*', function(err, req, res, next){
  res.redirect('/');
});

https.createServer(serverCredentials, app).listen(portHTTPS);
http.createServer(app).listen(portHTTP);
