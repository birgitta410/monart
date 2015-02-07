
var DATA = { stroke: {}, stones: [] };
var NUM_STONES = 5;

function buildInitialGrid() {
  var container = $('.container');
  for(var r = 0; r < NUM_STONES; r++) {
    $('<div class="stone"><img src="images/medium_black.png"></div>').appendTo(container);
  }
}

buildInitialGrid();

function iterateStones(historyData, callback) {

  for(var i = 0; i < historyData.stones.length; i++) {
    var entry = historyData.stones[i];
    callback(i, entry);

  }
}

function processStone(index, entry) {
  var previously = DATA.stones[index];

  if(_.isEqual(entry, previously)) {
    return;
  }

  var allStones = $('.stone');
  var stoneDiv = $(allStones[index]);

  stoneDiv.addClass(entry.size);

  stoneDiv.tooltip({ placement: 'right'})
    .tooltip('hide')
    .attr('data-original-title', entry.info)
    .tooltip('fixTitle');

  if(entry.showInfo) {
    stoneDiv.tooltip('show');
  }

  var imgTag = $(stoneDiv.find('> img'));
  imgTag.attr('src', 'images/' + entry.size + '_' + entry.color + '.png');

}


function processNewData(historyData) {

  var strokeImgTag = $('.long-stroke > img');
  strokeImgTag.attr('src', 'images/stroke_' + historyData.stroke.color + '.png');
  strokeImgTag.tooltip({ placement: 'right'})
    .tooltip('hide')
    .attr('data-original-title', historyData.stroke.info)
    .tooltip('fixTitle');

  iterateStones(historyData, processStone);
  DATA = historyData;
}

var wsHost = 'ws://' + window.location.host;
var ws = new WebSocket(wsHost + '/miro');

ws.onmessage = function (event) {
  artwise.processMessage(event, 'miro', processNewData);
};

// TODO
artwise.initPing(ws, function() { console.log('no connection!'); });
