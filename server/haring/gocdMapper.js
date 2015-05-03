
var _ = require('lodash');
var moment = require('moment');
var vierGewinnt = require('./vierGewinnt');
var gocdReader = require('../gocdReader');
var config = require('../ymlHerokuConfig');

function haringGocdMapperModule() {

  var NUM_FIGURES_IN_VIS = 24;

  var IS_BUILDING_BACKGROUND = 'blue';

  var haringConfig = config.create('haring').get();
  var gocdConfig = config.create('gocd').get();

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

      var finalData = {  };
      finalData.figures = activityHaring.figures.concat(historyFigures);
      finalData.background = activityHaring.background || historyHaring.background;
      finalData.announcementFigure = getSpecialAnnouncementFigure(onlyHistoryWeNeed);
      finalData.dangerZones = haringConfig.dangerZones;

      vierGewinnt.apply(finalData.figures);

      return finalData;

    }).fail(function() {
      console.error('ERROR transforming data', arguments);
    });

  };

  function getMinutesSinceBuild(entry) {
    var lastBuildTime = moment(entry.lastBuildTime);
    if(gocdConfig.timeDiff) {
      lastBuildTime.add(gocdConfig.timeDiff, 'minutes');
    }

    var millisSinceBuild = moment(new Date()).diff(lastBuildTime);
    console.log('minutes since', millisSinceBuild / 1000 / 60, 'timeDiff', gocdConfig.timeDiff, 'lastBuildTime', entry.lastBuildTime);
    return Math.floor(millisSinceBuild / 1000 / 60);
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

      var initials = entry.author ? entry.author.initials.toUpperCase() : undefined;
      return {
        color: getColor(entry),
        info: entry.label + (initials ? '<br>' + initials : ''),
        info2: entry.info,
        type: getFigureType(entry, previous ? previous.wasSuccessful() : true),
        initials: initials,
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

      var type = getFigureType(entry, true);
      if(entry.activity === 'Building') {
        type = 'building';
      } else if(type === 'fail') {
        var sinceLast = getMinutesSinceBuild(entry);
        var acceptableTimeValue = haringConfig.acceptableTimeFailed || '30';

        if(sinceLast > parseInt(acceptableTimeValue)) {
          entry.tooLongSinceBuild = sinceLast;
          type = 'fail_too_long';
        }
      }
      return type;
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

    function getInfoShort(entry) {
      var initials = entry.initials ? entry.initials.toUpperCase() : undefined;
      var tooLong = entry.tooLongSinceBuild ? 'It\'s been ' + entry.tooLongSinceBuild + ' minutes!' : undefined;
      var info = entry.info + (initials ? '<br>' + initials : '');
      return tooLong ? tooLong : info;
    }

    var figures = _.map(activity.jobs, function(entry) {
      return {
        type: getFigureTypeForActivity(entry),
        color: getColor(entry),
        info: getInfoShort(entry),
        info2: entry.info2,
        border: 'dotted',
        initials: entry.initials,
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