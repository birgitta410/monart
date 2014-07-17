var _ = require('lodash');

var pipelineReader = require('../sources/gocd/fakePipelineReader.js');

pipelineReader.init();

exports.readHistory = function(callWhenDone) {
  pipelineReader.readHistory('myPipeline', mapPipelineDataToFigures, callWhenDone);
};

var colors = [
  'green',
  'blue',
  'yellow',
  'pink',
  'dark-blue',
  'orange'
];

function mapPipelineDataToFigures(history, callWhenDone) {

  var figures = _.map(history, function(entry) {
    return {
      color: getColor(entry),
      column: 3,
      info: 'Some text to show in a tooltip',
      type: getFigureType(entry)
    };
  });

  var changesExist = true;
  callWhenDone(figures, changesExist);
}

function getFigureType(historyEntry) {
  if(historyEntry.result === 'success') {
    return 'walking';
  } else if(historyEntry.result === 'failed') {
    return 'crawling';
  }
}

function getColor(historyEntry) {
  return colors[Math.floor(Math.random()*colors.length)];
}