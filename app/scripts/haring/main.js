
var host = location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(host + '/haring');

var firstRowDiv = $($('.row')[0]);

ws.onmessage = function (event) {

  var historyData = JSON.parse(event.data);
  console.log(historyData);

  for(var i = 0; i < historyData.length; i++) {
    var entry = historyData[i];
    var columnDiv = $(firstRowDiv.find('.haring-border')[entry.column - 1]);
    var imgTag = $(columnDiv.find('img'));
    imgTag.attr('src', 'images/haring/' + entry.type + '.png');
    imgTag.removeClass();
    imgTag.addClass(entry.color);
    imgTag.tooltip({"title": entry.info, "placement":"bottom"});
  };

};
