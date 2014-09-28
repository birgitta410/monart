
var miroGocdMapper = function(_, moment, gocdReader) {

  var createChangeSizer = function(history) {

    var changeSizes = _.map(_.keys(history), function(key) {
      var entry = history[key];
      if(entry.materials) {

        var changeSize = _.reduce(entry.materials, function(value, material) {
          if(material.stats) { // TODO: What makes sense to calculate the size of a change?
            var factor = 1;
            if(material.stats.filesChanged > 2) {
              factor = material.stats.filesChanged / 2;
            }
            var size = material.stats.total * factor;
            return value + size;
          } else {
            return -1;
          }
        }, 0);
        entry.changeSize = changeSize;
        return changeSize;

      } else {
        return -1;
      }

    });

    var max = Math.max.apply( Math, changeSizes);

    function getSize(entrySize) {
      var sizeFactor = entrySize / max * 100;
      var size = 'small';
      if(sizeFactor >= 70) {
        size = 'large';
      } else if(sizeFactor >= 35) {
        size = 'medium';
      }
      return size;
    }

    return {
      getSize: getSize
    };
  };

  var readHistoryAndActivity = function() {
    return gocdReader.readData().then(function(data) {

      var history = data.history;
      var changeSizer = createChangeSizer(history);

      var keysDescending = _.keys(history).sort(function(a, b) {
        return a - b; // JS does lexicographical sorting by default, need to sort by number
      }).reverse();
      var lastBuild = history[keysDescending[0]];

      var finalShapes = {};

      finalShapes.stroke = {
        color: lastBuild.wasSuccessful() ? 'black' : 'red',
        info: lastBuild.info
      };

      finalShapes.stones = _.map(keysDescending.splice(1), function(key) {
        var entry = history[key];

        return {
          size: changeSizer.getSize(entry.changeSize),
          color: entry.wasSuccessful() ? 'black' : 'red',
          info: entry.info
        };
      });

      return finalShapes;

    });
  };

  return {
    readHistoryAndActivity: readHistoryAndActivity
  }
};

define(['lodash', 'moment', 'server/sources/gocd/gocdReader'], miroGocdMapper);