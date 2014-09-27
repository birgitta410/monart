
define(['q', 'xml2json', 'request', 'fs', 'server/sources/ymlHerokuConfig'], function (Q, xml2json, request, fs, configReader) {

  var config = configReader.create('gocd');

  var PIPELINE_BASE = '/go/api/pipelines/' + config.get().pipeline;
  var STAGES_ENDPOINT = PIPELINE_BASE + '/stages.xml';

  var get = function(next) {
    var defer = Q.defer();

    if (config.get().sampleIt()) {
      return getSample(next);
    } else {

      var url = next ? config.addCredentialsToUrl(next) : config.get().url;

      var loggableUrl = next ? next : config.get().loggableUrl;
      console.log('Requesting', loggableUrl + STAGES_ENDPOINT);

      request(url + STAGES_ENDPOINT, function (error, response, body) {
        var json = xml2json.toJson(body, {
          object: true, sanitize: false
        });
        defer.resolve(json);
      });

      return defer.promise;
    }

  };

  function getSample(next) {
    var defer = Q.defer();

    var source = next ? next : 'server/sources/gocd/sample/pipeline-stages.xml';
    try {
      var xml = fs.readFileSync(source);

      var json = xml2json.toJson(xml, {
        object: true, sanitize: false
      });
      defer.resolve(json);
    } catch (err) {
      console.log('ERROR reading file', source, err);
      defer.reject();
    }

    return defer.promise;
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

  var getMaterialHtml = function(jobId, callback) {
    if (config.get().sampleIt()) {
      getSampleMaterialHtml(jobId, callback);
    } else {
      var url = config.addCredentialsToUrl(jobId + '/materials');
      console.log('Requesting', jobId + '/materials');
      request(url, function(error, response, body) {
        callback(body);
      });
    }
  };

  function getSampleMaterialHtml(jobId, callback) {
    var html = fs.readFileSync('server/sources/gocd/sample/materials.html');

    callback(html);
  }

  return {
    get: get,
    getSample: getSample,
    getStageDetails: getStageDetails,
    getSampleStageDetails: getSampleStageDetails,
    getMaterialHtml: getMaterialHtml,
    getSampleMaterialHtml: getSampleMaterialHtml
  }
});

