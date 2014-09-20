
define(['request', 'fs', 'lodash', 'server/sources/ymlHerokuConfig'], function (request, fs, _, configReader) {

  var config = configReader.create('github');

  var host = 'https://api.github.com';
  var path = '/repos/'+config.get().user+'/'+config.get().repo+'/commits/';

  function createStats(responseBody) {
    var commitData = JSON.parse(responseBody);
    return _.extend(commitData.stats, {
      filesChanged: commitData.files.length
    });
  }

  var getCommitStats = function(sha, callback) {

    if (config.get().sampleIt()) {
      getSampleCommitStats(sha, callback);
    } else {

      console.log('Requesting', host, path + sha);

      var options = {
        uri: host + path + sha,
        auth: {
          user: 'token',
          password: config.get().token
        },
        headers: {}
      };
      options.headers['user-agent'] = config.get().user;
      request(options, function (error, response, body) {
        if(! error) {
          callback(createStats(body));
        } else {
          console.log('Error requesting commit stats from git', error);
        }
      });

    }
  };


  function getSampleCommitStats(sha, callback) {
    var source = 'server/sources/github/sample/github_commit.json';
    var jsonString = fs.readFileSync(source);

    callback(createStats(jsonString));
  }

  return {
    getCommitStats: getCommitStats,
    getSampleCommitStats: getSampleCommitStats
  }
});

