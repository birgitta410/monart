
var http = require('http');
var _ = require('lodash');
var Q = require('q');
var request = require('request');
var configReader = require('./ymlHerokuConfig');

function dashboardServer() {

  var envs = configReader.create('environments').get();

  function checkUrl(env) {
    var defer = Q.defer();

    var url = _.find(envs, function(entry) {
      return entry[env] !== undefined;
    })[env];

    var requestOptions = {
      url: url,
      rejectUnauthorized: false,
      timeout: 10000
    };

    request(requestOptions, function (error, response, body) {
      if(error) {
        defer.reject('failed to get ' + requestOptions.url, error);
      } else {
        defer.resolve(body);
      }
    });

    return defer.promise;

  }

  var extendServer = function(app) {
    app.get('/health/:env', function(req, res) {
      checkUrl(req.params.env).then(function(result) {
        var healthData = JSON.parse(result);
        res.send('OK - ' + JSON.stringify(healthData));
      }).fail(function(message) {
        res.send('NOT OK - ' + message);
      });
    });

    app.get('/web/:env', function(req, res) {

      function checkBuildJs() {
        checkUrl(req.params.env, '/build.js').then(function(result) {
          var buildVersionIndex = result.indexOf('buildVersion');
          if(buildVersionIndex < 0) {
            res.send('NOT OK');
          } else {
            res.send('OK - ' + result.substr(buildVersionIndex));
          }
        });
      }

      checkUrl(req.params.env, '/build.txt').then(function(result) {
        if(result.indexOf('build') === 0) {
          res.send('OK - ' + result);
        } else {
          checkBuildJs();
        }
      }).fail(function() {
        checkBuildJs();
      });
    });
  };

  return {
    extendServer: extendServer
  }

}

exports.extendServer = dashboardServer().extendServer;