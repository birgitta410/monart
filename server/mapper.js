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

	var messagesToday = _.filter(messages, function(message) {
		return moment().diff(moment(message.date, 'X'), 'days') === 0;
	});
	var messagesYesterday = _.filter(messages, function(message) {
		return moment().diff(moment(message.date, 'X'), 'days') === 1;
	});
	var messagesOld = _.filter(messages, function(message) {
		return moment().diff(moment(message.date, 'X'), 'days') > 1;
	});

	function isFromThoughtworks(message) {
		return message.addresses.from.email.indexOf('thoughtworks') > -1;
	}

	console.log('Got emails from', _.map(messages, function(message) {
		return message.addresses.from.email + ', ' + message.date;
	}));

	var countInternalToday = _.countBy(messagesToday, isFromThoughtworks);
	var countInternalYesterday = _.countBy(messagesYesterday, isFromThoughtworks);
	var countInternalOld = _.countBy(messagesOld, isFromThoughtworks);

	callback(_.compact([ 
		createNumberOfMessagesRect(countInternalToday.true || 0, "blue", 2), 
		createNumberOfMessagesRect(countInternalToday.false || 0, "red", 2),
		createNumberOfMessagesRect(countInternalYesterday.true || 0, "blue", 1), 
		createNumberOfMessagesRect(countInternalYesterday.false || 0, "red", 1),
		createNumberOfMessagesRect(countInternalOld.true || 0, "blue", 0), 
		createNumberOfMessagesRect(countInternalOld.false || 0, "red", 0) ]));

};

function createNumberOfMessagesRect(count, color, column) {
	// if (count === 0) {
	// 	return undefined;
	// }
	var rect = { color: color, column: column };
	if(count < 5) {
		rect.size = "small";
	} else if(count < 15) {
		rect.size = "medium";
	} else {
		rect.size = "large";
	}

	return rect;
}
