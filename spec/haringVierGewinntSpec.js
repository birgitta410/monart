
var _ = require('lodash');
var vierGewinnt = require('../server/haring/vierGewinnt');

describe('Haring Vier Gewinnt', function () {

  var NUM_ROWS = 4;
  var NUM_COLS = 5;
  var NUM_FIGURES_IN_VIS = NUM_COLS * NUM_ROWS;

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
    vierGewinnt.apply(figures, NUM_COLS);
    var index = 0;
    expect(figures[index].four).toEqual({ direction: 'diagonal-lr', starter: true });
    index += NUM_COLS + 1;
    expect(figures[index].four).toEqual({ direction: 'diagonal-lr' });
    index += NUM_COLS + 1;
    expect(figures[index].four).toEqual({ direction: 'diagonal-lr' });
    index += NUM_COLS + 1;
    expect(figures[index].four).toEqual({ direction: 'diagonal-lr' });

  });

  it('should mark first vertical quadruple, if no diagonal before', function() {

    var figures = prepareFigures(NUM_FIGURES_IN_VIS, 0);
    figures[NUM_COLS + 1].type = 'fail';
    vierGewinnt.apply(figures, NUM_COLS);

    var index = 0;
    expect(figures[index].four).toEqual({ direction: 'vertical', starter: true });
    index += NUM_COLS;
    expect(figures[index].four).toEqual({ direction: 'vertical' });
    index += NUM_COLS;
    expect(figures[index].four).toEqual({ direction: 'vertical' });
    index += NUM_COLS;
    expect(figures[index].four).toEqual({ direction: 'vertical' });

  });

  it('should mark first horizontal quadruple, if no diagonal or vertical before', function() {
    var figures = prepareFigures(NUM_FIGURES_IN_VIS, 0);

    var startFailingSolids = 13;
    _.times(NUM_FIGURES_IN_VIS - startFailingSolids, function(time) {
      figures[(startFailingSolids + time)].type = 'fail';
    });

    vierGewinnt.apply(figures, NUM_COLS);

    expect(figures[0].four).toEqual({ direction: 'horizontal', starter: true });
    expect(figures[1].four).toEqual({ direction: 'horizontal' });
    expect(figures[2].four).toEqual({ direction: 'horizontal' });
    expect(figures[3].four).toEqual({ direction: 'horizontal' });

  });

  it('should not consider quadruples that only consist of dotted figures', function() {
    var numActivity = NUM_COLS - 1;
    var figures = prepareFigures(NUM_FIGURES_IN_VIS - numActivity, numActivity);

    var startFailingSolids = 13;
    _.times(NUM_FIGURES_IN_VIS - startFailingSolids, function(time) {
      figures[(startFailingSolids + time)].type = 'fail';
    });

    vierGewinnt.apply(figures, NUM_COLS);

    expect(figures[0].four).toBeUndefined();

    var index = NUM_COLS - 1;

    expect(figures[index].four).toEqual({ direction: 'horizontal' });
    index -= 1;
    expect(figures[index].four).toEqual({ direction: 'horizontal' });
    index -= 1;
    expect(figures[index].four).toEqual({ direction: 'horizontal' });
    index -= 1;
    expect(figures[index].four).toEqual({ direction: 'horizontal', starter: true });
  });

  it('should check for quadruples in order of the figures\' latest time', function() {

    var numActivity = NUM_COLS + 2;
    var figures = prepareFigures(NUM_FIGURES_IN_VIS - numActivity, numActivity);
    figures[0].time = 1419000842499;
    figures[1].time = 1419000842500;

    vierGewinnt.apply(figures, NUM_COLS);

    var index = 1;
    expect(figures[index].four).toEqual({ direction: 'diagonal-lr', starter: true });
    index += NUM_COLS + 1;
    expect(figures[index].four).toEqual({ direction: 'diagonal-lr' });
    index += NUM_COLS + 1;
    expect(figures[index].four).toEqual({ direction: 'diagonal-lr' });
    index += NUM_COLS + 1;
    expect(figures[index].four).toEqual({ direction: 'diagonal-lr' });

  });

});