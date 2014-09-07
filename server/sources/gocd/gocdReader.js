
var gocdMapper = function(_, moment, pipelineReader, ccTrayReader) {
  var readData = function(callWhenDone) {
    ccTrayReader.readActivity(function(activity) {

      pipelineReader.readHistory(function(history) {

        var result = {
          activity: activity,
          history: history
        };

        callWhenDone(result);

      }, { exclude: [ activity.buildNumberInProgress] } );

    });
  };

  return {
    readData: readData
  }
};

define(['lodash', 'moment', 'server/sources/gocd/pipelineFeedReader', 'server/sources/cc/ccTrayReader'], gocdMapper);