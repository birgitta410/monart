
var wsHost = location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(wsHost + '/haring');
var NUM_ROWS = 4;
var COLS_PER_ROW = 6;

var DATA = { figures: [] };

var WARM_COLORS = [ 'red', 'yellow', 'pink', 'orange' ];
var COLD_COLORS = [ 'blue', 'dark-blue', 'green', 'dark-green' ];

function randomWarmColor() {
  return WARM_COLORS[Math.floor(Math.random() * WARM_COLORS.length)];
}

function randomColdColor() {
  return COLD_COLORS[Math.floor(Math.random() * COLD_COLORS.length)];
}

function buildInitialGrid() {
  var container = $('.container');
  for(var r = 0; r < NUM_ROWS; r++) {
    var rowDiv = $('<div class="figure-row flexbox"></div>').appendTo(container);
    for (var c = 0; c < COLS_PER_ROW; c++) {
      rowDiv.append(
      '<div class="figure-wrapper"><div class="figure solid">' +
          '<div class="bg"></div>' +
          '<div class="letters"></div>' +
          '<img src="images/haring/dog.png" class="grey">' +
      '</div></div>');
    }
  }
}

buildInitialGrid();

function Chardiner() {

  var dottedExplained, colorsExplained, failFigureExplained, passFigureExplained;

  var hints = {};

  function rememberHint(rowIndex, colIndex) {
    hints[rowIndex] = [] || hints[rowIndex];
    hints[rowIndex].push(colIndex);
  }

  function spaceForHint(rowIndex, colIndex) {
    return ! _.contains(hints[rowIndex], colIndex)
      && ! _.contains(hints[rowIndex], colIndex -1)
      && ! (colIndex >= COLS_PER_ROW - 1);
  }

  var addHint = function(figureDiv, entry, colIndex, rowIndex) {
    if(spaceForHint(rowIndex, colIndex)) {
      if (entry.border === 'dotted' && !dottedExplained) {
        figureDiv.attr('data-intro', 'Dotted border: This is a job from the activity feed, it will show the separate jobs in a pipeline.');
        figureDiv.attr('data-position', 'right');
        dottedExplained = true;
        rememberHint(rowIndex, colIndex);
      }

      if (entry.color === 'WARM' && !colorsExplained) {
        figureDiv.attr('data-intro', 'The color corresponds to the result of a job or stage - warm colors (red, orange, pink) are for failed, cold colors (blue, green) for passed.');
        figureDiv.attr('data-position', 'right');
        colorsExplained = true;
        rememberHint(rowIndex, colIndex);
      }

      if (entry.type === 'crawling' && !failFigureExplained) {
        figureDiv.attr('data-intro', 'The type of figure corresponds to the result of a job or stage - a stumbling man means a stage just failed for the first time, the radiant baby means it is not the first time.');
        figureDiv.attr('data-position', 'right');
        failFigureExplained = true;
        rememberHint(rowIndex, colIndex);
      }

      if ((entry.type === 'walking' || entry.type === 'flying') && !passFigureExplained) {
        figureDiv.attr('data-intro', 'Figures for a successful stage or job are a walking man or the \'Flying Angel\'. The angel indicates that the stage just passed for the first time after a previous failure.');
        figureDiv.attr('data-position', 'right');
        passFigureExplained = true;
        rememberHint(rowIndex, colIndex);
      }
    }

  };

  var adjustPositioning = function(right) {
    var allToolTips = $(".chardinjs-tooltiptext");
    var toolTipLayer = allToolTips.parent();
    if (toolTipLayer !== undefined) {
      var top = toolTipLayer.position().top;
      toolTipLayer.attr('style', 'top: ' + top + 'px; right: -80px');
    }
  };

  return {
    addHint: addHint,
    adjustPositioning: adjustPositioning
  }

}

var chardiner = new Chardiner();

function iterateData(historyData, callback) {
  var rowIndex = -1;
  for(var i = 0; i < historyData.figures.length; i++) {
    var entry = historyData.figures[i];

    var colIndex = i % COLS_PER_ROW;
    if (i % COLS_PER_ROW === 0) rowIndex++;

    callback(i, entry, colIndex, rowIndex);

  }
}

function processFigure(index, entry, colIndex, rowIndex) {
  var previously = DATA.figures[index];

  if(_.isEqual(entry, previously)) {
    return;
  }

  var allRows = $('.figure-row');
  if(allRows.length > rowIndex) {
    var rowDiv = $(allRows[rowIndex]);

    var figureDiv = $(rowDiv.find('.figure')[colIndex]);

    chardiner.addHint(figureDiv, entry, colIndex, rowIndex);

    figureDiv.removeClass();
    figureDiv.addClass('figure');
    if(entry.border === 'dotted') {
      figureDiv.addClass('dotted');
    } else {
      figureDiv.addClass('solid');
    }

    figureDiv.tooltip({ placement: 'bottom'})
      .tooltip('hide')
      .attr('data-original-title', entry.info)
      .tooltip('fixTitle');

    if(entry.showInfo) {
      figureDiv.tooltip('show');
    }

    var imgTag = $(figureDiv.find('> img'));
    var imgExtension = entry.type === 'skating' ? '.gif' : '.png';
    imgTag.attr('src', 'images/haring/' + entry.type + imgExtension);
    imgTag.removeClass();

    if(entry.color === 'WARM') {
      imgTag.addClass(randomWarmColor());
    } else if(entry.color === 'COLD') {
      imgTag.addClass(randomColdColor());
    } else {
      imgTag.addClass(entry.color);
    }

    if(entry.type === 'skating') {
      imgTag.addClass('skating');
    }

    var lettersDiv = $(figureDiv.find('.letters'));
    lettersDiv.empty();
    if(entry.initials) {
      for (var l = 0; l < entry.initials.length; l++) {
        $('<img src="images/haring/alphabet/' + entry.initials[l].toLowerCase() + '.svg">').appendTo(lettersDiv);
      }
    }


  } else {
    console.log('not enough rows');
  }

}

ws.onmessage = function (event) {

  var historyData = JSON.parse(event.data);

  var bodyTag = $('body');
  bodyTag.removeClass();
  bodyTag.addClass(historyData.background);

  iterateData(historyData, processFigure);
  DATA = historyData;

};

// Let server know we're still watching (Keep alive Heroku)
setInterval(function() {

  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", location.origin + '/alive', false );
  xmlHttp.send( null );

}, 10 * 60 * 1000);

$('body').on('click', function() {
  $('body').chardinJs('start');
});

$('body').bind('chardinJs:start', chardiner.adjustPositioning);