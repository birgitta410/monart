
var host = location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(host + '/haring');
var COLS_PER_ROW = 6;

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

    var rowDiv = $($('.row')[rowIndex]);
    var columnDiv = $(rowDiv.find('.haring-border')[colIndex]);

    var imgTag = $(columnDiv.find('img'));
    imgTag.attr('src', 'images/haring/' + entry.type + '.png');
    imgTag.removeClass();
    imgTag.addClass(entry.color);
    // TODO: Tooltip overwrite does not seem possible?
    imgTag.tooltip({"title": entry.info, "placement":"bottom"});

  }

};
