var request = require('request');
var xml2json = require('xml2json');
var ccTrayRequestor = ccTrayRequestorCreator(request, xml2json);

exports.create = ccTrayRequestorCreator;
exports.get = ccTrayRequestor.get;

function ccTrayRequestorCreator(request, xml2json) {

  var config = require('../httpConfig.js').create('cc');
  var url = config.get().url; // ccTray file URL from config file

  if(ccTrayRequestor !== undefined) {
    return ccTrayRequestor;
  }

  var get = function(callback) {

    console.log('Requesting', url);

    request(url, function(error, response, body) {
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

