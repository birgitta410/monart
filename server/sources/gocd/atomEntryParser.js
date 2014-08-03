var _ = require('lodash');


var atomEntryParserCreator = function () {

  var GO_PIPELINES_ENDPOINT = '/go/pipelines/';

  function parseParametersFromJobRunUrl(id) {
    if (id === undefined) return { };

    // http://the-go-host:8153/go/pipelines/A-PIPELINE/1199/functional-test/1
    var parameterString = id.substring(id.indexOf(GO_PIPELINES_ENDPOINT) + GO_PIPELINES_ENDPOINT.length);
    var parameters = parameterString.split('/');
    return {
      pipeline: parameters[0],
      buildNumber: parameters[1],
      stageName: parameters[2],
      runNumber: parameters[3]
    };
  }

  function parseBreaker(result, author) { // !!currently duplicated in ccTrayReader
    if(result === 'failed' && author !== undefined) {
      var breaker = {};
      var emailIndex = author.name.indexOf('<');
      if (emailIndex > -1) {
        breaker.name = author.name.substr(0, emailIndex).trim();
        breaker.email = author.name.substr(emailIndex).trim();
      } else {
        breaker.name = author.name;
      }
      return breaker;
    }
  }

  function parseResultAndBreaker(title, author) {
    if (title === undefined) return { };

    // 'QEN(1197) stage build(1) Passed'
    var titleChunks = title.split(' ');
    var result = titleChunks[3].toLowerCase();

    return {
      result: result,
      breaker: parseBreaker(result, author)
    }
  }

  var withData = function(data) {
    data = _.extend(data, parseParametersFromJobRunUrl(data.id));
    return _.extend(data, parseResultAndBreaker(data.title, data.author));
  };

  return {
    withData: withData,
    parseParametersFromJobRunUrl: parseParametersFromJobRunUrl
  };

};

var atomEntryParser = atomEntryParserCreator();

exports.create = atomEntryParserCreator;
exports.withData = atomEntryParserCreator.withData;

