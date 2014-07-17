
var host = location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(host + '/haring');

ws.onmessage = function (event) {
  console.log(JSON.parse(event.data));
};
