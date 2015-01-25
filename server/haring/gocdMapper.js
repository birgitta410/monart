
var _ = require('lodash');
var vierGewinnt = require('./vierGewinnt');
var gocdReader = require('../gocdReader');
var config = require('../ymlHerokuConfig');

function haringGocdMapperModule() {

  var NUM_FIGURES_IN_VIS = 24;

  var IS_BUILDING_BACKGROUND = 'blue';

  var haringConfig = config.create('haring').get();

  function compareNumbers(a, b) {
    // JS does lexicographical sorting by default, need to sort by number
    return a - b;
  }

  function sortAndStripDownHistory(historyData, numberOfEntries) {
    var keysToKeep = _.keys(historyData).sort(compareNumbers).reverse().splice(0, numberOfEntries);
    var strippedDownHistory = {};
    _.each(keysToKeep, function(key) {
      if(keysToKeep.indexOf(key) >= 0) {
        strippedDownHistory[key] = historyData[key];
      }
    });
    return strippedDownHistory;
  }

  function isWinter() {
    var now = new Date();
    return now.getMonth() >= 11 || now.getMonth() === 0;
  }

  function getSpecialAnnouncementFigure(historyData) {
    var greatSuccess = ! _.any(_.keys(historyData), function(key) {
      return historyData[key].wasSuccessful() === false;
    });
    if(greatSuccess) {
      return {
        color: 'blue',
        type: isWinter() ? 'winter/great_success' : 'great_success',
        border: 'dotted',
        word1: 'great',
        word2: 'success'
      };
    }
  }

  var readHistoryAndActivity = function() {
    return gocdReader.readData().then(function(data) {
      var activityHaring = mapActivityDataToFigures(data.activity);

      var numberOfHistoryFigures = NUM_FIGURES_IN_VIS - activityHaring.figures.length;
      var onlyHistoryWeNeed = sortAndStripDownHistory(data.history, numberOfHistoryFigures);
      var historyHaring = mapPipelineDataToFigures(onlyHistoryWeNeed);

      var historyFigures = historyHaring.figures;
      mapInitialsFromHistoryToActivity(historyFigures, activityHaring.figures);

      var finalFigures = {  };
      finalFigures.figures = activityHaring.figures.concat(historyFigures);
      finalFigures.background = activityHaring.background || historyHaring.background;
      finalFigures.announcementFigure = getSpecialAnnouncementFigure(onlyHistoryWeNeed);

      vierGewinnt.apply(finalFigures.figures);

      return finalFigures;

    });

  };

  function mapInitialsFromHistoryToActivity(historyFigures, activityFigures) {
    _.each(activityFigures, function(activityFigure) {
      var historyFigureWithSameKey = _.find(historyFigures, function(historyFigure) {
        return activityFigure.key === historyFigure.key;
      });
      if(historyFigureWithSameKey !== undefined) {
        activityFigure.initials = historyFigureWithSameKey.initials;
      }
    });
  }

  function getFigureType(entry, lastEntryWasSuccessful) {

    if(entry.wasSuccessful() && !lastEntryWasSuccessful) {
      return 'passed_after_fail';
    } else if (entry.wasSuccessful()) {
      return 'passed';
    } else if ( ! entry.wasSuccessful() && !lastEntryWasSuccessful) {
      return 'fail_repeated';
    } else {
      return 'fail';
    }
  }

  function getColor(entry) {
    if(entry.wasSuccessful()) {
      return 'COLD';
    } else {
      return 'WARM';
    }
  }

  function mapPipelineDataToFigures(history) {

    var keysDescending = _.keys(history).sort(compareNumbers).reverse();
    if(keysDescending.length === 0) {
      return { figures: [] };
    }

    var figures = _.map(keysDescending, function(key, index) {

      var entry = history[key];
      var previous = index < keysDescending.length ? history[keysDescending[index + 1]] : undefined;

      return {
        color: getColor(entry),
        info: entry.label,
        info2: entry.info,
        type: getFigureType(entry, previous ? previous.wasSuccessful() : true),
        initials: entry.author ? entry.author.initials : undefined,
        time: parseInt(entry.last_scheduled),
        key: key
      };
    });

    var lastBuildSuccessful = history[keysDescending[0]].wasSuccessful();

    return {
      background: lastBuildSuccessful ? 'green' : 'orange',
      figures: figures
    };

  }

  function mapActivityDataToFigures(activity) {

    function getFigureTypeForActivity(entry) {

      if(entry.activity === 'Building') {
        return 'building';
      } else {
        return getFigureType(entry, true);
      }
    }

    function getColor(entry) {
      if(entry.lastBuildStatus === 'Success') {
        return 'COLD';
      } else if (entry.lastBuildStatus === 'Failure') {
        return 'WARM';
      } else {
        return 'grey';
      }
    }

    function getInfo(entry) {
      var entryTitle = '[' + entry.buildNumber + '] ' + entry.name;
      if(entry.activity === 'Building') {
        return entryTitle + ' is building';
      } else {
        var info = entryTitle + ' | ' + entry.lastBuildStatus;
        if(!entry.wasSuccessful() && entry.author) {
          info += ' | changes by ' + entry.author.name;
        }
        return info;
      }
    }

    var figures = _.map(activity.jobs, function(entry) {
      return {
        color: getColor(entry),
        info: entry.stageName,
        info2: getInfo(entry),
        type: getFigureTypeForActivity(entry),
        border: 'dotted',
        initials: entry.author ? entry.author.initials : undefined,
        time: new Date(entry.lastBuildTime).getTime(),
        key: entry.buildNumber
      }
    });

    var isBuilding = _.any(activity.jobs, function(entry) {
      return entry.activity === 'Building';
    });

    return {
      background: isBuilding ? IS_BUILDING_BACKGROUND : undefined,
      figures: figures
    };

  }

  return {
    readHistoryAndActivity: readHistoryAndActivity
  }
}

exports.readHistoryAndActivity = haringGocdMapperModule().readHistoryAndActivity;