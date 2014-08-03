var _ = require('lodash');

var ccTrayReaderCreator = function (ccTrayRequestor, goCdAtomEntryParser) {

  var MAX_JOBS = 6;

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
    var activity = { jobs: [] };

    requestActivity(function (result) {

      // Assumption (Go CD): Jobs are the ones with 3 path elements
      // 'PIPELINE-NAME :: stage-name :: job-name'
      _.each(result.Projects.Project, function(project) {
        var pathElements = project.name.split(' :: ');

        function parseBreakerNameAndEmail(text) { // !!currently duplicated in atomEntryParser
          var breaker = {};
          var emailIndex = text.indexOf('<');
          if (emailIndex > -1) {
            breaker.name = text.substr(0, emailIndex).trim();
            breaker.email = text.substr(emailIndex).trim();
          } else {
            breaker.name = text;
          }
          return breaker;
        }

        function parseBreaker() {
          var allMessages = [].concat(project.messages || []); // xml2json creates object if array only has one entry

          var breakersMessage = _.find(allMessages, function(message) {
            return message.message.kind === 'Breakers';
          });

          if(breakersMessage !== undefined) {
            return parseBreakerNameAndEmail(breakersMessage.message.text);
          }
        }

        if (pathElements.length === 3 && activity.jobs.length < MAX_JOBS) {
          project = _.extend(project, {
            wasSuccessful: function() {
              return project.lastBuildStatus === 'Success';
            },
            breaker: parseBreaker()
          });
          activity.jobs.push(project);
        }
      });

      function parseGoCdBuildingPipeline() {
        var buildingJob = _.find(result.Projects.Project, function(project) {
          return project.activity === 'Building';
        });

        if(buildingJob) {
          return goCdAtomEntryParser.parseParametersFromJobRunUrl(buildingJob.webUrl).buildNumber;
        }
      }

      activity.buildNumberInProgress = parseGoCdBuildingPipeline();

      callback(activity, options.callbackParameter);

    });


  };

  return {
    readActivity: readActivity
  };
};

var goCdAtomEntryParser = require('../gocd/atomEntryParser.js');
var ccTrayRequestorCreator = require('./ccTrayRequestor.js');
var ccTrayReader = ccTrayReaderCreator(ccTrayRequestorCreator.create(), goCdAtomEntryParser.create());

exports.create = ccTrayReaderCreator;
exports.readActivity = ccTrayReader.readActivity;
