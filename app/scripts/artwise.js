
// TODO: Find a way of passing parameters
// global var managed by server
// TODO: make canvas full-screen


function sketchProc(P) {
console.log('executing...')
 P.setup = function() {
    P.size(300,300);
    P.background(255);
    P.smooth();
}

 P.draw = function() {
    P.stroke(artwise.map1,0,0);
    P.strokeWeight(5);
// Lineas Horizontales
    P.line(0,60,300,60)   ;
    P.line(0,120,300,120);
    P.line(0,200,300,200);
    P.line(0,260,300,260);
 
//vertical lines
    P.line(40,0,40,300);
    P.line(100,0,100,300);
    P.line(160,0,160,300);
    P.line(260,0,260,300);
 
//horizontal lines
    P.fill(230,120,20);
    P.rect(40,60,60,60);
    P.fill(20,89,45);
    P.rect(100,120,60,80);
    P.fill(45,45,140);
    P.rect(260,120,100,80); 
}

}
/*
var canvas = document.getElementById("canvas1");
// attaching the sketchProc function to the canvas
var processingInstance = new Processing(canvas, sketchProc);
*/
