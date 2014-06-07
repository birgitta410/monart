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
  
    var absoluteWidth = P.width;
    var absoluteHeight = P.height;
  
   for (i=0;i<artwise.data.length;i++) {
     var column = artwise.data[i];
     var set = {};
     set.width = 1/3*absoluteWidth;
     set.x = column.column/3*absoluteWidth;
     if (column.color == 'red') {
       set.y = 0.5*absoluteHeight;
       P.fill(255,0,0);
     }
     else {
       set.y = 0;
       P.fill(9,34,117);
     }
      
   
     switch (column.size) {
       case  'large':
         set.height = 0.4*absoluteHeight;    
         break;
       case 'medium':
         set.height = 0.2*absoluteHeight;    
         break;
       case 'small':
         set.height = 0.1*absoluteHeight;    
         break;
    }

    P.rect(set.x,set.y,set.width,set.height);
  }
   
    P.stroke(0,0,0);
    P.strokeWeight(5);
  // horizontal lines
    P.line(0.1*absoluteWidth,0.2*absoluteHeight,0.9*absoluteWidth,0.2*absoluteHeight);
    P.line(0.1*absoluteWidth,0.4*absoluteHeight,0.9*absoluteWidth,0.4*absoluteHeight);
    P.line(0.1*absoluteWidth,0.6*absoluteHeight,0.9*absoluteWidth,0.6*absoluteHeight);
    P.line(0.1*absoluteWidth,0.8*absoluteHeight,0.9*absoluteWidth,0.8*absoluteHeight);
 
  //vertical lines
    P.line(0.2*absoluteWidth,0,0.2*absoluteWidth,absoluteHeight);
    P.line(0.3*absoluteWidth,0,0.3*absoluteWidth,absoluteHeight);
    P.line(0.6 * absoluteWidth,0,0.6 * absoluteWidth,absoluteHeight);
    P.line(0.9*absoluteWidth,0,0.9*absoluteWidth,absoluteHeight);
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
  P.stroke(255); waitress=P.millis();
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
