var fs = require('fs');
var xml2json = require('xml2json');
var ccTrayRequestor = ccTrayRequestorCreator(fs, xml2json);

exports.create = ccTrayRequestorCreator;
exports.get = ccTrayRequestor.get;

function ccTrayRequestorCreator(fs, xml2json) {

  if(ccTrayRequestor !== undefined) {
    return ccTrayRequestor;
  }

  var get = function(callback) {
    var xml = fs.readFileSync('server/sources/cc/cctray.xml');
    var json = xml2json.toJson(xml, {
      object: true, sanitize: false
    });

    callback(json);
  };

  return {
    get: get
  }
}

