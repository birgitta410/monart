

var MonartDataSource = function(identifier, onData, onConnectionLost, onError) {

  var LAST_PING = new Date();
  var PING_INTERVAL = 5 * 60 * 1000;

  function getPipeline() {
    var match = window.location.search.match(/pipeline=([^&]+)/);
    if(match) {
      return match[1];
    } else {
      onError('Please provide pipeline name ?pipeline=...');
    }
  }

  function getNumColumns() {
    var match = window.location.search.match(/columns=([^&]+)/);
    if(match) {
      return match[1];
    } else {
      return 6;
    }
  }

  function processMessage(event) {
    var data = JSON.parse(event.data);
    var statusMessage = $('#status-message');
    var statusProgress = $('#status-progress');
    if (data[identifier]) {
      statusMessage.hide();
      statusProgress.text('.');

      onData(data[identifier]);

    } else if (data.loading === true) {
      statusMessage.show();
      var progress = statusProgress.text() + '.';
      statusProgress.text(progress);
    } else if(data.error) {
      console.log('ERROR', data.error);
      if(onError) {
        onError(data.error);
      }
    } else if (data.ping) {
      LAST_PING = new Date();
      console.log('ping success - still connected to server', LAST_PING);
    }
  }

  function initPing() {
    // Let server know we're still watching (Keep alive Heroku)
    setInterval(function () {

      var timeSinceLastPing = new Date() - LAST_PING;
      if (timeSinceLastPing > (PING_INTERVAL * 1.1)) {
        console.log('Last successful ping too long ago', timeSinceLastPing);
        onConnectionLost();
        window.location = window.location;
      }

      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("GET", location.origin + '/alive', false);
      xmlHttp.send(null);

      ws.send('ping');

    }, PING_INTERVAL);
  }

  var pipeline = getPipeline();
  if(pipeline !== undefined) {

    var wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    var wsHost = wsProtocol + '//' + window.location.host;
    var ws = new WebSocket(wsHost + '/' + identifier + '?pipeline=' + pipeline + '&columns=' + getNumColumns());
    ws.onmessage = function (event) {
      processMessage(event);
    };
  }

  initPing();

};
