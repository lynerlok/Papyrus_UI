/*
 * ServerExpress.js
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

/* This file contain the core for NodeJS server. 
 * It uses some package : 
 * ** Express to facilitate development.
 * ** FS to manipulate filesystem.
 * ** HTTPS to create HTTPS connection with client.
 * ** body-parser to parse body on POST request.
 * ** crypto and uuid to generate number.
 */
 
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

console.log("Running Server...");
console.log("Removing old sessions if exist...");

del.sync([__dirname + '/sessions/**','!'+__dirname + '/sessions']);

console.log("Setting options...");

var serverCredentials = {
  key: fs.readFileSync('Certs/key.pem'),
  cert: fs.readFileSync('Certs/cert.pem')
};

console.log("Associate options to the Node app...");

var expiryDate = new Date( Date.now() + 60 * 60 * 1000 * 12); // 12 hour

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
  saveUninitialized: true,
  cookie: { secure: true,
            httpOnly: true,
            domain: '127.0.0.1',
            expires: expiryDate
          }
}));
app.disable('x-powered-by'); // Disable x-powered-by header to avoid fingerprinting (but not totaly);
app.use(router);

console.log("Create HTTPS server...");

https.createServer(serverCredentials, app).listen(portHTTPS,"127.0.0.1"); // Node only accept real IP address and not resolve name (like localhost) in native configuration !

console.log("Done !");
