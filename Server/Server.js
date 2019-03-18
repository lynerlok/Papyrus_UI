var https = require('https');
var fs = require('fs');
var port = 8081;

var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options,function (request, response) {
  if (request.url == '/') {request.url = "index.html"};
  if (! request.url.includes(".ico") || ! request.url.includes("item.")) {
    fs.readFile('../Public/' + request.url, function(err, data) {
      if (!err) {
        var dotoffset = request.url.lastIndexOf('.');
        var mimetype = dotoffset == -1
                        ? 'text/plain'
                        : {
                            '.html' : 'text/html',
                            '.jpg' : 'image/jpeg',
                            '.JPG' : 'image/jpeg',
                            '.png' : 'image/png',
                            '.PNG' : 'image/png',
                            '.css' : 'text/css',
                            '.js' : 'text/javascript'
                            }[ request.url.substr(dotoffset) ];
        response.writeHead(200, {
                                  'Content-Type': mimetype,
                                  'X-Content-Type-Options' : 'nosniff',
                                  'X-Frame-Options' : 'DENY',
                                  'X-XSS-Protection' : '1; mode=block'
                                })
        response.end(data);
      } else {
          console.error('file not found: ' + request.url);
          response.writeHead(404, "Not Found");
          response.end();
      }
    });
  }
  else {response.end()};
}).listen(port); 
