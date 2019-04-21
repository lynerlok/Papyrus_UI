/*
 * ServerExpress.js
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

/* This file contain the core for NodeJS server. 
 * It uses some package : 
 * ** Express to facilitate development.
 * ** FS to manipulate filesystem.
 * ** HTTPS to create HTTPS connection with client.
 * **
 */
 
 // Continuer le comment !!
 
var express = require("express");
var fs = require("fs");
var del = require('del');

var https = require('https');

var bodyParser = require('body-parser');
var uuid = require('uuid/v4');
var crypto = require('crypto');

var jsonFile = fs.readFileSync(__dirname + '/passwd.json', 'utf8');
var creds = JSON.parse(jsonFile);

var cookieParser = require('cookie-parser');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var router = require(__dirname + '/Route.js');
var app = express();

var portHTTPS = 8443;

var secret = crypto.randomBytes(32);

del.sync([__dirname + '/sessions/**','!'+__dirname + '/sessions']);

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

app.use(express.static(__dirname + '/../Client',options));
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
