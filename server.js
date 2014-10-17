
define(['ws', 'http', 'express', 'module', 'path', 'lodash', 'server/haring/gocdMapper', 'server/miro/gocdMapper', 'server/sources/gocd/gocdReader'],
  function (ws, http, express, module, path, _, haringGocdMapper, miroGocdMapper, gocdReader) {

  var WebSocketServer = ws.Server
    , app = express();

  var rootDir = path.resolve(path.dirname(module.uri));
  app.use(express.static(rootDir + '/app/'));
  var server = http.createServer(app);

  /** HARING ************************/
  var UPDATE_INTERVAL_HARING = 10000;

  function listenToHaring() {
    var wssHaring = new WebSocketServer({server: server, path: '/haring'});
    console.log('haring websocket server created');

    wssHaring.on('connection', function(ws) {
      console.log('connected to /haring');

      function newClient() {

        function getActivityAndUpdateClients() {
          haringGocdMapper.readHistoryAndActivity().then(function(activityHaring) {
            ws.send(JSON.stringify({ haring: activityHaring }), function() {  });
          });
        }

        getActivityAndUpdateClients();
        var clientId = setInterval(getActivityAndUpdateClients, UPDATE_INTERVAL_HARING);
        return clientId;
      }

      var clientId = newClient();

      console.log('websocket connection open on /haring');

      ws.on('message', function(msg) {
        if(msg === 'ping') {
          console.log('PING');
          ws.send(JSON.stringify({ping: 'success'}));
        }
      });

      ws.on('close', function() {
        console.log('websocket connection close on /haring');
        clearInterval(clientId);
      });
    });
  }

  listenToHaring();

  /** MIRO ************************/

  function listenToMiro() {
    var wssMiro = new WebSocketServer({server: server, path: '/miro'});
    console.log('miro websocket server created');

    wssMiro.on('connection', function(ws) {
      console.log('connected to /miro');

      function newClient() {

        function getActivityAndUpdateClients() {
          miroGocdMapper.readHistoryAndActivity().then(function(activityMiro) {
            ws.send(JSON.stringify({ miro: activityMiro }), function() {  });
          });
        }

        getActivityAndUpdateClients();
        var clientId = setInterval(getActivityAndUpdateClients, 5000);
        return clientId;
      }

      var clientId = newClient();

      console.log('websocket connection open on /miro');

      ws.on('message', function(msg) {
        if(msg === 'ping') {
          console.log('PING');
          ws.send(JSON.stringify({ping: 'success'}));
        }
      });

      ws.on('close', function() {
        console.log('websocket connection close on /miro');
        clearInterval(clientId);
      });
    });
  }

  listenToMiro();

  /** MONDRIAN ************************/
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

  app.get('/alive',
    function(req, res) {
      console.log('life sign');
      res.send('OK');
    });

  app.get('/data/gocd',
    function(req, res) {
      gocdReader.readData().then(function(data) {
        res.set({
          'Content-Type': 'application/json'
        });
        res.send(JSON.stringify(data));
      });
    });

  return server;

});
