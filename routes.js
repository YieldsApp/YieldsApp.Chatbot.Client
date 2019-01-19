var express = require('express');
var router = express.Router();
var http = require('http');
var request = require('request');
var token = process.env.TOKEN;
var botName = process.env.BOT_NAME;
const Agent = require('agentkeepalive').HttpsAgent;

var baseUrl = process.env.BASE_URL;

const keepaliveAgent = new Agent({
    maxSockets: 80,
    maxFreeSockets: 10,
    timeout: 60000,
    freeSocketKeepAliveTimeout: 30000,
});

router.get('/', function (req, res) {
    res.render('try');
});
router.get('/chat', function (req, res) {
    res.render('chat');
});

router.post('/create', function (req, res) {
    request.post({
        url: process.env.BASE_URL + "conversations",
        headers: { Authorization: "Bearer " + process.env.TOKEN },
        agent: keepaliveAgent
    }, function (error, response, body) {
        if (error) {
            res.status(500).send(error);
        } else {
            
            converstation = JSON.parse(body);
            req.session.conversationId = converstation.conversationId
            req.session.watermark = 0;
            console.log('create', req.session)
            res.send("");
        }
    });
});
setTimeout(() => {
    if (keepaliveAgent.statusChanged) {
        console.log('[%s] agent status changed: %j', Date(), keepaliveAgent.getCurrentStatus());
    }
}, 2000);



router.post('/sendMessage', function (req, res) {
    request.post({
        url: process.env.BASE_URL + "conversations/" + req.session.conversationId + "/activities",
        body: JSON.stringify({
            "type": "message",
            "from": { "id": "user1" },
            "text": req.body.message
        }),
        headers: {
            "Authorization": "Bearer " + process.env.TOKEN,
            "Content-Type": "application/json"
        },
        agent: keepaliveAgent
    }, function (error, response, body) {
        if (error) {
            res.status(500).send(error);
        } else {
            console.log('send', req.session)
            res.send("");
        }
    });
});

router.get('/receiveMessage', function (req, res) {
    var url = process.env.BASE_URL + "conversations/" + req.session.conversationId + "/activities?watermark=" + req.session.watermark;

    request.get({
        url: url,
        headers: { Authorization: "Bearer " + process.env.TOKEN },
        agent: keepaliveAgent
    }, function (error, response, body) {
        if (error) {
            res.status(500).send(error);
        } else {
            var messages = JSON.parse(body);
            if (messages.activities && messages.activities.length) {
                messages.activities = messages.activities.filter(function (message) {
                    return message.from.id == botName;
                });
                var watermark = messages.watermark;
                req.session.watermark = watermark;
                console.log(messages);
                res.send(messages)
            } else {
                res.send("");
            }
        }
    })
});

module.exports = router;
