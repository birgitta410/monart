
var _ = require('lodash');

var pipelineFeedReaderCreator = function (gocdRequestor, atomEntryParser) {

  var pipelineHistory = { };
  var MIN_NUMBER_HISTORY = 25;

  var requestStages = function (next, callback) {
    gocdRequestor.get(next, function(json) {
      json.feed.entry = _.map(json.feed.entry, function(entry) {
        return atomEntryParser.withData(entry);
      });
      callback(json);
    });
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
    };

    return historyEntry;

  }

  var readHistory = function (callback, options) {
    options = options || {};

    requestStages(options.nextUrl, function (result) {
      if(result !== undefined) {
        _.each(result.feed.entry, pushEntryToPipelineHistory);
        pipelineHistory = _.mapValues(pipelineHistory, mapPipelineFinishTime);
        pipelineHistory = _.mapValues(pipelineHistory, mapPipelineResult);

        var nextLink = _.find(result.feed.link, { rel: 'next' });

        if (nextLink && _.keys(pipelineHistory).length < MIN_NUMBER_HISTORY) {
          nextUrl = nextLink.href;
          readHistory(callback, _.extend(options, { nextUrl: nextUrl }));
        } else {
          callback(pipelineHistory, options.callbackParameter);
        }
      }

    });

  };

  return {
    readHistory: readHistory
  };
};

var gocdRequestorCreator = require('./gocdRequestor.js');
var atomEntryParserCreator = require('./atomEntryParser.js');
var pipelineFeedReader = pipelineFeedReaderCreator(gocdRequestorCreator.create(), atomEntryParserCreator.create());

exports.create = pipelineFeedReaderCreator;
exports.init = pipelineFeedReader.init;
exports.readHistory = pipelineFeedReader.readHistory;