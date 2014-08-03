var _ = require('lodash');
var gocdMapperModule = require('../server/haring/gocdMapper');

describe('Go CD Mapper', function () {

  var notSuccessfulFn = function() { return false; };
  var successfulFn = function() { return true; };

  describe('mapPipelineDataToFigures()', function () {

    var theGocdMapper, mockPipelineReader;
    var fakePipelineHistory;
    var mockTime = { format: function () { } };

    beforeEach(function() {
      mockPipelineReader = {
        readHistory: function(callback, options) {
          callback(fakePipelineHistory, options.callbackParameter);
        }
      };
      theGocdMapper = gocdMapperModule.create(mockPipelineReader);
    });

    it('should set crawling type if failed and previous one was failure as well', function () {
      fakePipelineHistory = {
        '125': { wasSuccessful: notSuccessfulFn, time: mockTime },
        '124': { wasSuccessful: notSuccessfulFn, time: mockTime }
      };
      theGocdMapper.readHistory(function(result) {
        expect(_.keys(result.figures).length).toBe(2);
        expect(result.figures[0].type).toBe('crawling');
      });

    });

    it('should set flying type if previous failed, current is success', function () {
      // descending order, newest first
      fakePipelineHistory = {
        '124': { wasSuccessful: successfulFn, time: mockTime } ,
        '123': { wasSuccessful: notSuccessfulFn, time: mockTime }
      };
      theGocdMapper.readHistory(function(result) {
        expect(_.keys(result.figures).length).toBe(2);
        expect(result.figures[0].type).toBe('flying');
      });

    });

    it('should set stumbling type if previous was successful', function () {
      // descending order, newest first
      fakePipelineHistory = {
        '124': { wasSuccessful: notSuccessfulFn, time: mockTime },
        '123': { wasSuccessful: successfulFn, time: mockTime }
      };
      theGocdMapper.readHistory(function(result) {
        expect(_.keys(result.figures).length).toBe(2);
        expect(result.figures[0].type).toBe('stumbling');
      });

    });

    it('should create initials of person that broke the pipeline run', function () {
      fakePipelineHistory = {
        '123': {
          wasSuccessful: notSuccessfulFn,
          time: mockTime,
          breaker: {
            name: 'Max Mustermann'
          }
        },
        '122': {
          wasSuccessful: notSuccessfulFn,
          time: mockTime,
          breaker: {
            name: 'Has Three Names'
          }
        },
        '121': {
          wasSuccessful: notSuccessfulFn,
          time: mockTime,
          breaker: {
            name: 'Special Cäracter'
          }
        }
      };

      theGocdMapper.readHistory(function(result) {
        expect(result.figures[0].initials).toBe('mmu');
        expect(result.figures[1].initials).toBe('htn');
        expect(result.figures[2].initials).toBe('scx');
      });
    });

    it('should set orange background colour if latest build failed', function () {
      fakePipelineHistory = {
        '124': { wasSuccessful: notSuccessfulFn, time: mockTime },
        '123': { wasSuccessful: successfulFn, time: mockTime }
      };
      theGocdMapper.readHistory(function(result) {
        expect(result.background).toBe('orange');
      });
    });

    it('should set green background colour if latest build successful', function () {
      fakePipelineHistory = {
        '124': { wasSuccessful: successfulFn, time: mockTime },
        '123': { wasSuccessful: notSuccessfulFn, time: mockTime }
      };
      theGocdMapper.readHistory(function(result) {
        expect(result.background).toBe('green');
      });
    });

    it('should exclude the currently active build from the history', function () {
      var anActiveBuildNumber = '945';
      spyOn(mockPipelineReader, 'readHistory');
      theGocdMapper.readHistory(function(result) { }, anActiveBuildNumber);

      var optionsReadHistory = mockPipelineReader.readHistory.mostRecentCall.args[1];
      expect(optionsReadHistory.exclude).toEqual([ anActiveBuildNumber ]);
    });

  });

  describe('mapActivityDataToFigures()', function () {

    var theGocdMapper, mockCcTrayReader;
    var fakeActivity;

    beforeEach(function () {
      mockCcTrayReader = {
        readActivity: function (callback, options) {
          callback({ jobs: fakeActivity, buildNumberInProgress: '1239' }, options.callbackParameter);
        }
      };
      theGocdMapper = gocdMapperModule.create({}, mockCcTrayReader);
    });

    it('should set dotted border for all activity entries', function () {
      fakeActivity = [
        { name : 'A-PIPELINE :: integration-test :: backend-integration', activity: 'Building' }
      ];
      theGocdMapper.readActivity(function(result) {
        expect(result.figures[0].border).toBe('dotted');
      });
    });

    it('should set skating type if currently building', function () {
      fakeActivity = [
        { name : 'A-PIPELINE :: integration-test :: backend-integration', activity: 'Building' }
      ];
      theGocdMapper.readActivity(function(result) {
        expect(result.figures.length).toBe(1);
        expect(result.figures[0].type).toBe('skating');
      });
    });

    it('should set type according to last build status if sleeping', function () {
      fakeActivity = [
        { name : 'A-PIPELINE :: integration-test :: backend-integration', wasSuccessful: successfulFn, activity: 'Sleeping' },
        { name : 'A-PIPELINE :: deploy-dev :: backend', wasSuccessful: notSuccessfulFn, activity: 'Sleeping' }
      ];
      theGocdMapper.readActivity(function(result) {
        expect(result.figures.length).toBe(2);
        expect(result.figures[0].type).toBe('walking');
        expect(result.figures[1].type).toBe('stumbling');
      });
    });

    it('should create initials of person that broke a job', function () {
      fakeActivity = [ {
        wasSuccessful: notSuccessfulFn,
        breaker: {
          name: 'Max Mustermann',
          email: 'mmustermann@internet.se'
        }
      } ];
      theGocdMapper.readActivity(function(result) {
        expect(result.figures[0].initials).toBe('mmu');
      });
    });

  });

});
