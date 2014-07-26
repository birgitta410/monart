var _ = require('lodash');

var ccTrayReaderCreator = function (ccTrayRequestor) {

  var requestActivity = function (callback) {
    ccTrayRequestor.get(function(json) {
      json.Projects.Project = _.map(json.Projects.Project, function(entry) {
        return entry;
      });
      callback(json);
    });
  };


  var readActivity = function(callback, options) {

    options = options || {};
    var activity = [];

    requestActivity(function (result) {

      // Assumption (Go CD): Jobs are the ones with 3 path elements
      // 'PIPELINE-NAME :: stage-name :: job-name'
      _.each(result.Projects.Project, function(project) {
        var pathElements = project.name.split(' :: ');

        function parseBreaker() {
          var allMessages = [].concat(project.messages || []); // xml2json creates object if array only has one entry

          var breakersMessage = _.find(allMessages, function(message) {
            return message.message.kind === 'Breakers';
          });

          if(breakersMessage !== undefined) {
            return breakersMessage.message.text;
          }
        }

        if (pathElements.length === 3) {
          project = _.extend(project, {
            wasSuccessful: function() {
              return project.lastBuildStatus === 'Success';
            },
            breaker: parseBreaker()
          });
          activity.push(project);
        }
      });
      callback(activity, options.callbackParameter);

    });


  };

  return {
    readActivity: readActivity
  };
};

var ccTrayRequestorCreator = require('./ccTrayRequestor.js');
var ccTrayReader = ccTrayReaderCreator(ccTrayRequestorCreator.create());

exports.create = ccTrayReaderCreator;
exports.readActivity = ccTrayReader.readActivity;
