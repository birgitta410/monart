var _ = require('lodash');


var atomEntryParserCreator = function () {

  var GO_PIPELINES_ENDPOINT = '/go/pipelines/';

  function parseParametersFromId(id) {
    if (id === undefined) return { };

    // http://the-go-host:8153/go/pipelines/A-PIPELINE/1199/functional-test/1
    var parameterString = id.substring(id.indexOf(GO_PIPELINES_ENDPOINT) + GO_PIPELINES_ENDPOINT.length);
    var parameters = parameterString.split('/');
    return {
      pipeline: parameters[0],
      buildNumber: parameters[1],
      stage: parameters[2],
      runNumber: parameters[3]
    };
  }

  function parseParametersFromTitle(title) {
    if (title === undefined) return { };

    // 'QEN(1197) stage build(1) Passed'
    var titleChunks = title.split(' ');
    return {
      result: titleChunks[3].toLowerCase()
    }
  }

  var withData = function(data) {
    data = _.extend(data, parseParametersFromId(data.id));
    return _.extend(data, parseParametersFromTitle(data.title));
  };

  return {
    withData: withData
  };

};

var atomEntryParser = atomEntryParserCreator();

exports.create = atomEntryParserCreator;
exports.withData = atomEntryParserCreator.withData;

