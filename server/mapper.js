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

	var internalMessages = countInternal.true || 0;
	var externalMessages = countInternal.false || 0;
	
	var internalMessagesRect = { color: "blue" };
	if(internalMessages < 5) {
		internalMessagesRect.size = "small";
	} else if(internalMessages < 15) {
		internalMessagesRect.size = "medium";
	} else {
		internalMessagesRect.size = "large";
	}

	var externalMessagesRect = { color: "red" };
	if(externalMessages < 5) {
		externalMessagesRect.size = "small";
	} else if(externalMessages < 15) {
		externalMessagesRect.size = "medium";
	} else {
		externalMessagesRect.size = "large";
	}

	callback([ internalMessagesRect, externalMessagesRect ]);

};
