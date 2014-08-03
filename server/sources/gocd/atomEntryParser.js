var _ = require('lodash');


var atomEntryParserCreator = function () {

  var GO_PIPELINES_ENDPOINT = '/go/pipelines/';
  var GO_PIPELINES_DETAILS_ENDPOINT = '/go/tab/build/detail/';

  function parseParametersFromJobRunUrl(id) {
    if (id === undefined) return { };

    if(id.indexOf('build/detail') > -1) {
      return parseParametersFromJobDetailUrl(id);
    }

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

  function parseParametersFromJobDetailUrl(id) {
    // http://192.168.50.79:8153/go/tab/build/detail/artwise/36/build/1/randomlyFails
    var parameterString = id.substring(id.indexOf(GO_PIPELINES_DETAILS_ENDPOINT) + GO_PIPELINES_DETAILS_ENDPOINT.length);
    var parameters = parameterString.split('/');

    return {
      pipeline: parameters[0],
      buildNumber: parameters[1],
      stageName: parameters[2],
      runNumber: parameters[3],
      jobName: parameters[4]
    };
  }

  function parseBreaker(result, author) { // !!currently duplicated in ccTrayReader
    if(result === 'failed' && author !== undefined) {
      var authors = [].concat(author || []);
      var breakerName = authors[authors.length - 1].name;

      var breaker = {};

      var emailIndex = breakerName.indexOf('<');
      if (emailIndex > -1) {
        breaker.name = breakerName.substr(0, emailIndex).trim();
        breaker.email = breakerName.substr(emailIndex).trim();
      } else {
        breaker.name = breakerName;
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

