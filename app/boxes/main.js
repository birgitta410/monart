
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
    $('#row1').empty();
    $('#row2').empty();
    var cell = 0;
    var maxColumns = 3;
    var row = 0;
    _.each(data, function(pipelineState) {

      _.each(pipelineState.activity, function(activity) {

        if(cell % maxColumns === 0) {
          row++;
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

  function buildEnvironmentsBoxes() {
    var environments = ["gce-dev", "mcloud-dev", "mcloud-pp", "prod", "mcc2-pp"];

    var container = $('.container');

    var cell = 0;
    _.each(environments, function(envIdentifier) {

      var rowDiv = $('#row-environments');
      var boxWrapperTemplate = '<div class="box-wrapper default-color" id="' +envIdentifier+ '">' +
        '<div class="info"><div class="level-1">' +
        envIdentifier + '</br>' +
      '</div></div>' +
      '</div>';
      $(boxWrapperTemplate).appendTo(rowDiv);
      cell ++;

      var onOk = function() {
        $('#' + envIdentifier).removeClass('red');
        $('#' + envIdentifier).removeClass('default-color');
        $('#' + envIdentifier).addClass('green');
      };
      var onNotOk = function() {
        // NOT OK
        $('#' + envIdentifier).removeClass('default-color');
        $('#' + envIdentifier).removeClass('green');
        $('#' + envIdentifier).addClass('red');
      };

      urlMonitor(envIdentifier, onOk, onNotOk, function() {
        // error
      });

    });

  }

  return {
    processNewData: processNewData,
    buildEnvironmentsBoxes: buildEnvironmentsBoxes,
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

boxes.buildEnvironmentsBoxes();
new ArtwiseDataSource('boxes', boxes.processNewData, onConnectionLostHaring, onDataErrorHaring);

