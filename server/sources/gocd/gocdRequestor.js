var fs = require('fs');
var xml2json = require('xml2json');
var gocdRequestor = gocdRequestorCreator(fs, xml2json);

exports.create = gocdRequestorCreator;
exports.get = gocdRequestor.get;

function gocdRequestorCreator(fs, xml2json) {

  if(gocdRequestor !== undefined) {
    return gocdRequestor;
  }

  var get = function(next, callback) {
    // TODO: Eventually replace with real HTTP request
    var source = next ? next : 'server/sources/gocd/pipeline-stages.xml';
    var xml = fs.readFileSync(source);
    var json = xml2json.toJson(xml, {
      object: true, sanitize: false
    });

    callback(json);
  };

  return {
    get: get
  }
}
