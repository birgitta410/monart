
var ws = require('ws');
var http = require('http');
var express = require('express');
//var module = require('module');
var path = require('path');
var _ = require('lodash');
var haringGocdMapper = require('./server/haring/gocdMapper');
var miroGocdMapper = require('./server/miro/gocdMapper');
var miroGocdMapperConstellation = require('./server/miro/gocdMapperConstellation');
var gocdReader = require('./server/gocdReader');

function artwiseServer() {

  var WebSocketServer = ws.Server
    , app = express();

  var rootDir = path.resolve(path.dirname(module.uri));
  app.use(express.static(rootDir + '/app/'));
  var server = http.createServer(app);

  var CACHE_INITIALISED = false;
  var UPDATE_INTERVAL = 10000;

  function createListener(identifier, dataReader) {
    return function() {

      var wss = new WebSocketServer({server: server, path: '/' + identifier});
      console.log(identifier +' websocket server created');

      dataReader().then(function() {
        console.log('INITIALISED DATA');
        CACHE_INITIALISED = true;
      });

      wss.on('connection', function(ws) {
        console.log('connected to /' + identifier);

        function newClient() {

          function getActivityAndUpdateClients() {
            dataReader().then(function(data) {
              var result = {};
              result[identifier] = data;
              ws.send(JSON.stringify(result), function() {  });
            }).fail(function() {
              console.error('ERROR reading and transforming data', arguments);
            });
          }

          getActivityAndUpdateClients();
          var clientId = setInterval(getActivityAndUpdateClients, UPDATE_INTERVAL);
          return clientId;
        }

        var clientId = newClient();

        console.log('websocket connection open on /' + identifier);

        ws.on('message', function(msg) {
          if(msg === 'ping') {
            console.log('PING');
            ws.send(JSON.stringify({ping: 'success'}));
          }
        });

        ws.on('close', function() {
          console.log('websocket connection close on /' + identifier);
          clearInterval(clientId);
        });
      });
    }
  }

  /** HARING ************************/

  var CACHE_INITIALISED = false;

  var listenToHaring = createListener('haring', haringGocdMapper.readHistoryAndActivity);
  listenToHaring();

  /** MIRO BLUE ************************/

  var listenToMiro = createListener('miro', miroGocdMapperConstellation.readHistoryAndActivity);
  listenToMiro();

  var listenToMiroBlue = createListener('miroBlue', miroGocdMapper.readHistoryAndActivity);
  listenToMiroBlue();

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

  var port = process.env.PORT || 5000;
  server.listen(port);

  console.log('http server listening on %d', port);

}

artwiseServer();
