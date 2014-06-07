var _ = require('lodash');
var moment = require('moment');
var http = require('http');

var emailReader = require('./emailReader.js');

exports.readEmail = function(callWhenDone) {
	emailReader.readEmail(mapEmailDataToRectangles, callWhenDone);	
};


// alle 10 Sekunden context.io fragen
// query mit date_after = das letzte Mal als ich gefragt habe


function mapEmailDataToRectangles(messages, callback) {

	// addresses.from.email
	// addresses.from.name

	function isFromThoughtworks(message) {
		return message.addresses.from.email.indexOf('thoughtworks') > -1;
	}

	console.log('Got emails from', _.map(messages, function(message) {
		return message.addresses.from.email;
	}));

	var countInternal = _.countBy(messages, isFromThoughtworks);

	callback([ 
		createNumberOfMessagesRect(countInternal.true || 0, "blue"), 
		createNumberOfMessagesRect(countInternal.false || 0, "red") ]);

};

function createNumberOfMessagesRect(count, color) {
	
	var rect = { color: color };
	if(count < 5) {
		rect.size = "small";
	} else if(count < 15) {
		rect.size = "medium";
	} else {
		rect.size = "large";
	}

	return rect;
}
