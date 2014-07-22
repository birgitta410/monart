var pipelineFeedReaderCreator = function (xml2json, fs) {

  var pipelineHistory = [];

  var jsonFromXml = function (xml) {
    return xml2json.toJson(xml, {
      object: true,
      // sanitizing led to weird conversions of e.g. brackets in description texts
      sanitize: false
    });
  };

  var requestStages = function (callback) {
    var xml = fs.readFileSync('server/sources/gocd/pipeline-stages.xml');
    callback(jsonFromXml(xml));
  };

  var init = function () {
    requestStages(function (result) {
      console.log(result);
    });
  };

  return {
    init: init
  };
}

var xml2json = require('xml2json');
var fs = require('fs');
var pipelineFeedReader = pipelineFeedReaderCreator(xml2json, fs);

exports.create = pipelineFeedReaderCreator;
exports.requestStages = pipelineFeedReaderCreator.requestStages;
