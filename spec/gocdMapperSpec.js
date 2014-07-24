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
        init: jasmine.createSpy('init'),
        readHistory: function(callback, callbackParameter) {
          callback(fakePipelineHistory, callbackParameter);
        }
      };
      theGocdMapper = gocdMapperModule.create(mockPipelineReader);
    });

    it('should return crawling image if failed and previous one was failure as well', function () {
      fakePipelineHistory = {
        '125': { wasSuccessful: notSuccessfulFn, time: mockTime },
        '124': { wasSuccessful: notSuccessfulFn, time: mockTime }
      };
      theGocdMapper.readHistory(function(result) {
        expect(_.keys(result.figures).length).toBe(2);
        expect(result.figures[0].type).toBe('crawling');
      });

    });

    it('should return flying image if previous failed, current is success', function () {
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

    it('should return stumbling image if previous was successful', function () {
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

    it('should set orange background colour if latest build failed', function () {
      fakePipelineHistory = {
        '124': { wasSuccessful: successfulFn, time: mockTime },
        '123': { wasSuccessful: notSuccessfulFn, time: mockTime }
      };
      theGocdMapper.readHistory(function(result) {
        expect(result.background).toBe('green');
      });
    });

  });
});
