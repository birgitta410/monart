
define(['xml2json', 'request', 'fs', 'server/sources/ymlHerokuConfig'], function (xml2json, request, fs, configReader) {

  var config = configReader.create('gocd');

  var PIPELINE_BASE = '/go/api/pipelines/' + config.get().pipeline;
  var STAGES_ENDPOINT = PIPELINE_BASE + '/stages.xml';

  var get = function(next, callback) {

    if (config.get().sampleIt()) {
      getSample(next, callback);
    } else {

      var url = next ? config.addCredentialsToUrl(next) : config.get().url;

      var loggableUrl = next ? next : config.get().loggableUrl;
      console.log('Requesting', loggableUrl + STAGES_ENDPOINT);

      request(url + STAGES_ENDPOINT, function (error, response, body) {
        var json = xml2json.toJson(body, {
          object: true, sanitize: false
        });
        callback(json);
      });

    }
  };

  function getSample(next, callback) {
    var source = next ? next : 'server/sources/gocd/sample/pipeline-stages.xml';
    var xml = fs.readFileSync(source);
    var json = xml2json.toJson(xml, {
      object: true, sanitize: false
    });

    callback(json);
  }

  var getStageDetails = function(stageId, callback) {
    if (config.get().sampleIt()) {
      getSampleStageDetails(stageId, callback);
    } else {

      var url = config.get().url + PIPELINE_BASE + '/' + stageId + '.xml';

      var loggableUrl = config.get().loggableUrl + PIPELINE_BASE + '/' + stageId + '.xml';
      console.log('Requesting', loggableUrl);

      request(url, function (error, response, body) {
        var json = xml2json.toJson(body, {
          object: true, sanitize: false
        });
        callback(json);
      });

    }
  };

  function getSampleStageDetails(stageId, callback) {
    var source = 'server/sources/gocd/sample/stage-details.xml';
    var xml = fs.readFileSync(source);
    var json = xml2json.toJson(xml, {
      object: true, sanitize: false
    });

    callback(json);
  }

  return {
    get: get,
    getSample: getSample,
    getStageDetails: getStageDetails,
    getSampleStageDetails: getSampleStageDetails
  }
});

