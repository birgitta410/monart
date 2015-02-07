

var ArtwiseVisualisation = function() {

  var LAST_PING = new Date();
  var PING_INTERVAL = 5 * 60 * 1000;

  function processMessage(event, key, processor) {
    var data = JSON.parse(event.data);
    var statusMessage = $('#status-message');
    var statusProgress = $('#status-progress');
    if (data[key]) {
      statusMessage.hide();
      statusProgress.text('.');

      processor(data[key]);

    } else if (data.loading === true) {
      statusMessage.show();
      var progress = statusProgress.text() + '.';
      statusProgress.text(progress);
    } else if (data.ping) {
      LAST_PING = new Date();
      console.log('ping success - still connected to server', LAST_PING);
    }
  }

  function initPing(ws, noConnectionHandler) {
    // Let server know we're still watching (Keep alive Heroku)
    setInterval(function () {

      var timeSinceLastPing = new Date() - LAST_PING;
      if (timeSinceLastPing > (PING_INTERVAL * 1.1)) {
        console.log('Last successful ping too long ago', timeSinceLastPing);
        noConnectionHandler();
        window.location = window.location;
      }

      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("GET", location.origin + '/alive', false);
      xmlHttp.send(null);

      ws.send('ping');

    }, PING_INTERVAL);
  }

  return {
    initPing: initPing,
    processMessage: processMessage
  }

};

var artwise = new ArtwiseVisualisation();