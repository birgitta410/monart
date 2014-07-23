
var _ = require('lodash');

var pipelineFeedReaderCreator = function (xml2json, fs, atomEntryParser) {

  var pipelineHistory = { };

  function jsonFromXml(xml) {
    return xml2json.toJson(xml, {
      object: true,
      // sanitizing led to weird conversions of e.g. brackets in description texts
      sanitize: false
    });
  }

  var requestStages = function (callback) {
    // TODO: Eventually replace with real HTTP request
    var xml = fs.readFileSync('server/sources/gocd/pipeline-stages.xml');
    var json = jsonFromXml(xml);

    json.feed.entry = _.map(json.feed.entry, function(entry) {
      return atomEntryParser.withData(entry);
    });

    callback(json);
  };

  function pushEntryToPipelineHistory(entry) {
    pipelineHistory[entry.buildNumber] = pipelineHistory[entry.buildNumber] || {};
    var historyEntry = pipelineHistory[entry.buildNumber];
    historyEntry.stages = historyEntry.stages || [];
    historyEntry.stages.push(entry);
  }

  function mapPipelineFinishTime(historyEntry) {
    var lastFinishedStage = _.sortBy(historyEntry.stages, function(stage) {
      return  stage.updated;
    })[historyEntry.stages.length - 1];
    historyEntry.time = lastFinishedStage.updated;
    return historyEntry;
  }

  function mapPipelineResult(historyEntry) {
    var failedStages = _.where(historyEntry.stages, { result: 'failed' });
    if (failedStages.length > 0) {
      historyEntry.result = 'failed';
      historyEntry.stageFailed = failedStages[0].stageName;
    } else {
      historyEntry.result = 'passed';
    }
    historyEntry.wasSuccessful = function() {
      return historyEntry.result === 'passed';
    }

    return historyEntry;

  }

  var init = function () {
    requestStages(function (result) {

      _.each(result.feed.entry, pushEntryToPipelineHistory);
      pipelineHistory = _.mapValues(pipelineHistory, mapPipelineFinishTime);
      pipelineHistory = _.mapValues(pipelineHistory, mapPipelineResult);

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
var atomEntryParserCreator = require('./atomEntryParser.js');
var pipelineFeedReader = pipelineFeedReaderCreator(xml2json, fs, atomEntryParserCreator.create());

exports.create = pipelineFeedReaderCreator;
exports.init = pipelineFeedReader.init;
exports.readHistory = pipelineFeedReader.readHistory;