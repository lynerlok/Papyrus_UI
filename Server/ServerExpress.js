var express = require("express");
var fs = require("fs");
var bodyParser = require('body-parser');
var multer = require('multer');
var {PythonShell} = require('python-shell');
var app = express();

var https = require('https');
var http = require('http');

var credentials = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

var port = 8443;

var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html'],
  index: "index.html",
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set({'X-Content-Type-Options' : 'nosniff',
            'X-Frame-Options' : 'DENY',
            'X-XSS-Protection' : '1; mode=block',
            'Strict-Transport-Security': 'max-age=365; includeSubdomains; preload',
            'Public-Key-Pins': 'pin-sha256="qvFAlNcPepF8XPAe+Hj/1sOMoIzPKqAlhl3hsFEH7tg="; \
								pin-sha256="LM/+L4/KK/O1MlrufMk7UXkgrsF9U/4IBwHR7VIIfLc="; \
								pin-sha256="QRG3nNFoIoIiF4677675m9NC8qBlirSJPYIxvG498ZY="; \
								max-age=365'
            })
  }
}

app.use(express.static('../Public/',options));

https.createServer(credentials, app).listen(port);
http.createServer(app).listen(8081);
