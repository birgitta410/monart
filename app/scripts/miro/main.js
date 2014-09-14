
var wsHost = 'ws://' + window.location.host;
var ws = new WebSocket(wsHost + '/miro');

var DATA = { stroke: {}, stones: [] };
var NUM_STONES = 5;

var LAST_PING = new Date();
var PING_INTERVAL = 5 * 60 * 1000;

function buildInitialGrid() {
  var container = $('.container');
  for(var r = 0; r < NUM_STONES; r++) {
    $('<div class="stone medium"><img src="images/miro/medium_black.png"></div>').appendTo(container);
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

  var imgTag = $(stoneDiv.find('> img'));
  imgTag.attr('src', 'images/miro/' + entry.size + '_' + entry.color + '.png');

}

ws.onmessage = function (event) {
  var data = JSON.parse(event.data);
  if(data.miro) {

    var historyData = data.miro;

    var strokeImgTag = $('.long-stroke > img');
    strokeImgTag.attr('src', 'images/miro/stroke_' + historyData.stroke.color + '.png');

    iterateStones(historyData, processStone);
    DATA = historyData;
  } else if(data.ping) {
    LAST_PING = new Date();
    console.log('ping success - still connected to server', LAST_PING);
  }

};

// Let server know we're still watching (Keep alive Heroku)
setInterval(function() {

  var timeSinceLastPing = new Date() - LAST_PING;
  if(timeSinceLastPing > (PING_INTERVAL * 1.1)) {
    console.log('Last successful ping too long ago', timeSinceLastPing);
    setBackgroundStyle('grey');
    window.location = window.location;
  }

  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", location.origin + '/alive', false );
  xmlHttp.send( null );

  ws.send('ping');

}, PING_INTERVAL);

