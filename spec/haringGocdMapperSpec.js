
var _ = require('lodash');
var tk = require('timekeeper');

describe('Haring Go CD Mapper', function () {

  var NUM_FIGURES_IN_VIS = 24;

  var mockTime = { format: function () { } };
  var haringGocdMapper;
  var configData = {};

  var notSuccessfulFn = function () {
    return false;
  };
  var successfulFn = function () {
    return true;
  };

  beforeEach(function() {
    var mockery = require('mockery');
    var mockConfig = {
      create: function() {
        return {
          get: function() {
            return configData;
          }
        };
      }
    };

    mockery.enable({
      warnOnUnregistered: false,
      warnOnReplace: false
    });
    mockery.registerMock('../ymlHerokuConfig', mockConfig);

    haringGocdMapper = require('../server/haring/gocdMapper');

  });

  beforeEach(function() {
    configData = {};
  });

  describe('readHistoryAndActivity()', function() {

    it('should set the background colour to green if successful', function() {
      var data = {
        activity: {stages: [
          { name: 'NAME',
            wasSuccessful: successfulFn
          }
        ]},
        history: {
          '125': { wasSuccessful: successfulFn, time: mockTime, summary: {} }
        }
      };
      var result = haringGocdMapper.readHistoryAndActivity(data)
      expect(result.background).toBe('green');

    });

    it('should set the background colour to orange if unsuccessful', function() {
      var data = {
        history: {
          '125': { wasSuccessful: notSuccessfulFn, time: mockTime, summary: {} }
        },
        activity: {
          stages: [
            { name: 'NAME',
              wasSuccessful: notSuccessfulFn
            }
          ]
        }
      };

      var result = haringGocdMapper.readHistoryAndActivity(data)
      expect(result.background).toBe('orange');
    });

    it('should set the background colour to blue if building', function() {
      var data = {
        history: { '125': { wasSuccessful: successfulFn, time: mockTime, summary: {} } },
        activity: { stages: [
          { name: 'NAME',
            activity: 'Building',
            wasSuccessful: notSuccessfulFn
          }
        ]}
      };
      var result = haringGocdMapper.readHistoryAndActivity(data)
      expect(result.background).toBe('blue');

    });

    function preparePipelineAndActivity(numFailingHistory, numSuccessfulHistory, numSuccessfulActivity, numFailingActivity) {
      var fakePipelineHistory = {};
      _.times(numFailingHistory, function(n) {
        fakePipelineHistory[n + 1] = { wasSuccessful: notSuccessfulFn, 'test': 'not successful', key: n+1, summary: {} };
      });
      var offset = parseInt(_.findLastKey(fakePipelineHistory)) || 0;
      _.times(numSuccessfulHistory, function(n) {
        fakePipelineHistory[offset + n + 1] = { wasSuccessful: successfulFn, 'test': 'successful', key:  offset + n + 1, summary: {}};
      });

      var fakeActivity = [];
      _.times(numSuccessfulActivity, function(n) {
        fakeActivity.push({ buildNumber: n, wasSuccessful: successfulFn, 'test': 'successful' });
      });
      var activityOffset = fakeActivity.length || 0;
      _.times(numFailingActivity, function() {
        fakeActivity.push({ buildNumber: activityOffset, wasSuccessful: notSuccessfulFn, 'test': 'not successful' });
      });

      return {
        history: fakePipelineHistory,
        activity: { stages: fakeActivity }
      };
    }

    it('should return all activity figures and fill up to the maximum number of figures with history', function () {
      var NUM_FIGURES_IN_VIS = 20;

      var data = preparePipelineAndActivity(NUM_FIGURES_IN_VIS, 0, 8, 0);

      var result = haringGocdMapper.readHistoryAndActivity(data);
      expect(result.figures.length).toBe(NUM_FIGURES_IN_VIS);

      var firstHistoryFigure = result.figures[data.activity.stages.length];
      expect(firstHistoryFigure.key).toBe('20'); // still sorted descending by key

      var activityFigures = _.where(result.figures, function(figure) { return figure.border === 'dotted'; });
      expect(activityFigures.length).toBe(8);

    });

    it('should make a "great success" announcement if all visible history is successful', function () {
      var numActivity = 8;
      var numSuccessfulVisibleHistory = NUM_FIGURES_IN_VIS - numActivity; // 16
      var numFailingInvisibleHistory = 5;

      var data = preparePipelineAndActivity(numFailingInvisibleHistory, numSuccessfulVisibleHistory, numActivity, 0);

      var result = haringGocdMapper.readHistoryAndActivity(data);
      expect(result.announcementFigure).toBeDefined();
      expect(result.announcementFigure.word1).toBe('great');
      expect(result.announcementFigure.word2).toBe('success');
      expect(result.announcementFigure.type).toContain('great_success');
      expect(result.announcementFigure.color).toBe('blue');

    });

    it('should not make a "great success" announcement if there are failing entries in history', function () {

      var data = preparePipelineAndActivity(2, 8, 3, 0);

      var result = haringGocdMapper.readHistoryAndActivity(data);
      expect(result.announcementFigure).toBeUndefined();
    });

  });

  describe('mapPipelineDataToFigures()', function () {

    it('should set cancelled type if a stage got cancelled', function () {
      var data = {
        history: {
          '125': { wasSuccessful: notSuccessfulFn, time: mockTime, wasCancelled: function() { return true; } }
        },
        activity: {
          stages: []
        }
      };
      var result = haringGocdMapper.readHistoryAndActivity(data);
      expect(result.figures[0].type).toBe('cancelled');

    });

    it('should set fail_repeated type if failed and previous one was failure as well', function () {
      var data = {
        history: {
          '125': { wasSuccessful: notSuccessfulFn, time: mockTime },
          '124': { wasSuccessful: notSuccessfulFn, time: mockTime }
        },
        activity: {
          stages: []
        }
      };
      var result = haringGocdMapper.readHistoryAndActivity(data);
      expect(_.keys(result.figures).length).toBe(2);
      expect(result.figures[0].type).toBe('fail_repeated');

    });

    it('should set passed_after_fail type if previous failed, current is success', function () {
      // descending order, newest first
      var data = {
        history: {
          '124': { wasSuccessful: successfulFn, time: mockTime },
          '123': { wasSuccessful: notSuccessfulFn, time: mockTime }
        },
        activity: {
          stages: []
        }
      };
      var result = haringGocdMapper.readHistoryAndActivity(data);
      expect(_.keys(result.figures).length).toBe(2);
      expect(result.figures[0].type).toBe('passed_after_fail');

    });

    it('should set fail type if previous was successful', function () {
      // descending order, newest first
      var data = {
        history: {
          '124': { wasSuccessful: notSuccessfulFn, time: mockTime },
          '123': { wasSuccessful: successfulFn, time: mockTime }
        },
        activity: {
          stages: []
        }
      };
      var result = haringGocdMapper.readHistoryAndActivity(data);
      expect(_.keys(result.figures).length).toBe(2);
      expect(result.figures[0].type).toBe('fail');

    });

    it('should set color to WARM if failed, COLD if successful', function () {
      var data = {
        history: {
          '124': { wasSuccessful: notSuccessfulFn, time: mockTime },
          '123': { wasSuccessful: successfulFn, time: mockTime }
        },
        activity: {
          stages: []
        }
      };
      var result = haringGocdMapper.readHistoryAndActivity(data);

      expect(result.figures[0].color).toBe('WARM');
      expect(result.figures[1].color).toBe('COLD');

    });

    it('should set orange background colour if latest build failed', function () {
      var data = {
        history: {
          '124': { wasSuccessful: notSuccessfulFn, time: mockTime },
          '123': { wasSuccessful: successfulFn, time: mockTime }
        },
        activity: {
          stages: []
        }
      };
      var result = haringGocdMapper.readHistoryAndActivity(data);

      expect(result.background).toBe('orange');

    });

    it('should set green background colour if latest build successful', function () {
      var data = {
        history: {
          '124': { wasSuccessful: successfulFn, time: mockTime },
          '123': { wasSuccessful: notSuccessfulFn, time: mockTime }
        },
        activity: {
          stages: []
        }
      };
      var result = haringGocdMapper.readHistoryAndActivity(data);

      expect(result.background).toBe('green');
    });

    it('should not add initials of authors of both passed and failed jobs', function () {
      var data = {
        history: {
          '124': {
            wasSuccessful: successfulFn,
            summary: { author: {
              initials: 'MMU'
            }}
          },
          '123': {
            wasSuccessful: notSuccessfulFn,
            summary: { author: {
              initials: 'MMU'
            }}
          }
        },
        activity: {
          stages: []
        }
      };
      var result = haringGocdMapper.readHistoryAndActivity(data);

      expect(result.figures[0].initials).toBe('MMU');
      expect(result.figures[1].initials).toBe('MMU');

    });

    it('should set info texts', function() {
      var data = {
        history: {
          '124': {
            wasSuccessful: successfulFn,
            summary: { text: 'a text' },
            label: '124'
          }
        },
        activity: {
          stages: []
        }
      };
      var result = haringGocdMapper.readHistoryAndActivity(data);

      expect(result.figures[0].info).toBe('124');
      expect(result.figures[0].info2).toBe('a text');

    });

    it('should set the time', function() {
      var data = {
        history: {
          '124': {
            wasSuccessful: successfulFn,
            summary: {
              lastScheduled: '1419000842499'
            }
          }
        },
        activity: {
          stages: []
        }
      };
      var result = haringGocdMapper.readHistoryAndActivity(data);

      expect(result.figures[0].time).toBe(1419000842499);

    });

  });

  describe('mapActivityDataToFigures()', function () {

    it('should set dotted border for all activity entries', function () {
      var data = {
        history: { },
        activity: {
          stages: [
            { name: 'A-PIPELINE :: integration-test :: backend-integration',
              activity: 'Building',
              wasSuccessful: successfulFn
            }
          ]
        }
      };
      var result = haringGocdMapper.readHistoryAndActivity(data);

      expect(result.figures[0].border).toBe('dotted');

    });

    it('should set building type if currently building', function () {
      var data = {
        history: { },
        activity: {
          stages: [
            { name: 'A-PIPELINE :: integration-test :: backend-integration',
              isBuilding: function() {
                return true;
              },
              wasSuccessful: successfulFn
            }
          ]
        }
      };
      var result = haringGocdMapper.readHistoryAndActivity(data);

      expect(result.figures.length).toBe(1);
      expect(result.figures[0].type).toBe('building');

    });

    it('should set scheduled type if currently scheduled', function () {
      var data = {
        history: { },
        activity: {
          stages: [
            { name: 'A-PIPELINE :: integration-test :: backend-integration',
              isScheduled: function() {
                return true;
              },
              wasSuccessful: successfulFn
            }
          ]
        }
      };
      var result = haringGocdMapper.readHistoryAndActivity(data);

      expect(result.figures.length).toBe(1);
      expect(result.figures[0].type).toBe('scheduled');

    });

    it('should set cancelled type if stage was cancelled', function () {
      var data = {
        history: { },
        activity: {
          stages: [
            { name: 'A-PIPELINE :: integration-test :: backend-integration',
              activity: 'Sleeping',
              wasCancelled: function() {
                return true;
              },
              wasSuccessful: successfulFn
            }
          ]
        }
      };
      var result = haringGocdMapper.readHistoryAndActivity(data);

      expect(result.figures.length).toBe(1);
      expect(result.figures[0].type).toBe('cancelled');

    });

    it('should set type according to last build status if sleeping', function () {
      var data = {
        history: { },
        activity: {
          stages: [
            { name: 'A-PIPELINE :: integration-test :: backend-integration', wasSuccessful: successfulFn, activity: 'Sleeping' },
            { name: 'A-PIPELINE :: deploy-dev :: backend', wasSuccessful: notSuccessfulFn, activity: 'Sleeping' }
          ]
        }
      };
      var result = haringGocdMapper.readHistoryAndActivity(data);

      expect(result.figures.length).toBe(2);
      expect(result.figures[0].type).toBe('passed');
      expect(result.figures[1].type).toBe('fail');

    });

    it('should set the time', function () {
      var data = {
        history: { },
        activity: {
          stages: [
            { name: 'A-PIPELINE :: integration-test :: backend-integration',
              activity: 'Building',
              wasSuccessful: successfulFn,
              lastBuildTime: '2014-07-24T09:14:02'
            }
          ]
        }
      };
      var result = haringGocdMapper.readHistoryAndActivity(data);

      expect(result.figures[0].time).toEqual(1406193242000);

    });

    describe('fail_too_long', function() {
      beforeEach(function() {
        var clientDate = new Date(2014, 0, 1, 9, 45, 0);
        tk.freeze(clientDate);
      });

      afterEach(tk.reset);

      it('should be the type when build was more than 30 minutes ago', function() {
        var data = {
          history: { },
          activity: {
            stages: [
              { name: 'A-PIPELINE :: integration-test :: backend-integration',
                wasSuccessful: notSuccessfulFn,
                lastBuildTime: '2014-01-01T09:00:00'
              }
            ]
          }
        };
        var result = haringGocdMapper.readHistoryAndActivity(data);

        expect(result.figures[0].type).toEqual('fail_too_long');
        expect(result.figures[0].info).toContain('45 minutes');

      });

      it('should not be the type when failed build was less than 30 minutes ago', function() {
        var data = {
          history: { },
          activity: {
            stages: [
              { name: 'A-PIPELINE :: integration-test :: backend-integration',
                wasSuccessful: notSuccessfulFn,
                lastBuildTime: '2014-01-01T09:40:00'
              }
            ]
          }
        };

        var result = haringGocdMapper.readHistoryAndActivity(data);

        expect(result.figures[0].type).toEqual('fail');

      });

      it('should take into account a time difference to the server', function() {
        configData.timeDiff = -60;
        var goServerTimeLastBuild = '2014-01-01T10:00:00';
        var data = {
          history: { },
          activity: {
            stages: [
              { name: 'A-PIPELINE :: integration-test :: backend-integration',
                wasSuccessful: notSuccessfulFn,
                lastBuildTime: goServerTimeLastBuild
              }
            ]
          }
        };

        var result = haringGocdMapper.readHistoryAndActivity(data);
        expect(result.figures[0].type).toEqual('fail_too_long');
        expect(result.figures[0].info).toContain('45 minutes');

      });
    });

  });

});
