
var Q = require('q');
var _ = require('lodash');

describe('Haring Go CD Mapper', function () {

  var NUM_FIGURES_IN_VIS = 24;

  var mockTime = { format: function () { } };
  var fakePipelineHistory, fakeActivity;
  var haringGocdMapper;

  var notSuccessfulFn = function () {
    return false;
  };
  var successfulFn = function () {
    return true;
  };

  beforeEach(function() {
    var mockery = require('mockery');
    var mockGocdApi = {
      readData: function () {
        var defer = Q.defer();
        defer.resolve({
          activity: {jobs: fakeActivity},
          history: fakePipelineHistory
        });
        return defer.promise;
      },
      readActivity: function () {
        var defer = Q.defer();
        defer.resolve({jobs: fakeActivity});
        return defer.promise;
      }
    };

    mockery.enable({
      warnOnUnregistered: false,
      warnOnReplace: false
    });
    mockery.registerMock('gocd-api', { getInstance: function() { return mockGocdApi; }});

    haringGocdMapper = require('../server/haring/gocdMapper');

  });

  describe('readHistoryAndActivity()', function() {

    beforeEach(function() {
      fakeActivity = [];
      fakePipelineHistory = {};
    });

    it('should set the background colour to green if successful', function(done) {
      fakePipelineHistory = {
        '125': { wasSuccessful: successfulFn, time: mockTime }
      };
      fakeActivity = [
        { name: 'NAME',
          wasSuccessful: successfulFn
        }
      ];
      haringGocdMapper.readHistoryAndActivity().then(function(result) {
        expect(result.background).toBe('green');
        done();
      }, function() {
        console.log('error', arguments);
      });
    });

    it('should set the background colour to orange if unsuccessful', function(done) {
      fakePipelineHistory = {
        '125': { wasSuccessful: notSuccessfulFn, time: mockTime }
      };
      fakeActivity = [
        { name: 'NAME',
          wasSuccessful: notSuccessfulFn
        }
      ];
      haringGocdMapper.readHistoryAndActivity().then(function(result) {
        expect(result.background).toBe('orange');
        done();
      });
    });

    it('should set the background colour to blue if building', function(done) {
      fakePipelineHistory = {
        '125': { wasSuccessful: successfulFn, time: mockTime }
      };
      fakeActivity = [
        { name: 'NAME',
          activity: 'Building',
          wasSuccessful: notSuccessfulFn
        }
      ];
      haringGocdMapper.readHistoryAndActivity().then(function(result) {
        expect(result.background).toBe('blue');
        done();
      });
    });

    it('should add info about author to activity from history, even if history failed', function (done) {
      fakePipelineHistory = {
        '125': {
          wasSuccessful: successfulFn,
          time: mockTime,
          author: {
            initials: 'mmu'
          }
        }
      };
      fakeActivity = [
        {
          buildNumber: '125',
          wasSuccessful: notSuccessfulFn
        }
      ];
      haringGocdMapper.readHistoryAndActivity().then(function(result) {
        expect(result.figures[0].initials).toBe('mmu');
        expect(result.figures[1].initials).toBe('mmu');
        done();
      });
    });

    function preparePipelineAndActivity(numFailingHistory, numSuccessfulHistory, numSuccessfulActivity, numFailingActivity) {
      fakePipelineHistory = {};
      _.times(numFailingHistory, function(n) {
        fakePipelineHistory[n + 1] = { wasSuccessful: notSuccessfulFn, 'test': 'not successful', key: n+1 };
      });
      var offset = parseInt(_.findLastKey(fakePipelineHistory)) || 0;
      _.times(numSuccessfulHistory, function(n) {
        fakePipelineHistory[offset + n + 1] = { wasSuccessful: successfulFn, 'test': 'successful', key:  offset + n + 1};
      });

      fakeActivity = [];
      _.times(numSuccessfulActivity, function(n) {
        fakeActivity.push({ buildNumber: n, wasSuccessful: successfulFn, 'test': 'successful' });
      });
      var activityOffset = fakeActivity.length || 0;
      _.times(numFailingActivity, function() {
        fakeActivity.push({ buildNumber: activityOffset, wasSuccessful: notSuccessfulFn, 'test': 'not successful' });
      });
    }

    it('should return all activity figures and fill up to the maximum number of figures with history', function (done) {
      var NUM_FIGURES_IN_VIS = 24;

      preparePipelineAndActivity(NUM_FIGURES_IN_VIS, 0, 8, 0);

      haringGocdMapper.readHistoryAndActivity().then(function(result) {
        expect(result.figures.length).toBe(NUM_FIGURES_IN_VIS);

        var firstHistoryFigure = result.figures[fakeActivity.length];
        expect(firstHistoryFigure.key).toBe('24'); // still sorted descending by key

        var activityFigures = _.where(result.figures, function(figure) { return figure.border === 'dotted'; });
        expect(activityFigures.length).toBe(8);
        done();
      });
    });

    it('should make a "great success" announcement if all visible history is successful', function (done) {
      var numActivity = 8;
      var numSuccessfulVisibleHistory = NUM_FIGURES_IN_VIS - numActivity; // 16
      var numFailingInvisibleHistory = 5;

      preparePipelineAndActivity(numFailingInvisibleHistory, numSuccessfulVisibleHistory, numActivity, 0);

      haringGocdMapper.readHistoryAndActivity().then(function(result) {
        expect(result.announcementFigure).toBeDefined();
        expect(result.announcementFigure.word1).toBe('great');
        expect(result.announcementFigure.word2).toBe('success');
        expect(result.announcementFigure.type).toContain('great_success');
        expect(result.announcementFigure.color).toBe('blue');
        done();
      });
    });

    it('should not make a "great success" announcement if there are failing entries in history', function (done) {

      preparePipelineAndActivity(2, 8, 3, 0);

      haringGocdMapper.readHistoryAndActivity().then(function(result) {
        expect(result.announcementFigure).toBeUndefined();
        done();
      });
    });

  });

  describe('mapPipelineDataToFigures()', function () {

    beforeEach(function () {
      fakeActivity = [];
      fakePipelineHistory = {};
    });

    it('should set fail_repeated type if failed and previous one was failure as well', function (done) {
      fakePipelineHistory = {
        '125': { wasSuccessful: notSuccessfulFn, time: mockTime },
        '124': { wasSuccessful: notSuccessfulFn, time: mockTime }
      };
      haringGocdMapper.readHistoryAndActivity().then(function (result) {
        expect(_.keys(result.figures).length).toBe(2);
        expect(result.figures[0].type).toBe('fail_repeated');
        done();
      });

    });

    it('should set passed_after_fail type if previous failed, current is success', function (done) {
      // descending order, newest first
      fakePipelineHistory = {
        '124': { wasSuccessful: successfulFn, time: mockTime },
        '123': { wasSuccessful: notSuccessfulFn, time: mockTime }
      };
      haringGocdMapper.readHistoryAndActivity().then(function (result) {
        expect(_.keys(result.figures).length).toBe(2);
        expect(result.figures[0].type).toBe('passed_after_fail');
        done();
      });

    });

    it('should set fail type if previous was successful', function (done) {
      // descending order, newest first
      fakePipelineHistory = {
        '124': { wasSuccessful: notSuccessfulFn, time: mockTime },
        '123': { wasSuccessful: successfulFn, time: mockTime }
      };
      haringGocdMapper.readHistoryAndActivity().then(function (result) {
        expect(_.keys(result.figures).length).toBe(2);
        expect(result.figures[0].type).toBe('fail');
        done();
      });

    });

    it('should set color to WARM if failed, COLD if successful', function (done) {
      fakePipelineHistory = {
        '124': { wasSuccessful: notSuccessfulFn, time: mockTime },
        '123': { wasSuccessful: successfulFn, time: mockTime }
      };
      haringGocdMapper.readHistoryAndActivity().then(function (result) {
        expect(result.figures[0].color).toBe('WARM');
        expect(result.figures[1].color).toBe('COLD');
        done();
      });

    });

    it('should set orange background colour if latest build failed', function (done) {
      fakePipelineHistory = {
        '124': { wasSuccessful: notSuccessfulFn, time: mockTime },
        '123': { wasSuccessful: successfulFn, time: mockTime }
      };
      haringGocdMapper.readHistoryAndActivity().then(function (result) {
        expect(result.background).toBe('orange');
        done();
      });
    });

    it('should set green background colour if latest build successful', function (done) {
      fakePipelineHistory = {
        '124': { wasSuccessful: successfulFn, time: mockTime },
        '123': { wasSuccessful: notSuccessfulFn, time: mockTime }
      };
      haringGocdMapper.readHistoryAndActivity().then(function (result) {
        expect(result.background).toBe('green');
        done();
      });
    });

    it('should not add initials of authors of both passed and failed jobs', function (done) {
      fakePipelineHistory = {
        '124': {
          wasSuccessful: successfulFn,
          author: {
            initials: 'mmu'
          }
        },
        '123': {
          wasSuccessful: notSuccessfulFn,
          author: {
            initials: 'mmu'
          }
        }
      };
      haringGocdMapper.readHistoryAndActivity().then(function (result) {
        expect(result.figures[0].initials).toBe('mmu');
        expect(result.figures[1].initials).toBe('mmu');
        done();
      });
    });

    it('should set info texts', function(done) {
      fakePipelineHistory = {
        '124': {
          wasSuccessful: successfulFn,
          label: '124',
          info: 'a text'
        }
      };
      haringGocdMapper.readHistoryAndActivity().then(function (result) {
        expect(result.figures[0].info).toBe('124');
        expect(result.figures[0].info2).toBe('a text');
        done();
      });
    });

    it('should set the time', function(done) {
      fakePipelineHistory = {
        '124': {
          wasSuccessful: successfulFn,
          last_scheduled: '1419000842499'
        }
      };
      haringGocdMapper.readHistoryAndActivity().then(function (result) {
        expect(result.figures[0].time).toBe(1419000842499);
        done();
      });
    });

  });

  describe('mapActivityDataToFigures()', function () {

    beforeEach(function () {
      fakeActivity = [];
      fakePipelineHistory = {};
    });

    it('should set dotted border for all activity entries', function (done) {
      fakeActivity = [
        { name: 'A-PIPELINE :: integration-test :: backend-integration',
          activity: 'Building',
          wasSuccessful: successfulFn
        }
      ];
      haringGocdMapper.readHistoryAndActivity().then(function (result) {
        expect(result.figures[0].border).toBe('dotted');
        done();
      });
    });

    it('should set building type if currently building', function (done) {
      fakeActivity = [
        { name: 'A-PIPELINE :: integration-test :: backend-integration',
          activity: 'Building',
          wasSuccessful: successfulFn
        }
      ];
      haringGocdMapper.readHistoryAndActivity().then(function (result) {
        expect(result.figures.length).toBe(1);
        expect(result.figures[0].type).toBe('building');
        done();
      });
    });

    it('should set type according to last build status if sleeping', function (done) {
      fakeActivity = [
        { name: 'A-PIPELINE :: integration-test :: backend-integration', wasSuccessful: successfulFn, activity: 'Sleeping' },
        { name: 'A-PIPELINE :: deploy-dev :: backend', wasSuccessful: notSuccessfulFn, activity: 'Sleeping' }
      ];
      haringGocdMapper.readHistoryAndActivity().then(function (result) {
        expect(result.figures.length).toBe(2);
        expect(result.figures[0].type).toBe('passed');
        expect(result.figures[1].type).toBe('fail');
        done();
      });
    });

    it('should set the time', function (done) {
      fakeActivity = [
        { name: 'A-PIPELINE :: integration-test :: backend-integration',
          activity: 'Building',
          wasSuccessful: successfulFn,
          lastBuildTime: '2014-07-24T09:14:02'
        }
      ];
      haringGocdMapper.readHistoryAndActivity().then(function (result) {
        expect(result.figures[0].time).toEqual(1406193242000);
        done();
      });
    });

  });

});
