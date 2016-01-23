
var BoxesVisualisation = function() {

  function setBackgroundStyle(styleClass) {
    if (!toggler.isDisplayingInfo()) {
      var bodyTag = $('body');
      bodyTag.removeClass();
      bodyTag.addClass(styleClass);
    }
  }

  var WARM_COLORS = ['red', 'yellow', 'pink', 'orange'];
  var COLD_COLORS = ['blue', 'dark-blue', 'purple'];
  function randomWarmColor() {
    return WARM_COLORS[Math.floor(Math.random() * WARM_COLORS.length)];
  }
  function randomColdColor() {
    return COLD_COLORS[Math.floor(Math.random() * COLD_COLORS.length)];
  }

  function processNewData(data) {
    //setBackgroundStyle(haringDescription.background);
    console.log("data", data);

    var container = $('.container');

    container.empty();
    var cell = 0;
    var maxColumns = 3;
    var row = 0;
    _.each(data, function(pipelineState) {

      _.each(pipelineState.activity, function(activity) {

        if(cell % maxColumns === 0) {
          row++;
          $('<div class="box-row flexbox" id="row' + row + '"></div>').appendTo(container);
        }
        var rowDiv = $('#row' + row);
        var boxWrapperTemplate = '<div class="box-wrapper ' + randomColdColor() + '">' +
          '<div class="info"><div class="level-1">' +
          pipelineState.pipeline + '</br>' +
          activity.info2 +
        '</div></div>' +
        '</div>';
        $(boxWrapperTemplate).appendTo(rowDiv);
        cell ++;

      });

      _.each(pipelineState.history.boxes, function(history) {

        if(cell % maxColumns === 0) {
          row++;
          $('<div class="box-row flexbox" id="row' + row + '"></div>').appendTo(container);
        }
        var rowDiv = $('#row' + row);
        var boxWrapperTemplate = '<div class="box-wrapper ' + randomWarmColor() + '">' +
          '<div class="info"><div class="level-1">' +
            pipelineState.pipeline + '</br>' +
            history.summary.result + ': ' +
            history.summary.stageNotSuccessful + '</br>' +
            history.summary.author.name
          '</div></div>' +
          '</div>';
        $(boxWrapperTemplate).appendTo(rowDiv);
        cell ++;
      });

    });

  }

  return {
    processNewData: processNewData,
    setBackgroundStyle: setBackgroundStyle
  };

};


/***********************/

var boxes = new BoxesVisualisation();

function onDataErrorHaring(error) {
  $('#error-message').text(error);
  $('#error-message').show();
}

function onConnectionLostHaring() {
  boxes.setBackgroundStyle('grey');
}

new ArtwiseDataSource('boxes', boxes.processNewData, onConnectionLostHaring, onDataErrorHaring);
