
var ws = require('ws');
var https = require('https');
var http = require('http');
var express = require('express');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var Q = require('q');

var haringGocdMapper = require('./server/haring/gocdMapper');
var boxesGocdMapper = require('./server/boxesMapper');
var miroGocdMapper = require('./server/miro/gocdMapper');
var miroGocdMapperConstellation = require('./server/miro/gocdMapperConstellation');
var configReader = require('./server/ymlHerokuConfig');
var gocdCreator = require('./server/gocdReader');
var environmentReader = require('./server/environmentReader');

function artwiseServer() {

  var WebSocketServer = ws.Server
    , app = express();

  var UPDATE_INTERVAL = 10000;
  var USES_SSL = false;
  var port = process.env.PORT || 5000;

  var config = configReader.create('gocd').get();

  function createServer() {
    var rootDir = path.resolve(path.dirname(module.uri));
    app.use(express.static(rootDir + '/app/'));

    try {
      var credentials = {
        key: fs.readFileSync('artwise-key.pem'),
        cert: fs.readFileSync('artwise-cert.pem')
      };
      USES_SSL = true;
      return https.createServer(credentials, app);
    } catch(couldNotReadKeyAndCert) {
      console.log("WARNING - could not use SSL, provide artwise-key.pem and artwise-cert.pem");
      return http.createServer(app);
    }

  }

  var server = createServer();

  var CACHE_INITIALISED = false;
  var gocd;
  gocdCreator(config).then(function(instance) {
    console.log("GO CD DATA CACHE INITIALISED");
    console.log((USES_SSL ? 'https' : 'http') + ' server listening on %d', port);

    CACHE_INITIALISED = true;
    gocd = instance;

    function createListener(identifier, dataTransformer) {
      return function() {

        var wss = new WebSocketServer({server: server, path: '/' + identifier });
        console.log(identifier +' websocket server created');

        wss.on('connection', function(ws) {
          console.log('connected to /' + ws.upgradeReq.url);

          function newClient() {

            function getPipelineParameter() {
              var requestedUrl = ws.upgradeReq.url;
              var match = requestedUrl.match(/pipeline=([^&]+)/);
              return match ? match[1] : undefined;
            }

            function getColumnsParameter() {
              var requestedUrl = ws.upgradeReq.url;
              var match = requestedUrl.match(/columns=([^&]+)/);
              return match ? match[1] : undefined;
            }

            var pipelineParameter = getPipelineParameter();
            var pipelines = pipelineParameter ? [pipelineParameter] : gocd.pipelineNames;

            function getActivityAndUpdateClients() {
              var result = {};
              if (CACHE_INITIALISED !== true) {
                result[identifier] = {warmingUp: true};
                ws.send(JSON.stringify(result));
              } else {

                var all = _.map(pipelines, function(pipeline) {
                  return gocd.readData(pipeline);
                });

                Q.all(all).then(function (gocdData) {

                  if(pipelineParameter) {
                    var visualisationData = dataTransformer(gocdData[0], getColumnsParameter());
                    result[identifier] = visualisationData;
                    ws.send(JSON.stringify(result), function () {});
                  } else {
                    result[identifier] = _.map(gocdData, function(data) {
                      var transformedPipelineData = dataTransformer(data, getColumnsParameter());
                      transformedPipelineData.pipeline = data.pipeline;
                      return transformedPipelineData;
                    });
                    ws.send(JSON.stringify(result), function () {});
                  }


                }).fail(function(error) {
                  console.log("COULD NOT READ DATA!", error);
                  ws.send(JSON.stringify({error: error}));
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

    var listenToHaring = createListener('haring', haringGocdMapper.readHistoryAndActivity);
    listenToHaring();

    /** BOXES ************************/

    var listenToBoxes = createListener('boxes', boxesGocdMapper.readHistoryAndActivity);
    listenToBoxes();

    /** MIRO BLUE ************************/

    var listenToMiro = createListener('miro', miroGocdMapperConstellation.readHistoryAndActivity);
    listenToMiro();

    var listenToMiroBlue = createListener('miroBlue', miroGocdMapper.readHistoryAndActivity);
    listenToMiroBlue();

  }).done();


  /** ENDPOINTS ************************/

  function readAndRespondWithPromisedData(promise, res) {
    if(CACHE_INITIALISED) {
      promise.then(function (data) {
        respondWithJson(res, data);
      }).done();
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

  function readDataBasedOnPipeline(req, res, processor) {
    if(!req.query.pipeline) {
      res.send('ERROR - Please provide pipeline');
    } else {
      return readAndRespondWithPromisedData(gocd.readData(req.query.pipeline).then(function(data) {
        return processor ? processor(data) : data;
      }), res);
    }
  }

  app.get('/alive',
    function(req, res) {
      console.log('life sign');
      res.send('OK');
    });


  app.get('/data/gocd', function(req, res) {
    readDataBasedOnPipeline(req, res);
  });

  app.get('/data/gocd/haring', function(req, res) {
    readDataBasedOnPipeline(req, res, function(data) {
      return haringGocdMapper.readHistoryAndActivity(data);
    });
  });

  app.get('/data/gocd/boxes', function(req, res) {
    var all = _.map(gocd.pipelineNames, function(pipeline) {
      return gocd.readData(pipeline).then(function(data) {
        return boxesGocdMapper.readHistoryAndActivity(data);
      });
    });

    Q.all(all).then(function (boxesData) {
      respondWithJson(res, boxesData);
    });

  });

  app.get('/data/gocd/miro', function(req, res) {
    readDataBasedOnPipeline(req, res, function(data) {
      return miroGocdMapperConstellation.readHistoryAndActivity(data);
    });
  });

  app.get('/data/gocd/miroBlue', function(req, res) {
    readDataBasedOnPipeline(req, res, function(data) {
      return miroGocdMapper.readHistoryAndActivity(data);
    });
  });

  environmentReader.extendServer(app);

  server.listen(port);

}

artwiseServer();
