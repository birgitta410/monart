
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

    if (row === 0) {
      var rowDiv = $('#row1');
      var boxWrapperTemplate = '<div class="box-wrapper ' + randomColdColor() + '">' +
        '<div class="info"><div class="level-1">' +
        'ALL GOOD' + '</br>' +
        '</div></div>' +
        '</div>';
      $(boxWrapperTemplate).appendTo(rowDiv);
    }

  }

  function getEnvironments() {
    var match = window.location.search.match(/environments=([^&]+)/);
    if(match) {
      return match[1].split(",");
    } else {
      return [];
    }
  }

  function buildEnvironmentsBoxes() {
    var environments = getEnvironments();

    var container = $('.container');
    var rowDiv = $('#row-environments');
    if(_.isEmpty(environments)) {
      rowDiv.remove();
    }

    var cell = 0;
    _.each(environments, function(envIdentifier) {


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

