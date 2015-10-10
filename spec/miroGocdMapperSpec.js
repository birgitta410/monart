var Q = require('q');

describe('Miro Go CD Mapper', function () {

  var miroGocdMapper;

  var notSuccessfulFn = function () {
    return false;
  };
  var successfulFn = function () {
    return true;
  };

  beforeEach(function() {

    miroGocdMapper = require('../server/miro/gocdMapper');

  });

  describe('mapPipelineData()', function () {

    it('should set the stroke color to red if last build was unsuccessful', function () {
      var data = {
        history: {
          '125': { wasSuccessful: notSuccessfulFn },
          '124': { wasSuccessful: successfulFn }
        },
        activity: {
          jobs: []
        }
      };

      var result = miroGocdMapper.readHistoryAndActivity(data);

      expect(result.stroke.color).toBe('red');

    });

    it('should set the stroke color to black if last build was successful', function () {
      var data = {
        history: {
          '125': { wasSuccessful: successfulFn },
          '124': { wasSuccessful: notSuccessfulFn }
        },
        activity: {
          jobs: []
        }
      };
      var result = miroGocdMapper.readHistoryAndActivity(data);

      expect(result.stroke.color).toBe('black');

    });

    it('should set the size of stones according to the size of changes', function () {

      var data = {
        history: {
          '125': {
            wasSuccessful: notSuccessfulFn
          },
          '124': {
            wasSuccessful: notSuccessfulFn,
            "build_cause": {
              "files": [
                { "name":"aFile.txt", action: "modified" }
              ]
            }
          },
          '123': {
            wasSuccessful: notSuccessfulFn,
            "build_cause": {
              "files": [
                { "name":"aFile.txt", action: "modified" },
                { "name":"aFile.txt", action: "modified" },
                { "name":"aFile.txt", action: "created" },
                { "name":"aFile.txt", action: "modified" }
              ]
            }
          }
        },
        activity: {
          jobs: []
        }
      };

      var result = miroGocdMapper.readHistoryAndActivity(data);

      expect(result.stones[0].size).toBe('small'); // 1 modification
      expect(result.stones[1].size).toBe('medium'); // 2 modifications

    });

  });

});
