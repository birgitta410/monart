
// TODO: make canvas full-screen
// TODO: invent mapping from data to canvas

// defintions
// map1 -> color of rectangles
//  either blue(internal) or red(external)
// map2 -> amount of space taken by each color
//  small, normal, large
// random function for number of boxes
// columns = today, yesterday, etc.
// row position not mapped yet


function Mondrian() {
  console.log('drawing Mondrian')

  P.setup = function() {
    P.size(300,300);
    P.background(255); // background is white
    P.smooth();
  }  

  P.draw = function() {
    P.stroke(0,0,0);
    P.strokeWeight(5);
  // horizontal lines
    P.line(0,60,300,60);
    P.line(0,120,300,120);
    P.line(0,200,300,200);
    P.line(0,260,300,260);
 
  //vertical lines
    P.line(40,0,40,300);
    P.line(100,0,100,300);
    P.line(160,0,160,300);
    P.line(260,0,260,300);
 
  // rectangles
    // rectangle for internal email today
    P.fill(50,205,50);  // color is green
    P.rect(40,60,60,60); // position should be in rightmost column
    // rectangle for external email today
    P.fill(178,34,34);  // color is red 
    P.rect(100,120,60,80);
    // rectangle for internal email yesterday
    P.fill(45,45,140);
    P.rect(260,120,100,80); 
    // rectangle for external email yesterday
    P.fill(45,45,140);
    P.rect(260,120,100,80); 
  }

}

function sketchProc(P) {
  Mondrian();
}
 
