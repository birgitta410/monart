var fs = require('fs');
var xml2json = require('xml2json');
var gocdRequestor = gocdRequestorCreator(fs, xml2json);

exports.create = gocdRequestorCreator;
exports.get = gocdRequestor.get;

function gocdRequestorCreator(fs, xml2json) {

  if(gocdRequestor !== undefined) {
    return gocdRequestor;
  }

  function jsonFromXml(xml) {
    return xml2json.toJson(xml, {
      object: true,
      // sanitizing led to weird conversions of e.g. brackets in description texts
      sanitize: false
    });
  }

  var get = function(callback) {
    // TODO: Eventually replace with real HTTP request
    var xml = fs.readFileSync('server/sources/gocd/pipeline-stages.xml');
    var json = jsonFromXml(xml);

    callback(json);
  };

  return {
    get: get
  }
}

