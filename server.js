var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/'));

var server = http.createServer(app);
server.listen(port);

console.log('http server listening on %d', port);

var mapper = require('./server/mapper.js');

var wss = new WebSocketServer({server: server});
console.log('websocket server created');


wss.on('connection', function(ws) {

    function newClient() {
      var numberOfUpdatesMade = 0;

      function getEmailsAndUpdateClients() {
        numberOfUpdatesMade ++;

        if (numberOfUpdatesMade < 20) {
        console.log('checking for updates (' + numberOfUpdatesMade + ')');
        var currentData = mapper.readEmail(function(emailData, changes) {
            if(changes || numberOfUpdatesMade <= 2) {
              console.log('CHANGES!');
              ws.send(JSON.stringify(emailData), function() {  });    
            } else {
              console.log('no changes');
            }
          });
        }
      }

      getEmailsAndUpdateClients();
      var id = setInterval(getEmailsAndUpdateClients, 5000);
      return id;
    }

    var clientId = newClient();

    
    console.log('websocket connection open');

    ws.on('close', function() {
        console.log('websocket connection close');
        clearInterval(clientId);
    });
});
