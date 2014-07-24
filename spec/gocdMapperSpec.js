var _ = require('lodash');
var gocdMapperModule = require('../server/haring/gocdMapper');

describe('Go CD Mapper', function () {
  describe('mapPipelineDataToFigures()', function () {

    var theGocdMapper, mockPipelineReader;
    var fakePipelineHistory;
    var mockTime = { format: function () { } };
    var notSuccessfulFn = function() { return false; };
    var successfulFn = function() { return true; };

    beforeEach(function() {
      mockPipelineReader = {
        readHistory: function(callback, callbackParameter) {
          callback(fakePipelineHistory, callbackParameter);
        }
      };
      theGocdMapper = gocdMapperModule.create(mockPipelineReader);
    });

    it('should return crawling type if failed and previous one was failure as well', function () {
      fakePipelineHistory = {
        '125': { wasSuccessful: notSuccessfulFn, time: mockTime },
        '124': { wasSuccessful: notSuccessfulFn, time: mockTime }
      };
      theGocdMapper.readHistory(function(result) {
        expect(_.keys(result.figures).length).toBe(2);
        expect(result.figures[0].type).toBe('crawling');
      });

    });

    it('should return flying type if previous failed, current is success', function () {
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

    it('should return stumbling type if previous was successful', function () {
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

  });

  describe('mapPipelineDataToFigures()', function () {

    var theGocdMapper, mockCcTrayReader;
    var fakeActivity;

    beforeEach(function () {
      mockCcTrayReader = {
        readActivity: function (callback, callbackParameter) {
          callback(fakeActivity, callbackParameter);
        }
      };
      theGocdMapper = gocdMapperModule.create({}, mockCcTrayReader);
    });

    it('should return skating type if currently building', function () {
      fakeActivity = [
        { name : 'A-PIPELINE :: integration-test :: backend-integration', activity: 'Building' }
      ];
      theGocdMapper.readActivity(function(result) {
        expect(result.figures.length).toBe(1);
        expect(result.figures[0].type).toBe('skating');
      });
    });

    it('should return dog type if sleeping', function () {
      fakeActivity = [
        { name : 'A-PIPELINE :: integration-test :: backend-integration', activity: 'Sleeping' }
      ];
      theGocdMapper.readActivity(function(result) {
        expect(result.figures.length).toBe(1);
        expect(result.figures[0].type).toBe('dog');
      });
    });

  });

});
