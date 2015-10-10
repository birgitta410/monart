
var ws = require('ws');
var http = require('http');
var express = require('express');
var path = require('path');
var _ = require('lodash');
var haringGocdMapper = require('./server/haring/gocdMapper');
var miroGocdMapper = require('./server/miro/gocdMapper');
var miroGocdMapperConstellation = require('./server/miro/gocdMapperConstellation');
var configReader = require('./server/ymlHerokuConfig');
var gocdCreator = require('./server/gocdReader');

function artwiseServer() {

  var WebSocketServer = ws.Server
    , app = express();

  var rootDir = path.resolve(path.dirname(module.uri));
  app.use(express.static(rootDir + '/app/'));
  var server = http.createServer(app);

  var CACHE_INITIALISED = false;
  var UPDATE_INTERVAL = 10000;
  var config = configReader.create('gocd').get();

  var gocd;
  gocdCreator(config).then(function(instance) {
    console.log("GO CD DATA CACHE INITIALISED");
    CACHE_INITIALISED = true;
    gocd = instance;
  });

  function createListener(identifier, dataTransformer) {
    return function() {

      var wss = new WebSocketServer({server: server, path: '/' + identifier});
      console.log(identifier +' websocket server created');

      wss.on('connection', function(ws) {
        console.log('connected to /' + ws.upgradeReq.url);

        function newClient() {

          function getPipelineParameter() {
            var requestedUrl = ws.upgradeReq.url;
            var match = requestedUrl.match(/pipeline=([^&]+)/);
            return match ? match[1] : undefined;
          }

          var pipeline = getPipelineParameter();

          function getActivityAndUpdateClients() {
            var result = {};
            if(CACHE_INITIALISED !== true) {
              result[identifier] = { warmingUp: true };
              ws.send(JSON.stringify(result));
            } else {
              gocd.readData(pipeline).then(function(gocdData) {
                var visualisationData = dataTransformer(gocdData);
                result[identifier] = visualisationData;
                ws.send(JSON.stringify(result), function() {  });
              }).fail(function(e) {
                console.error('ERROR reading and transforming data', e, e.stack);
              });
            }
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

  function readAndRespondWithPromisedData(promise, res) {
    if(CACHE_INITIALISED) {
      promise.then(function (data) {
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
    readAndRespondWithPromisedData(gocd.readData(), res);
  });

  app.get('/data/gocd/haring', function(req, res) {
    readAndRespondWithPromisedData(gocd.readData().then(function(data) {
      return haringGocdMapper.readHistoryAndActivity(data);
    }), res);
  });

  app.get('/data/gocd/miro', function(req, res) {
    readAndRespondWithPromisedData(gocd.readData().then(function(data) {
      return miroGocdMapperConstellation.readHistoryAndActivity(data);
    }), res);
  });

  app.get('/data/gocd/miroBlue', function(req, res) {
    readAndRespondWithPromisedData(gocd.readData().then(function(data) {
      return miroGocdMapper.readHistoryAndActivity(data);
    }), res);
  });

  var port = process.env.PORT || 5000;
  server.listen(port);

  console.log('http server listening on %d', port);

}

artwiseServer();
