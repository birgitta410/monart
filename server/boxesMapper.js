
var _ = require('lodash');
var moment = require('moment');

function boxesMapperModule() {

  function compareNumbers(a, b) {
    // JS does lexicographical sorting by default, need to sort by number
    return a - b;
  }

  var readHistoryAndActivity = function(data) {
    var activities = mapActivityDataToFigures(data.activity);

    var history = mapPipelineDataToFigures(data.history);

    var finalData = {
      activity: activities,
      history: history
    };

    return finalData;

  };


  function mapPipelineDataToFigures(history) {

    var keysDescending = _.keys(history).sort(compareNumbers).reverse();
    var latestRun = keysDescending.length > 0 ? history[keysDescending[0]] : undefined;

    var ignoreLatestRun = latestRun.wasSuccessful() || latestRun.summary.result === 'unknown';
    if (! ignoreLatestRun) {
      return {
        boxes: [history[keysDescending[0]]]
      };
    } else {
      return {
        boxes: []
      };
    }

  }

  function mapActivityDataToFigures(activity) {

    return _.where(activity.stages, function(entry) {
      return entry.isBuilding && entry.isBuilding() || entry.activity === 'Building' || entry.isScheduled && entry.isScheduled();
    });

  }

  return {
    readHistoryAndActivity: readHistoryAndActivity
  }
}

exports.readHistoryAndActivity = boxesMapperModule().readHistoryAndActivity;
