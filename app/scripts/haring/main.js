
var host = location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(host + '/haring');
var NUM_ROWS = 4;
var COLS_PER_ROW = 6;

function buildGrid() {
  var container = $('.container');
  for(var r = 0; r < NUM_ROWS; r++) {
    var rowDiv = $('<div class="figure-row"></div>').appendTo(container);
    for (var c = 0; c < COLS_PER_ROW; c++) {
      rowDiv.append(
      '<div class="figure-wrapper"><div class="figure">' +
          '<img src="images/haring/dog.png" class="grey">' +
      '</div></div>');
    }
  }
}

buildGrid();

ws.onmessage = function (event) {

  var historyData = JSON.parse(event.data);
  console.log(historyData);

  var bodyTag = $('body');
  bodyTag.removeClass();
  bodyTag.addClass(historyData.background);

  var rowIndex = -1;
  for(var i = 0; i < historyData.figures.length; i++) {
    var entry = historyData.figures[i];

    var colIndex = i % COLS_PER_ROW;
    if(i % COLS_PER_ROW === 0) rowIndex ++;

    var allRows = $('.figure-row');
    if(allRows.length > rowIndex) {
      var rowDiv = $(allRows[rowIndex]);

      var columnDiv = $(rowDiv.find('.figure')[colIndex]);

      //    var infoSpan = $(columnDiv.find('.info'));
      //    infoSpan.html(entry.info);

      var imgTag = $(columnDiv.find('img'));
      imgTag.attr('src', 'images/haring/' + entry.type + '.png');
      imgTag.removeClass();
      imgTag.addClass(entry.color);
      imgTag.tooltip({ placement: 'bottom'})
        .tooltip('hide')
        .attr('data-original-title', entry.info)
        .tooltip('fixTitle');

    } else {
      console.log('not enough rows');
    }

  }

};
