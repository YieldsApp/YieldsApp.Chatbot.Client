var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');
var express = require('express');
var cookieSession = require('cookie-session')
var router = require('./routes');

if (process.env.FEenv != 'prod') {
    require('dotenv').config();
}

var app = express();
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'));
app.set('trust proxy', 1) // trust first proxy
app.use(cookieSession({
    name: 'session',
    keys: ["YieldsAppChatBot"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use('/', router);

var port = process.env.port || 9090;

if (process.env.FEenv != 'prod') {
    var fs = require('fs');
    //TODO:to remove it 
    var privateKey = fs.readFileSync('certificates\\alice.key', 'utf8');
    var certificate = fs.readFileSync('certificates\\alice.crt', 'utf8');
    var credentials = { key: privateKey, cert: certificate };
    var httpsServer = https.createServer(credentials, app);
    httpsServer.listen(port);
    console.log('https listening...',port)
}
else {
    var httpServer = http.createServer(app).listen(port, function () {
        console.log("server run...");
    });
}
