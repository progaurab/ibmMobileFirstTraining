var express = require('express');
var http = require('http');
var request = require('request');

var app = express();
var server = http.createServer(app);
var mfpServer = "http://9.27.87.157:9080";
var mfpServerRuntime = "mfp";
var appName = "HelloCordova";
var port = 9081;
var appURL = 'http://localhost:' + port + '/' + appName + '/';
var mfpLiveupdateServerRuntime = mfpServerRuntime + "/api/mfpliveupdate";

server.listen(port);
app.use('/' + appName, express.static(__dirname + '/../../../../www'));
console.log('::: proxy.js ::: Listening on port ' + port);

// Reverse proxy, pipes the requests to/from MobileFirst Server
app.use('/' + mfpServerRuntime + '/*', function(req, res) {
    var url = mfpServer + req.originalUrl;
    if (url.includes(mfpLiveupdateServerRuntime)) {
        url = url.replace(mfpServerRuntime + "/api/", "")
    }
    console.log('::: proxy.js ::: Passing request to URL: ' + url);
    req.pipe(request[req.method.toLowerCase()](url, function (error, response, body) {
        if (error) {
            if (error.code === 'ECONNREFUSED'){
                console.error('Connection refused: \n', error);
                process.exit(1);
            } else {
                throw error;
            }
        }
    })).pipe(res);
});

console.log('Access your application at this URL: ', appURL);
console.log('Press Ctrl+C to shut down server');
