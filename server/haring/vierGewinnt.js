
var _ = require('lodash');

function vierGewinntModule() {

  var NUM_TO_WIN = 4;
  var NUM_ROWS = 4;
  var DEFAULT_COLS_PER_ROW = 5;


  function isFigureSuccessful(figure) {
    if(figure.type === 'passed' || figure.type === 'passed_after_fail') {
      return true;
    } else {
      return false;
    }
  }

  function groupIsEligible(group) {
    var allDotted = _.every(group, { border: 'dotted' });
    return ! allDotted;
  }

  function markGroup(group, orientation) {
    if(group !== undefined && group.length > 0) {
      _.each(group, function (groupMember, index) {
        groupMember.four = {direction: orientation};
        if(index === 0) {
          groupMember.four.starter = true;
        }
      });
    }
    return group;
  }

  function checkGroup(figures, rangeOfIndices, orientation) {
    var groupToCheck = _.at(figures, rangeOfIndices);
    if(_.compact(groupToCheck).length === NUM_TO_WIN) {
      var allPassedWithSameAuthor = _.every(groupToCheck, function (groupMember) {
        return isFigureSuccessful(groupMember) && groupMember.initials === groupToCheck[0].initials;
      });

      var allFailedWithSameAuthor = _.every(groupToCheck, function (groupMember) {
        return ! isFigureSuccessful(groupMember) && groupMember.initials === groupToCheck[0].initials;
      });

      if ((allPassedWithSameAuthor || allFailedWithSameAuthor) && groupIsEligible(groupToCheck)) {
        return markGroup(groupToCheck, orientation);
      }
    }
  }


  function apply(figures, numColumns) {

    var colsPerRow = numColumns || DEFAULT_COLS_PER_ROW;

    function checkHorizontal(index) {
      var colIndex = index % colsPerRow;
      if(colIndex + NUM_TO_WIN <= colsPerRow) {
        return checkGroup(figures, _.range(index, index + NUM_TO_WIN), 'horizontal');
      }
    }

    function checkVertical(index) {
      var rowIndex = Math.floor(index / colsPerRow);
      if(rowIndex + NUM_TO_WIN <= NUM_ROWS) {
        var indices = [];
        _.times(NUM_TO_WIN, function(time) { indices.push(index + (time * colsPerRow)); })
        return checkGroup(figures, indices, 'vertical');
      }
    }

    function checkDiagonal(index) {
      var rowIndex = Math.floor(index / colsPerRow);
      var colIndex = index % colsPerRow;
      if(NUM_ROWS - NUM_TO_WIN >= rowIndex) {

        var leftToRight = 1,
          rightToLeft = -1,
          orientation = rightToLeft;
        if(colsPerRow - NUM_TO_WIN >= colIndex) {
          orientation = leftToRight;
        }

        var indices = [  ];
        _.times(NUM_TO_WIN, function(time) {
          indices.push(index + ((time * colsPerRow) + (orientation * time)));
        });
        return checkGroup(figures, indices, 'diagonal-' + (orientation > 0 ? 'lr' : 'rl'));
      }
    }

    var successfulGroup = undefined;
    var figuresSorted = _.sortBy(figures, 'time').reverse();
    _.each(figuresSorted, function(figure) {
      var realIndex = figures.indexOf(figure);
      successfulGroup = successfulGroup
        || checkDiagonal(realIndex)
        || checkVertical(realIndex)
        || checkHorizontal(realIndex);
    });

  }

  return {
    apply: apply
  }
}

exports.apply = vierGewinntModule().apply;