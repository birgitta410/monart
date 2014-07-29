
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

    getActivityAndUpdateClients();
    var clientId = setInterval(getActivityAndUpdateClients, 5000);
    return clientId;
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
        mondrianEmailMapper.readEmail(function(emailData, doChangesExist) {
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
      var clientId = setInterval(getEmailsAndUpdateClients, 5000);
      return clientId;
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
