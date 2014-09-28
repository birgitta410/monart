
define(['q', 'xml2json', 'request', 'fs', 'server/sources/ymlHerokuConfig'], function (Q, xml2json, request, fs, configReader) {

  var config = configReader.create('gocd');

  var PIPELINE_BASE = '/go/api/pipelines/' + config.get().pipeline;
  var STAGES_ENDPOINT = PIPELINE_BASE + '/stages.xml';

  var get = function(next) {
    if (config.get().sampleIt()) {
      return getSample(next);
    } else {
      var defer = Q.defer();

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

  var getStageDetails = function(stageId) {
    if (config.get().sampleIt()) {
      return getSampleStageDetails(stageId);
    } else {
      var defer = Q.defer();

      var url = config.get().url + PIPELINE_BASE + '/' + stageId + '.xml';

      var loggableUrl = config.get().loggableUrl + PIPELINE_BASE + '/' + stageId + '.xml';
      console.log('Requesting', loggableUrl);

      request(url, function (error, response, body) {
        var json = xml2json.toJson(body, {
          object: true, sanitize: false
        });
        defer.resolve(json);
      });

      return defer.promise;
    }
  };

  function getSampleStageDetails() {
    var defer = Q.defer();

    var source = 'server/sources/gocd/sample/stage-details.xml';
    var xml = fs.readFileSync(source);
    var json = xml2json.toJson(xml, {
      object: true, sanitize: false
    });

    defer.resolve(json);

    return defer.promise;
  }

  var getMaterialHtml = function(jobId) {

    if (config.get().sampleIt()) {
      return getSampleMaterialHtml(jobId);
    } else {
      var defer = Q.defer();

      var url = config.addCredentialsToUrl(jobId + '/materials');
      console.log('Requesting', jobId + '/materials');
      request(url, function(error, response, body) {
        defer.resolve(body);
      });

      return defer.promise;
    }
  };

  function getSampleMaterialHtml() {
    var defer = Q.defer();
    var html = fs.readFileSync('server/sources/gocd/sample/materials.html');

    defer.resolve(html);
    return defer.promise;
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

