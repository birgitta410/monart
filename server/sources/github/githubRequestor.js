
define(['request', 'fs', 'lodash', 'server/sources/httpConfig'], function (request, fs, _, httpConfig) {

  var config = httpConfig.create('github');

  var host = 'https://api.github.com';
  var path = '/repos/'+config.get().user+'/'+config.get().repo+'/commits/';

  function createStats(responseBody) {
    var commitData = JSON.parse(responseBody);
    return _.extend(commitData.stats, {
      filesChanged: commitData.files.length
    });
  }

  var getCommitStats = function(sha, callback) {

    console.log('commitstats', config.get());
    if (config.get().fakeIt()) {
      getFake(callback);
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

  function getFake(callback) {
    console.log('FAKING Github API');
    var source = 'server/sources/github/fake/github_commit.json';
    var jsonString = fs.readFileSync(source);

    callback(createStats(jsonString));
  }

  return {
    getCommitStats: getCommitStats
  }
});

