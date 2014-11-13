var Q = require('q');
var gocdApi = require('gocd-api');
var miroGocdMapper = require('../server/miro/gocdMapper');

describe('Miro Go CD Mapper', function () {

  var fakePipelineHistory, fakeActivity;

  var notSuccessfulFn = function () {
    return false;
  };
  var successfulFn = function () {
    return true;
  };

  beforeEach(function() {
    gocdApi.readData = function() {
      var defer = Q.defer();
      defer.resolve({
        activity: { jobs: fakeActivity },
        history: fakePipelineHistory
      });
      return defer.promise;
    };

    gocdApi.readActivity = function() {
      var defer = Q.defer();
      defer.resolve({ jobs: fakeActivity });
      return defer.promise;
    };

  });

  describe('mapPipelineData()', function () {

    beforeEach(function () {
      fakeActivity = [];
      fakePipelineHistory = {};
    });

    it('should set the stroke color to red if last build was unsuccessful', function (done) {
      fakePipelineHistory = {
        '125': { wasSuccessful: notSuccessfulFn },
        '124': { wasSuccessful: successfulFn }
      };
      miroGocdMapper.readHistoryAndActivity().then(function (result) {
        expect(result.stroke.color).toBe('red');
        done();
      });

    });

    it('should set the stroke color to black if last build was successful', function (done) {
      fakePipelineHistory = {
        '125': { wasSuccessful: successfulFn },
        '124': { wasSuccessful: notSuccessfulFn }
      };
      miroGocdMapper.readHistoryAndActivity().then(function (result) {
        expect(result.stroke.color).toBe('black');
        done();
      });

    });

    it('should set the size of stones according to the size of changes', function (done) {
      fakePipelineHistory = {
        '125': {
          wasSuccessful: notSuccessfulFn
        },
        '124': {
          wasSuccessful: notSuccessfulFn,
          materials: [
            {
              "stats": {
                "total": 153,
                "filesChanged": 10
              }
            }
          ]
        },
        '123': {
          wasSuccessful: notSuccessfulFn,
          materials: [
            {
              "stats": {
                "total": 40,
                "filesChanged": 2
              }
            }
          ]
        }
      };
      miroGocdMapper.readHistoryAndActivity().then(function (result) {
        expect(result.stones[0].size).toBe('large');
        expect(result.stones[1].size).toBe('small');
        done();
      });

    });

  });

});
