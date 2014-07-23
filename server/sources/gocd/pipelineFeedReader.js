
var _ = require('lodash');

var pipelineFeedReaderCreator = function (xml2json, fs, atomEntryParser) {

  var pipelineHistory = { };

  var jsonFromXml = function (xml) {
    return xml2json.toJson(xml, {
      object: true,
      // sanitizing led to weird conversions of e.g. brackets in description texts
      sanitize: false
    });
  };

  var requestStages = function (callback) {
    // TODO: Eventually replace with real HTTP request
    var xml = fs.readFileSync('server/sources/gocd/pipeline-stages.xml');

    var json = jsonFromXml(xml);
    json.feed.entry = _.map(json.feed.entry, function(entry) {
      return atomEntryParser.withData(entry);
    });

    callback(json);
  };

  var init = function () {
    requestStages(function (result) {
      _.each(result.feed.entry, function(entry) {
        console.log('buildNumber', entry.buildNumber, JSON.stringify(entry));

        pipelineHistory[entry.buildNumber] = pipelineHistory[entry.buildNumber] || {};
        var historyEntry = pipelineHistory[entry.buildNumber];
        historyEntry.stages = historyEntry.stages || [];

        historyEntry.stages.push(entry);
      });

      // TODO: initialise pipeline properties
      // time, result, stageFailed

      console.log(_.keys(pipelineHistory));
    });
  };

  var readHistory = function(callback, callbackParameter) {

    callback(pipelineHistory, callbackParameter);

  };

  return {
    init: init,
    readHistory: readHistory
  };
}

var xml2json = require('xml2json');
var fs = require('fs');
var atomEntryParser = require('./atomEntryParser.js');
var pipelineFeedReader = pipelineFeedReaderCreator(xml2json, fs, atomEntryParser);

exports.create = pipelineFeedReaderCreator;
exports.requestStages = pipelineFeedReader.requestStages;
exports.readHistory = pipelineFeedReader.readHistory;