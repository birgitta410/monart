var request = require('request');
var xml2json = require('xml2json');
var fs = require('fs');

var ccTrayRequestor = ccTrayRequestorCreator(request, xml2json, fs);

exports.create = ccTrayRequestorCreator;
exports.get = ccTrayRequestor.get;

function ccTrayRequestorCreator(request, xml2json, fs) {

  var config = require('../httpConfig.js').create('cc');
  var url = config.get().url; // ccTray file URL from config file

  if(ccTrayRequestor !== undefined) {
    return ccTrayRequestor;
  }

  var get = function(callback) {

    console.log('Requesting', url);

    if (config.get().fakeIt()) {
      getFake(callback);
    } else {

      request(url, function (error, response, body) {
        var json = xml2json.toJson(body, {
          object: true, sanitize: false
        });
        callback(json);
      });
    }
  };

  function getFake(callback) {
    console.log('FAKING cctray.xml');
    var xml = fs.readFileSync('server/sources/cc/cctray.xml');
    var json = xml2json.toJson(xml, {
      object: true, sanitize: false
    });

    callback(json);
  }

  return {
    get: get
  }
}

