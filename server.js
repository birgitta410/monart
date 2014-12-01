
var ws = require('ws');
var http = require('http');
var express = require('express');
//var module = require('module');
var path = require('path');
var _ = require('lodash');
var haringGocdMapper = require('./server/haring/gocdMapper');
var miroGocdMapper = require('./server/miro/gocdMapper');
var gocdReader = require('./server/gocdReader');

function artwiseServer() {

  var WebSocketServer = ws.Server
    , app = express();

  var rootDir = path.resolve(path.dirname(module.uri));
  app.use(express.static(rootDir + '/app/'));
  var server = http.createServer(app);

  /** HARING ************************/
  var UPDATE_INTERVAL_HARING = 10000;
  var CACHE_INITIALISED = false;

  function listenToHaring() {
    var wssHaring = new WebSocketServer({server: server, path: '/haring'});
    console.log('haring websocket server created');

    haringGocdMapper.readHistoryAndActivity().then(function(activityHaring) {
      console.log('INITIALISED DATA');
      CACHE_INITIALISED = true;
    });

    wssHaring.on('connection', function(ws) {
      console.log('connected to /haring');

      function newClient() {

        function getActivityAndUpdateClients() {
          if(CACHE_INITIALISED) {
            haringGocdMapper.readHistoryAndActivity().then(function (activityHaring) {
              ws.send(JSON.stringify({haring: activityHaring}), function () {
              });
            });
          } else {
            ws.send(JSON.stringify({ loading: true }));
          }
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

  /** ENDPOINTS ************************/

  function readAndRespond(promiseFunction, res) {
    if(CACHE_INITIALISED) {
      promiseFunction().then(function (data) {
        respondWithJson(res, data);
      });
    } else {
      res.send('warming up');
    }
  }

  function respondWithJson(response, data) {
    response.set({
      'Content-Type': 'application/json'
    });
    response.send(JSON.stringify(data));
  }

  app.get('/alive',
    function(req, res) {
      console.log('life sign');
      res.send('OK');
    });

  app.get('/data/gocd', function(req, res) {
    readAndRespond(gocdReader.readData, res);
  });

  app.get('/data/gocd/haring', function(req, res) {
    readAndRespond(haringGocdMapper.readHistoryAndActivity, res);
  });

  app.get('/data/gocd/miro', function(req, res) {
    readAndRespond(miroGocdMapper.readHistoryAndActivity, res);
  });

  app.get('/data/cctray', function(req, res) {
    readAndRespond(gocdReader.readActivity, res);
  });

  var port = process.env.PORT || 5000
  server.listen(port);

  console.log('http server listening on %d', port);

};

artwiseServer();