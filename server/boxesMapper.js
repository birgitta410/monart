
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
    //finalData.figures = activities.figures.concat(historyFigures);
    //finalData.background = activities.background || history.background;

    return finalData;

  };


  function mapPipelineDataToFigures(history) {

    // TODO: Only use the results of the LATEST run in each pipeline
    var keysDescending = _.keys(history).sort(compareNumbers).reverse();
    var lastBuildSuccessful = keysDescending.length > 0 ? history[keysDescending[0]].wasSuccessful() : true;

    var nonPassingRuns = _.where(keysDescending, function(key, index) {

      var entry = history[key];
      return entry.summary.result !== 'Passed';
    });

    var boxes = _.map(nonPassingRuns, function(key) {
      return history[key];
    });

    return {
      background: lastBuildSuccessful ? 'green' : 'orange',
      boxes: boxes
    };

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
