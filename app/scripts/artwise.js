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


function Mondrian(P) {
  console.log('drawing Mondrian')

  var OperaVersion = 19; // global, used to avoid a bug in older versions of
            // Opera that let you into fullscreen, but won't let you out
var el = document.getElementById("canvas1");
var inst = document.getElementById('instructions');
 
P.setup = function() {
  // Let Opera 19 go fullscreen, earlier versions go full window
  var browser = navigator.userAgent.toLowerCase();
  if (browser.indexOf("opera") > -1) {
    var position = navigator.userAgent.search("Version") + 8;
    var version = navigator.userAgent.substring(position);
    OperaVersion = parseInt(version);
  }
  if ((document.fullscreenEnabled ||  
       document.webkitFullscreenEnabled || 
       document.msFullscreenEnabled ||
       document.mozFullScreenEnabled) && (OperaVersion > 18)) {
    setPreFullscreen();
  } else {
    setFullWindow();
  }
  P.background(255);
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
  
  // TODO: Change rectangle-constructors to relative parameters
  
  var absoluteWidth = P.width;
  console.log(absoluteWidth);

  // vars for heigth / width of rectangle
  
  
  var todayInternalWidth = 100;
  var todayInternalHeigth = 100;
  var todayExternalWidth = 100;
  var todayExternalHeigth = 100;
  
  var yesterdayInternalWidth = 100;
  var yesterdayInternalHeigth = 100;
  var yesterdayExternalWidth = 100;
  var yesterdayExternalHeigth = 100;

  // rectangles
    // rectangle for internal email today
    P.fill(50,205,50);  // color is green
    P.rect(160,0,todayInternalWidth,todayInternalHeigth); // position should be in rightmost column
    // rectangle for external email today
    P.fill(178,34,34);  // color is red 
    P.rect(160,140,todayExternalWidth,todayExternalHeigth); // position should be in rightmost column
    // rectangle for internal email yesterday
    P.fill(50,205,50); // color is green
    P.rect(100,120,100,80);// position should be in middle column
    // rectangle for external email yesterday
   // P.fill(178,34,34); // color is red
   // P.rect(260,120,100,80);// position should be in middle column
  }

  window.onresize = function() {
  if ((document.fullscreenEnabled || 
       document.webkitFullscreenEnabled || 
       document.msFullscreenEnabled ||
       document.mozFullScreenEnabled) && (inst.style.display == 'block')) {
    setPreFullscreen();
  } else {
    setFullWindow();
  }
  stroke(255); waitress=millis();
}
 
function setPreFullscreen() {
  el.style.position = "fixed";
  var divHeight = inst.offsetHeight;
  inst.style.display = 'block';
  var viewportWidth = window.innerWidth;
  var viewportHeight = window.innerHeight;
  var canvasWidth = viewportWidth*0.97;
  var canvasHeight = (viewportHeight-divHeight)*0.9;
  el.style.top = ((viewportHeight - divHeight - canvasHeight) / 2) + divHeight +"px";
  el.style.left = (viewportWidth - canvasWidth) / 2 +"px";
  el.setAttribute("width", canvasWidth);
  el.setAttribute("height", canvasHeight);
  P.size(canvasWidth, canvasHeight); // Processing
}
 
function setFullWindow() {
  el.style.position = "fixed";
  inst.style.display = 'none';
  var canvasWidth = document.documentElement.clientWidth;
  var canvasHeight = document.documentElement.clientHeight;
  el.style.top = 0 +"px";
  el.style.left = 0 +"px";
  el.setAttribute("width", canvasWidth);
  el.setAttribute("height", canvasHeight);
  P.size(canvasWidth, canvasHeight); // Processing
}
 
// When user exits fullscreen via the 'Esc' key rather than by clicking
// on the sketch, this lets the canvas return to its initial size rather
// than filling the whole browser window... 
var changeHandler = function(){
  if (!(document.fullscreenElement||
        document.webkitFullscreenElement||
        document.mozFullScreenElement||
        document.msFullscreenElement)){
    inst.style.display = 'block';
    setPreFullscreen();
  }
}
document.addEventListener("fullscreenchange", changeHandler, false);
document.addEventListener("webkitfullscreenchange", changeHandler, false);
document.addEventListener("mozfullscreenchange", changeHandler, false);
document.addEventListener("MSFullscreenChange", changeHandler, false);
 
// must be part of sketch so it has access to global var OperaVersion
el.onclick=function(){toggleFullScreen()};
function toggleFullScreen() {
  if ((document.fullscreenEnabled || 
       document.webkitFullscreenEnabled || 
       document.msFullscreenEnabled ||
       document.mozFullScreenEnabled) && (OperaVersion > 18)) {  
    if (!document.fullscreenElement && 
        !document.mozFullScreenElement && 
        !document.webkitFullscreenElement && 
        !document.msFullscreenElement) { 
      inst.style.display = 'none';
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    } else {
      inst.style.display = 'block';
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }
}
}

function sketchProc(P) {
  Mondrian(P);
}
