
var wsHost = location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(wsHost + '/haring');
var NUM_ROWS = 4;
var COLS_PER_ROW = 6;

var WARM_COLORS = [ 'red', 'yellow', 'pink', 'orange' ];
var COLD_COLORS = [ 'blue', 'dark-blue', 'green', 'dark-green' ];

function randomWarmColor() {
  return WARM_COLORS[Math.floor(Math.random() * WARM_COLORS.length)];
}

function randomColdColor() {
  return COLD_COLORS[Math.floor(Math.random() * COLD_COLORS.length)];
}

function buildGrid() {
  var container = $('.container');
  for(var r = 0; r < NUM_ROWS; r++) {
    var rowDiv = $('<div class="figure-row"></div>').appendTo(container);
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

buildGrid();

var DATA = { figures: [] };

ws.onmessage = function (event) {

  var historyData = JSON.parse(event.data);

  var bodyTag = $('body');
  bodyTag.removeClass();
  bodyTag.addClass(historyData.background);

  var rowIndex = -1;
  for(var i = 0; i < historyData.figures.length; i++) {
    var entry = historyData.figures[i];
    var previously = DATA.figures[i];

    var colIndex = i % COLS_PER_ROW;
    if(i % COLS_PER_ROW === 0) rowIndex ++;

    if(_.isEqual(entry, previously)) {
      continue;
    }

    var allRows = $('.figure-row');
    if(allRows.length > rowIndex) {
      var rowDiv = $(allRows[rowIndex]);

      var figureDiv = $(rowDiv.find('.figure')[colIndex]);
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

  DATA = historyData;

};

// Let server know we're still watching (Keep alive Heroku)
setInterval(function() {

  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", location.origin + '/alive', false );
  xmlHttp.send( null );

}, 10 * 1000);
