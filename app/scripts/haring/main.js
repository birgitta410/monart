
var host = location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(host + '/haring');
var COLS_PER_ROW = 6;

ws.onmessage = function (event) {

  var historyData = JSON.parse(event.data);
  console.log(historyData);

  var rowIndex = -1;
  for(var i = 0; i < historyData.length; i++) {
    var entry = historyData[i];

    var colIndex = (entry.column - 1) % COLS_PER_ROW;
    if(i % COLS_PER_ROW === 0) rowIndex ++;

    var rowDiv = $($('.row')[rowIndex]);
    var columnDiv = $(rowDiv.find('.haring-border')[colIndex]);

    var imgTag = $(columnDiv.find('img'));
    imgTag.attr('src', 'images/haring/' + entry.type + '.png');
    imgTag.removeClass();
    imgTag.addClass(entry.color);
    imgTag.tooltip({"title": entry.info, "placement":"bottom"});
  };

};
