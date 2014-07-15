console.log('artwise is so cool!');

var host = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(host);

//global variables that update mondrian

artwise = {};

artwise.data = [];

ws.onmessage = function (event) {
  artwise.data = JSON.parse(event.data);
  console.log(artwise.data);
};



function incrementor() {
  artwise.map1++;
  if (artwise.map1 > 254) {
   artwise.map1 = 0
}
}


var canvas = document.getElementById("canvas1");
// attaching the sketchProc function to the canvas
var processingInstance = new Processing(canvas, sketchProc);

var i = 0;
/*
while (i < 500) {
setTimeout(function() {
  incrementor();
  console.log(artwise.map1);

},50*i);
i++;
}
*/
