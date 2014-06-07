console.log('artwise is so cool!');

//global variables that update mondrian

var artwise = {};
artwise.map1 = 0;


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

while (i < 500) {
setTimeout(function() {
  incrementor();
  console.log(artwise.map1);

},50*i);
i++;
}
