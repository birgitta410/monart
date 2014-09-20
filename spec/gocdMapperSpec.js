
var mockPipelineReader, mockCcTrayReader, fakePipelineHistory, fakeActivity, fakeBuildNumberInProgress = '1239';
var mockTime = { format: function () { } };

mockPipelineReader = {
  readHistory: function (callback, options) {
    callback(fakePipelineHistory, options ? options.callbackParameter : undefined);
  }
};

mockCcTrayReader = {
  readActivity: function (callback, options) {
    callback({ jobs: fakeActivity, buildNumberInProgress: fakeBuildNumberInProgress }, options ? options.callbackParameter : undefined);
  }
};

var mocks = {
  'server/sources/gocd/pipelineFeedReader': mockPipelineReader,
  'server/sources/cc/ccTrayReader': mockCcTrayReader
};

var context = createContext(mocks);

context(['lodash', 'server/haring/gocdMapper'], function(_, theGocdMapper) {

  if(theGocdMapper === undefined) {
    console.log('meh');
    return;
  }
  
  describe('Go CD Mapper', function () {

    var notSuccessfulFn = function () {
      return false;
    };
    var successfulFn = function () {
      return true;
    };

    describe('readHistoryAndActivity()', function() {

      beforeEach(function() {
        fakeActivity = [];
        fakePipelineHistory = {};
      });

      it('should set the background colour to green if successful', function() {
        fakePipelineHistory = {
          '125': { wasSuccessful: successfulFn, time: mockTime }
        };
        fakeActivity = [
          { name: 'NAME',
            wasSuccessful: successfulFn
          }
        ];
        theGocdMapper.readHistoryAndActivity(function(result) {
          expect(result.background).toBe('green');
        });
      });
      it('should set the background colour to orange if unsuccessful', function() {
        fakePipelineHistory = {
          '125': { wasSuccessful: notSuccessfulFn, time: mockTime }
        };
        fakeActivity = [
          { name: 'NAME',
            wasSuccessful: notSuccessfulFn
          }
        ];
        theGocdMapper.readHistoryAndActivity(function(result) {
          expect(result.background).toBe('orange');
        });
      });
      it('should set the background colour to blue if building', function() {
        fakePipelineHistory = {
          '125': { wasSuccessful: successfulFn, time: mockTime }
        };
        fakeActivity = [
          { name: 'NAME',
            activity: 'Building',
            wasSuccessful: notSuccessfulFn
          }
        ];
        theGocdMapper.readHistoryAndActivity(function(result) {
          expect(result.background).toBe('blue');
        });
      });

      it('should add info about author to activity from history, even if history failed', function () {
        fakePipelineHistory = {
          '125': {
            wasSuccessful: successfulFn,
            time: mockTime,
            author: {
              name: 'Max Mustermann'
            }
          }
        };
        fakeActivity = [
          {
            buildNumber: '125',
            wasSuccessful: notSuccessfulFn
          }
        ];
        theGocdMapper.readHistoryAndActivity(function(result) {
          expect(result.figures[0].initials).toBe('mmu');
          expect(result.figures[1].initials).toBeUndefined;
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
        _.times(numFailingActivity, function(n) {
          fakeActivity.push({ buildNumber: activityOffset, wasSuccessful: notSuccessfulFn, 'test': 'not successful' });
        });
      }

      it('should return all activity figures and fill up to the maximum number of figures with history', function () {
        var NUM_FIGURES_IN_VIS = 24;

        preparePipelineAndActivity(NUM_FIGURES_IN_VIS, 0, 8, 0);

        theGocdMapper.readHistoryAndActivity(function(result) {
          expect(result.figures.length).toBe(NUM_FIGURES_IN_VIS);

          var firstHistoryFigure = result.figures[fakeActivity.length];
          expect(firstHistoryFigure.key).toBe('24'); // still sorted descending by key
          var activityFigures = _.where(result.figures, function(figure) { return figure.border === 'dotted'; });
          expect(activityFigures.length).toBe(8);
        });
      });

      it('should make a "great success" announcement if all visible history is successful', function () {
        var NUM_FIGURES_IN_VIS = 24;
        var numActivity = 8;
        var numSuccessfulVisibleHistory = NUM_FIGURES_IN_VIS - numActivity; // 16
        var numFailingInvisibleHistory = 5;

        preparePipelineAndActivity(numFailingInvisibleHistory, numSuccessfulVisibleHistory, numActivity, 0);

        theGocdMapper.readHistoryAndActivity(function(result) {
          expect(result.announcementFigure).toBeDefined();
          expect(result.announcementFigure.word1).toBe('great');
          expect(result.announcementFigure.word2).toBe('success');
          expect(result.announcementFigure.type).toBe('crawling_takeoff');
          expect(result.announcementFigure.color).toBe('blue');
        });
      });

      it('should not make a "great success" announcement if there are failing entries in history', function () {

        preparePipelineAndActivity(2, 8, 3, 0);

        theGocdMapper.readHistoryAndActivity(function(result) {
          expect(result.announcementFigure).toBeUndefined();
        });
      });
    });

    describe('mapPipelineDataToFigures()', function () {

      beforeEach(function () {
        fakeActivity = [];
        fakePipelineHistory = {};
      });

      it('should set crawling type if failed and previous one was failure as well', function () {
        fakePipelineHistory = {
          '125': { wasSuccessful: notSuccessfulFn, time: mockTime },
          '124': { wasSuccessful: notSuccessfulFn, time: mockTime }
        };
        theGocdMapper.readHistoryAndActivity(function (result) {
          expect(_.keys(result.figures).length).toBe(2);
          expect(result.figures[0].type).toBe('crawling');
        });

      });

      it('should set flying type if previous failed, current is success', function () {
        // descending order, newest first
        fakePipelineHistory = {
          '124': { wasSuccessful: successfulFn, time: mockTime },
          '123': { wasSuccessful: notSuccessfulFn, time: mockTime }
        };
        theGocdMapper.readHistoryAndActivity(function (result) {
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
        theGocdMapper.readHistoryAndActivity(function (result) {
          expect(_.keys(result.figures).length).toBe(2);
          expect(result.figures[0].type).toBe('stumbling');
        });

      });

      it('should set color to WARM if failed, COLD if successful', function () {
        fakePipelineHistory = {
          '124': { wasSuccessful: notSuccessfulFn, time: mockTime },
          '123': { wasSuccessful: successfulFn, time: mockTime }
        };
        theGocdMapper.readHistoryAndActivity(function (result) {
          expect(result.figures[0].color).toBe('WARM');
          expect(result.figures[1].color).toBe('COLD');
        });

      });

      it('should create initials of person that broke the pipeline run', function () {
        fakePipelineHistory = {
          '123': {
            wasSuccessful: notSuccessfulFn,
            time: mockTime,
            author: {
              name: 'Max Mustermann'
            }
          },
          '122': {
            wasSuccessful: notSuccessfulFn,
            time: mockTime,
            author: {
              name: 'Has Three Names'
            }
          },
          '121': {
            wasSuccessful: notSuccessfulFn,
            time: mockTime,
            author: {
              name: 'Special Cäracter'
            }
          }
        };

        theGocdMapper.readHistoryAndActivity(function (result) {
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
        theGocdMapper.readHistoryAndActivity(function (result) {
          expect(result.background).toBe('orange');
        });
      });

      it('should set green background colour if latest build successful', function () {
        fakePipelineHistory = {
          '124': { wasSuccessful: successfulFn, time: mockTime },
          '123': { wasSuccessful: notSuccessfulFn, time: mockTime }
        };
        theGocdMapper.readHistoryAndActivity(function (result) {
          expect(result.background).toBe('green');
        });
      });

      it('should exclude the currently active build from the history', function () {
        spyOn(mockPipelineReader, 'readHistory');
        theGocdMapper.readHistoryAndActivity(function (result) { });

        var optionsReadHistory = mockPipelineReader.readHistory.mostRecentCall.args[1];
        expect(optionsReadHistory.exclude).toEqual([ fakeBuildNumberInProgress ]);
      });

      it('should not add initials of authors of passed jobs', function () {
        fakePipelineHistory = {
          '124': {
            wasSuccessful: successfulFn,
            author: {
              name: 'Max Mustermann',
              email: 'mmustermann@internet.se'
            }
          },
          '123': {
            wasSuccessful: notSuccessfulFn,
            author: {
              name: 'Max Mustermann',
              email: 'mmustermann@internet.se'
            }
          }
        };
        theGocdMapper.readHistoryAndActivity(function (result) {
          expect(result.figures[0].initials).toBeUndefined();
          expect(result.figures[1].initials).toBe('mmu');
        });
      });

      it('should put commit message into info text, if present', function () {
        fakePipelineHistory = {
          '124': {
            wasSuccessful: successfulFn,
            materials: {
              committer: 'Max Mustermann',
              comment: 'Awesome change'
            }
          }
        };
        theGocdMapper.readHistoryAndActivity(function (result) {
          expect(result.figures[0].info).toContain('Awesome change');
        });
      });
    });

    describe('mapActivityDataToFigures()', function () {

      beforeEach(function () {
        fakeActivity = [];
        fakePipelineHistory = {};
      });

      it('should set dotted border for all activity entries', function () {
        fakeActivity = [
          { name: 'A-PIPELINE :: integration-test :: backend-integration',
            activity: 'Building',
            wasSuccessful: successfulFn
          }
        ];
        theGocdMapper.readHistoryAndActivity(function (result) {
          expect(result.figures[0].border).toBe('dotted');
        });
      });

      it('should set skating type if currently building', function () {
        fakeActivity = [
          { name: 'A-PIPELINE :: integration-test :: backend-integration',
            activity: 'Building',
            wasSuccessful: successfulFn
          }
        ];
        console.log('++++++++++++++++++++++++++++++++++++++++++++');
        theGocdMapper.readHistoryAndActivity(function (result) {
          expect(result.figures.length).toBe(1);
          expect(result.figures[0].type).toBe('skating');
        });
        console.log('++++++++++++++++++++++++++++++++++++++++++++');
      });

      it('should set type according to last build status if sleeping', function () {
        fakeActivity = [
          { name: 'A-PIPELINE :: integration-test :: backend-integration', wasSuccessful: successfulFn, activity: 'Sleeping' },
          { name: 'A-PIPELINE :: deploy-dev :: backend', wasSuccessful: notSuccessfulFn, activity: 'Sleeping' }
        ];
        theGocdMapper.readHistoryAndActivity(function (result) {
          expect(result.figures.length).toBe(2);
          expect(result.figures[0].type).toBe('walking');
          expect(result.figures[1].type).toBe('stumbling');
        });
      });

      it('should show info by default if a stage fails', function () {
        fakeActivity = [
          {
            wasSuccessful: notSuccessfulFn
          }
        ];
        theGocdMapper.readHistoryAndActivity(function (result) {
          expect(result.figures[0].showInfo).toBe(true);
        });
      });

      it('should create initials of person that authored changes for a failed job', function () {
        fakeActivity = [
          {
            wasSuccessful: notSuccessfulFn,
            author: {
              name: 'Max Mustermann',
              email: 'mmustermann@internet.se'
            }
          }
        ];
        theGocdMapper.readHistoryAndActivity(function (result) {
          expect(result.figures[0].initials).toBe('mmu');
        });
      });

    });

  });
});