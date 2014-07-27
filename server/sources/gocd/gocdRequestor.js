var request = require('request');
var xml2json = require('xml2json');
var fs = require('fs');

var gocdRequestor = gocdRequestorCreator(xml2json, request, fs);

exports.create = gocdRequestorCreator;
exports.get = gocdRequestor.get;

function gocdRequestorCreator(xml2json, request, fs) {

  var config = require('../httpConfig.js').create('gocd');
  var STAGES_ENDPOINT = '/go/api/pipelines/' + config.get().pipeline + '/stages.xml';

  if(gocdRequestor !== undefined) {
    return gocdRequestor;
  }

  var get = function(next, callback) {

    if (config.get().fakeIt()) {
      getFake(next, callback);
    } else {

      var url = next ? config.addCredentialsToUrl(next) : config.get().url;

      console.log('Requesting', url + STAGES_ENDPOINT);

      request(url + STAGES_ENDPOINT, function (error, response, body) {
        var json = xml2json.toJson(body, {
          object: true, sanitize: false
        });
        callback(json);
      });

    }
  };

  function getFake(next, callback) {
    console.log('FAKING Go CD Pipeline Feed');
    var source = next ? next : 'server/sources/gocd/pipeline-stages.xml';
    var xml = fs.readFileSync(source);
    var json = xml2json.toJson(xml, {
      object: true, sanitize: false
    });

    callback(json);
  }

  return {
    get: get
  }
}

