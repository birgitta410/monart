
var _ = require('lodash');
var vierGewinnt = require('../server/haring/vierGewinnt');

describe('Haring Vier Gewinnt', function () {

  var NUM_FIGURES_IN_VIS = 24;

  function prepareFigures(numSolid, numDotted) {
    var figures = [];
    var activityStartTime = 1262304000000;
    _.times(numDotted, function(n) {
      figures.push({ border: 'dotted', type: 'passed', time: activityStartTime + n});
    });
    var historyLatestTime = activityStartTime - 100;
    _.times(numSolid, function(n) {
      figures.push({ border: 'solid', type: 'passed', time: historyLatestTime - n });
    });

    return figures;
  }

  it('should mark first diagonal quadruple', function() {

    var figures = prepareFigures(NUM_FIGURES_IN_VIS, 0);
    vierGewinnt.apply(figures);
    expect(figures[0].four).toEqual({ direction: 'diagonal-lr', starter: true });
    expect(figures[7].four).toEqual({ direction: 'diagonal-lr' });
    expect(figures[14].four).toEqual({ direction: 'diagonal-lr' });
    expect(figures[21].four).toEqual({ direction: 'diagonal-lr' });

  });

  it('should mark first vertical quadruple, if no diagonal before', function() {

    var figures = prepareFigures(NUM_FIGURES_IN_VIS, 0);
    figures[7].type = 'fail';
    vierGewinnt.apply(figures);

    expect(figures[0].four).toEqual({ direction: 'vertical', starter: true });
    expect(figures[6].four).toEqual({ direction: 'vertical' });
    expect(figures[12].four).toEqual({ direction: 'vertical' });
    expect(figures[18].four).toEqual({ direction: 'vertical' });

  });

  it('should mark first horizontal quadruple, if no diagonal or vertical before', function() {
    var figures = prepareFigures(NUM_FIGURES_IN_VIS, 0);

    var startFailingSolids = 13;
    _.times(NUM_FIGURES_IN_VIS - startFailingSolids, function(time) {
      figures[(startFailingSolids + time)].type = 'fail';
    });

    vierGewinnt.apply(figures);

    expect(figures[0].four).toEqual({ direction: 'horizontal', starter: true });
    expect(figures[1].four).toEqual({ direction: 'horizontal' });
    expect(figures[2].four).toEqual({ direction: 'horizontal' });
    expect(figures[3].four).toEqual({ direction: 'horizontal' });

  });

  it('should not consider quadruples that only consist of dotted figures', function() {
    var numActivity = 5;
    var figures = prepareFigures(NUM_FIGURES_IN_VIS - numActivity, numActivity);

    var startFailingSolids = 13;
    _.times(NUM_FIGURES_IN_VIS - startFailingSolids, function(time) {
      figures[(startFailingSolids + time)].type = 'fail';
    });

    vierGewinnt.apply(figures);

    expect(figures[0].four).toBeUndefined();
    expect(figures[1].four).toBeUndefined();
    expect(figures[2].four).toEqual({ direction: 'horizontal', starter: true });
    expect(figures[3].four).toEqual({ direction: 'horizontal' });
    expect(figures[4].four).toEqual({ direction: 'horizontal' });
    expect(figures[5].four).toEqual({ direction: 'horizontal' });
  });

  it('should check for quadruples in order of the figures\' latest time', function() {

    var numActivity = 8;
    var figures = prepareFigures(NUM_FIGURES_IN_VIS - numActivity, numActivity);
    figures[0].time = 1419000842499;
    figures[1].time = 1419000842500;

    vierGewinnt.apply(figures);

    expect(figures[1].four).toEqual({ direction: 'diagonal-lr', starter: true });
    expect(figures[8].four).toEqual({ direction: 'diagonal-lr' });
    expect(figures[15].four).toEqual({ direction: 'diagonal-lr' });
    expect(figures[22].four).toEqual({ direction: 'diagonal-lr' });

  });

});