
var HaringVisualisation = function() {
  var NUM_ROWS = 4;
  var COLS_PER_ROW = 6;

  var ROW_HEIGHT_PERCENT = 100 / NUM_ROWS;
  var COL_WIDTH_PERCENT = 100 / COLS_PER_ROW;

  var DATA = {figures: []};

  var WARM_COLORS = ['red', 'yellow', 'pink', 'orange'];
  var COLD_COLORS = ['blue', 'dark-blue', 'green', 'dark-green'];

  var FIGURE_BACKGROUND_MODE;

  function isWinter() {
    var now = new Date();
    return now.getMonth() >= 11 || now.getMonth() === 0;
  }

  function configureModes() {

    if (isWinter()) {
      FIGURE_BACKGROUND_MODE = 'winter';
    }

  }

  function randomWarmColor() {
    return WARM_COLORS[Math.floor(Math.random() * WARM_COLORS.length)];
  }

  function randomColdColor() {
    return COLD_COLORS[Math.floor(Math.random() * COLD_COLORS.length)];
  }

  function isWarm(color) {
    return _.contains(WARM_COLORS, color);
  }

  function isCold(color) {
    return _.contains(COLD_COLORS, color);
  }

  function buildHtmlGrid() {
    var container = $('.container');
    var figureContentTemplate = '<div class="bg"></div>' +
      '<div class="image"><img src="images/default.png" class="grey"></div>' +
      '<div class="letters top-left"></div>' +
      '<div class="letters bottom-right"></div>';
    var figureWrapperTemplate = '<div class="figure-wrapper">' +
      '<div class="info"><span class="level-1"></span><span class="level-2"></span></div>' +
      '<div class="figure solid">' +
        figureContentTemplate +
      '</div>' +
      '</div>';
    for (var r = 0; r < NUM_ROWS; r++) {
      var rowDiv = $('<div class="figure-row flexbox"></div>').appendTo(container);
      for (var c = 0; c < COLS_PER_ROW; c++) {
        rowDiv.append(figureWrapperTemplate);
      }
    }
    container.append(figureWrapperTemplate
      .replace('figure-wrapper', 'figure-wrapper four-vertical')
      .replace('default.png', 'four_vertical.png'));
    container.append(figureWrapperTemplate
      .replace('figure-wrapper', 'figure-wrapper four-horizontal')
      .replace('default.png', 'four_horizontal.png'));
    container.append('<div class="figure announcement-figure">' + figureContentTemplate + '</div>');
  }

  function iterateFigures(haringDescription, callback) {
    var rowIndex = -1;
    for (var i = 0; i < haringDescription.figures.length; i++) {
      var entry = haringDescription.figures[i];

      var colIndex = i % COLS_PER_ROW;
      if (i % COLS_PER_ROW === 0) rowIndex++;

      callback(i, entry, colIndex, rowIndex);

    }
  }

  function configureFigureDiv(entry, figureDiv) {
    figureDiv.removeClass();
    figureDiv.addClass('figure');

    var infoDiv = $(figureDiv.siblings('.info'));
    var imgTag = $(figureDiv.find('.image > img'));

    if (entry.border === 'dotted') {
      figureDiv.addClass('dotted');
    } else {
      figureDiv.addClass('solid');
    }

    infoDiv.find('.level-1').text(entry.info);
    infoDiv.find('.level-2').text(entry.info2);

    var imgExtension = entry.type === 'building' ? '.gif' : '.png';
    if(!entry.four) {
      imgTag.attr('src', 'images/' + entry.type + imgExtension);
    }

    // Little hack for announcementFigure in winter mode
    if (entry.type.indexOf('winter') > -1) {
      imgTag.attr('src', 'modes/' + entry.type + imgExtension);
    }

    imgTag.removeClass();

    infoDiv.removeClass();
    infoDiv.addClass('info');

    if (entry.color === 'WARM') {
      imgTag.addClass(randomWarmColor());
      infoDiv.addClass('orange');
    } else if (entry.color === 'COLD') {
      imgTag.addClass(randomColdColor());
      infoDiv.addClass('green');
    } else {
      imgTag.addClass(entry.color);
      infoDiv.addClass(isWarm(entry.color) ? 'orange' : 'green');
    }

    if (entry.type === 'building') {
      imgTag.addClass('building');
      figureDiv.append('<div class="changer"></div>')
    }

    var topLeftLettersDiv = $(figureDiv.find('.letters.top-left'));
    var topLeftText = entry.word1;
    addLetters(topLeftLettersDiv, topLeftText);

    var bottomRightLettersDiv = $(figureDiv.find('.letters.bottom-right'));
    var bottomRightText = entry.initials || entry.word2;
    addLetters(bottomRightLettersDiv, bottomRightText);

    addMode(figureDiv, entry);
  }

  function addMode(figureDiv, entry) {
    if (FIGURE_BACKGROUND_MODE) {
      var bgDiv = figureDiv.find('.bg');
      bgDiv.removeClass();
      bgDiv.addClass(FIGURE_BACKGROUND_MODE);
      bgDiv.addClass(entry.type);
      bgDiv.addClass('bg');
    }
  }

  function addLetters(lettersDiv, text) {
    lettersDiv.empty();
    if (text) {
      for (var l = 0; l < text.length; l++) {
        $('<img src="images/alphabet/' + text[l].toLowerCase() + '.svg">').appendTo(lettersDiv);
      }
    }
  }

  function processFigure(index, entry, colIndex, rowIndex) {
    var previously = DATA.figures[index];

    if (_.isEqual(entry, previously)) {
      return;
    }

    var allRows = $('.figure-row');
    if (allRows.length > rowIndex) {
      var rowDiv = $(allRows[rowIndex]);

      var figureWrapperDiv = $(rowDiv.find('.figure-wrapper')[colIndex]);
      var figureDiv = $(figureWrapperDiv.find('.figure'));

      if(entry.four) {
        var figureWrapperFourDiv = $('.figure-wrapper.four-' + entry.four.direction);
        figureWrapperFourDiv.removeClass('do-not-display');
        figureWrapperDiv.addClass('invisible-' + entry.four.direction);
        if(entry.four.starter === true) {
          var offsetLeft = 2 - (colIndex * 0.5);
          var offsetTop = entry.four.direction === 'vertical' ? 2 : 0;
          figureWrapperFourDiv.css('left', (offsetLeft + (colIndex * COL_WIDTH_PERCENT)) + '%');
          figureWrapperFourDiv.css('top', (offsetTop + (rowIndex * ROW_HEIGHT_PERCENT)) + '%');

          configureFigureDiv(entry, $(figureWrapperFourDiv.find('.figure')));
        }

      }

      configureFigureDiv(entry, figureDiv);

    } else {
      console.log('not enough rows');
    }

  }

  function setBackgroundStyle(styleClass) {
    if (!toggler.isDisplayingInfo()) {
      var bodyTag = $('body');
      bodyTag.removeClass();
      bodyTag.addClass(styleClass);
    }
  }

  function hideFoursIfNotNeeded(figures) {
    _.each(['vertical', 'horizontal'], function(direction) {
      var hasFour = _.find(figures, { four: { direction: direction } });
      if(hasFour === undefined) {
        var figureWrapperFourDiv = $('.figure-wrapper.four-' + direction);
        figureWrapperFourDiv.addClass('do-not-display');
        $('.invisible-' + direction).removeClass('invisible-' + direction);
      }
    });
  }

  function processNewData(haringDescription) {

    setBackgroundStyle(haringDescription.background);

    iterateFigures(haringDescription, processFigure);

    hideFoursIfNotNeeded(haringDescription.figures);

    var announcementDiv = $('.announcement-figure');
    if (haringDescription.announcementFigure !== undefined) {

      configureFigureDiv(haringDescription.announcementFigure, announcementDiv);
      announcementDiv.show();
    } else {
      announcementDiv.hide();
    }

    DATA = haringDescription;
  }

  configureModes();
  buildHtmlGrid();

  return {
    processNewData: processNewData,
    setBackgroundStyle: setBackgroundStyle
  };

}

var InfoToggler = function (body) {

  var STATE_DEFAULT = 0,
    STATE_INFO_1 = 1,
    STATE_INFO_2 = 2;

  var currentInfoState = STATE_DEFAULT;

  return {
    toggle: function () {
      currentInfoState++;
      if (currentInfoState % 3 === STATE_DEFAULT) {
        body.removeClass('info-state');
      } else if (currentInfoState % 3 === STATE_INFO_1) {
        body.addClass('info-state');
        body.find('.level-1').show();
        body.find('.level-2').hide();
      } else if (currentInfoState % 3 === STATE_INFO_2) {
        body.find('.level-1').hide();
        body.find('.level-2').show();
      }
    },
    isDisplayingInfo: function () {
      return currentInfoState % 3 !== STATE_DEFAULT;
    }
  };

};

var haringVisualisation = new HaringVisualisation();

var LAST_PING = new Date();
var PING_INTERVAL = 5 * 60 * 1000;

var wsHost = 'ws://' + window.location.host;
var ws = new WebSocket(wsHost + '/haring');

ws.onmessage = function (event) {

  var data = JSON.parse(event.data);
  var statusMessage = $('#status-message');
  var statusProgress = $('#status-progress');
  if (data.haring) {
    statusMessage.hide();
    statusProgress.text('.');

    haringVisualisation.processNewData(data.haring);

  } else if (data.loading === true) {
    statusMessage.show();
    var progress = statusProgress.text() + '.';
    statusProgress.text(progress);
  } else if (data.ping) {
    LAST_PING = new Date();
    console.log('ping success - still connected to server', LAST_PING);
  }

};

// Let server know we're still watching (Keep alive Heroku)
setInterval(function () {

  var timeSinceLastPing = new Date() - LAST_PING;
  if (timeSinceLastPing > (PING_INTERVAL * 1.1)) {
    console.log('Last successful ping too long ago', timeSinceLastPing);
    haringVisualisation.setBackgroundStyle('grey');
    window.location = window.location;
  }

  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", location.origin + '/alive', false);
  xmlHttp.send(null);

  ws.send('ping');

}, PING_INTERVAL);

var body = $('body');
var toggler = InfoToggler(body);

body.on('click', function () {
  toggler.toggle();
});
