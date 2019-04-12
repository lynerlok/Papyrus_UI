var express = require("express");
var fs = require("fs");
var https = require('https');

var bodyParser = require('body-parser');
var uuid = require('uuid/v4');
var crypto = require('crypto');

var jsonFile = fs.readFileSync('passwd.json', 'utf8');
var creds = JSON.parse(jsonFile);

var cookieParser = require('cookie-parser');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var router = require(__dirname + '/Route.js');

var app = express();

var portHTTPS = 8443;

var secret = crypto.randomBytes(32);

var serverCredentials = {
  key: fs.readFileSync('Certs/key.pem'),
  cert: fs.readFileSync('Certs/cert.pem')
};

var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: false,
  index: "index.html",
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

app.use(express.static(__dirname + '/../Client'));;
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

https.createServer(serverCredentials, app).listen(portHTTPS);
