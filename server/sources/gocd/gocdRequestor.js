var request = require('request');
var xml2json = require('xml2json');
var gocdRequestor = gocdRequestorCreator(xml2json, request);

exports.create = gocdRequestorCreator;
exports.get = gocdRequestor.get;

function gocdRequestorCreator(xml2json, request) {

  var config = require('../httpConfig.js').create('gocd');
  var STAGES_ENDPOINT = '/go/api/pipelines/artwise/stages.xml';

  if(gocdRequestor !== undefined) {
    return gocdRequestor;
  }

  var get = function(next, callback) {

    var url = next ? config.addCredentialsToUrl(next) : config.get().url;

    console.log('Requesting', url);

    request(url + STAGES_ENDPOINT, function(error, response, body) {
      var json = xml2json.toJson(body, {
        object: true, sanitize: false
      });
      callback(json);
    });
  };

  return {
    get: get
  }
}

