
define(['lodash', 'cheerio', 'server/sources/gocd/gocdRequestor', 'server/sources/gocd/atomEntryParser', 'server/sources/github/githubRequestor'],
  function (_, cheerio, gocdRequestor, atomEntryParser, githubRequestor) {

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
    if(historyEntry.time !== undefined) {
      return historyEntry;
    }

    var lastFinishedStage = _.sortBy(historyEntry.stages, function(stage) {
      return  stage.updated;
    })[historyEntry.stages.length - 1];
    historyEntry.time = lastFinishedStage.updated;
    return historyEntry;
  }

  function getLatestRunsOfStages(stages) {
    var allStageNames = _.unique(_.map(stages, function(stage) { return stage.stageName; }));
    return _.map(allStageNames, function(stageName) {
      var allEntriesForStage = _.where(stages, { 'stageName': stageName });
      allEntriesForStage = _.sortBy(allEntriesForStage, 'runNumber').reverse();
      return allEntriesForStage[0];
    });
  }

  function mapPipelineAuthor(historyEntry) {

    if(historyEntry.author !== undefined) {
      return historyEntry;
    }

    var firstStage = _.first(historyEntry.stages);

    _.extend(historyEntry, {
      author: firstStage.author
    });

    return historyEntry;

  }

  function mapPipelineResult(historyEntry) {
    if(historyEntry.result !== undefined) {
      return historyEntry;
    }

    var lastRuns = getLatestRunsOfStages(historyEntry.stages);

    var failedStages = _.where(lastRuns, { result: 'failed' });

    if (failedStages.length > 0) {
      _.extend(historyEntry, {
        result : 'failed',
        stageFailed : failedStages[0].stageName
      });
    } else {
      historyEntry.result = 'passed';
    }
    historyEntry.wasSuccessful = function() {
      return historyEntry.result === 'passed';
    };

    return historyEntry;

  }

  function enrichWithCommitDetails(basicData) {

    if(basicData.materials !== undefined) {
      return;
    }

    function withoutTimestamp(data) {
      return data.indexOf('on 2') === -1 ? data : data.slice(0, data.indexOf('on 2')).trim();
    }

    gocdRequestor.getMaterialHtml(basicData.stages[0].id, function(html) {
      var $ = cheerio.load(html);
      try {
        var changes = $('.material_tab .change');

        basicData.materials = _.map(changes, function(change) {
          var modifiedBy = withoutTimestamp($(change).find('.modified_by dd')[0].children[0].data);
          var comment = $(change).find('.comment p')[0].children[0].data;
          var sha = $(change).find('.revision dd')[0].children[0].data;
          var material = {
            comment: comment,
            committer: modifiedBy,
            sha: sha
          };
          githubRequestor.getCommitStats(sha, function(stats) {
            material.stats = stats;
          });
          return material;
        });

      } catch(error) {
        console.log('ERROR loading material', error);
      }
    });

  }

  var readHistory = function (callback, options) {
    options = options || {};
    options.exclude = options.exclude || [];

    requestStages(options.nextUrl, function (result) {
      if(result !== undefined) {
        _.each(result.feed.entry, pushEntryToPipelineHistory);
        pipelineHistory = _.omit(pipelineHistory, function(value, key) {
          return _.contains(options.exclude, key);
        });
        pipelineHistory = _.mapValues(pipelineHistory, mapPipelineFinishTime);
        pipelineHistory = _.mapValues(pipelineHistory, mapPipelineResult);
        pipelineHistory = _.mapValues(pipelineHistory, mapPipelineAuthor);

        _.each(pipelineHistory, function(entry) {
          // TODO: Does this async call really fill up values before we're done?
          enrichWithCommitDetails(entry);
        });

        var nextLink = _.find(result.feed.link, { rel: 'next' });

        if (nextLink && _.keys(pipelineHistory).length < MIN_NUMBER_HISTORY) {
          var nextUrl = nextLink.href;
          readHistory(callback, _.extend(options, { nextUrl: nextUrl }));
        } else {
          callback(pipelineHistory, options.callbackParameter);
        }
      }

    });

  };

  var clear = function() {
    pipelineHistory = {};
  };

  return {
    readHistory: readHistory,
    clear: clear
  };
});
