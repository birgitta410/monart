var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/'));

var server = http.createServer(app);
server.listen(port);

console.log('http server listening on %d', port);

var haringGocdMapper = require('./server/haring/gocdMapper.js');
var wssHaring = new WebSocketServer({server: server, path: '/haring'});
console.log('haring websocket server created');

wssHaring.on('connection', function(ws) {
  console.log('connected to /haring');

  function newClient() {

    function getActivityAndUpdateClients() {
      haringGocdMapper.readActivity(function(activityData, doChangesExist) {
        if(doChangesExist) {

          haringGocdMapper.readHistory(function(historyData) {
            activityData.figures = activityData.figures.concat(historyData.figures);
            activityData.background = historyData.background;
            ws.send(JSON.stringify(activityData), function() {  });
          });

        } else {
          console.log('no changes');
        }
      });
    }

    function getHistoryAndUpdateClients() {

      haringGocdMapper.readHistory(function(historyData, doChangesExist) {
        if(doChangesExist) {
          ws.send(JSON.stringify(historyData), function() {  });
        } else {
          console.log('no changes');
        }
      });

    }

    getActivityAndUpdateClients();
    var id = setInterval(getActivityAndUpdateClients, 5000);
    return id;
  }

  var clientId = newClient();

  console.log('websocket connection open on /haring');

  ws.on('close', function() {
    console.log('websocket connection close on /haring');
    clearInterval(clientId);
  });
});

/**************************/
var mondrianEmailMapper = require('./server/mondrian/emailMapper.js');

var wssMondrian = new WebSocketServer({server: server, path: '/mondrian'});
console.log('mondrian websocket server created');

wssMondrian.on('connection', function(ws) {

    function newClient() {
      var numberOfUpdatesMade = 0;

      function getEmailsAndUpdateClients() {
        numberOfUpdatesMade ++;

        // if (numberOfUpdatesMade < 5) {
        console.log('checking for updates (' + numberOfUpdatesMade + ')');
        var currentData = mondrianEmailMapper.readEmail(function(emailData, doChangesExist) {
            if(doChangesExist || numberOfUpdatesMade <= 2) {
              console.log('CHANGES!');
              ws.send(JSON.stringify(emailData), function() {  });    
            } else {
              console.log('no changes');
            }
          });
        // }
      }

      getEmailsAndUpdateClients();
      var id = setInterval(getEmailsAndUpdateClients, 5000);
      return id;
    }

    var clientId = newClient();

    console.log('websocket connection open on /mondrian');

    ws.on('close', function() {
        console.log('websocket connection close on /mondrian');
        clearInterval(clientId);
    });
});

GLOBAL.TODAY_EXTERNAL = 20;
GLOBAL.TODAY_INTERNAL = 20;

app.get('/fake/today/external/:num',
  function(req, res) {
    console.log('faked it', req.params.num);
    GLOBAL.TODAY_EXTERNAL = req.params.num;
    res.send('Set external emails today to ' + req.params.num);
  });

app.get('/fake/today/internal/:num',
  function(req, res) {
    console.log('faked it', req.params.num);
    GLOBAL.TODAY_INTERNAL = req.params.num;
    res.send('Set internal emails today to ' + req.params.num);
  });

