var _ = require('lodash');

var ccTrayReaderCreator = function (ccTrayRequestor) {

  var activity = { };

  var requestActivity = function (callback) {
    ccTrayRequestor.get(function(json) {
      json.Projects.Project = _.map(json.Projects.Project, function(entry) {
        return entry;
      });
      callback(json);
    });
  };

  var init = function() {
    requestActivity(function (result) {

      activity = result.Projects.Project;

    });
  };

  var readActivity = function(callback) {
    callback(activity);
  };

  return {
    init: init,
    readActivity: readActivity
  };
};

var ccTrayRequestorCreator = require('./ccTrayRequestor.js');
var ccTrayReader = ccTrayReaderCreator(ccTrayRequestorCreator.create());

exports.create = ccTrayReaderCreator;
exports.init = ccTrayReader.init;
exports.readActivity = ccTrayReader.readActivity;
