var http = require('http');
var fs = require('fs');
var url = require('url'); 

http.createServer(function (req, res) {
  var page = url.parse(req.url).pathname;
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write();
}).listen(8080); 
