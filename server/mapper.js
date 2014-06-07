var _ = require('lodash');
var moment = require('moment');
var http = require('http');

var emailReader = require('./emailReader.js');

var EMAIL_DOMAIN;
emailReader.getAccountInfo(function(accountInfo) {
	var email = accountInfo.email_addresses[0];
	EMAIL_DOMAIN = email.substring(email.indexOf('@') + 1);
	console.log('DOMAIN', EMAIL_DOMAIN);
});

exports.readEmail = function(callWhenDone) {
	emailReader.readEmail(mapEmailDataToRectangles, callWhenDone);	
};

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

	function isFromSameDomain(message) {
		return message.addresses.from.email.indexOf(EMAIL_DOMAIN) > -1;
	}

	console.log('Got emails from', _.map(messages, function(message) {
		return message.addresses.from.email + ', ' + message.date;
	}));

	var countInternalToday = _.countBy(messagesToday, isFromSameDomain);
	var countInternalYesterday = _.countBy(messagesYesterday, isFromSameDomain);
	var countInternalOld = _.countBy(messagesOld, isFromSameDomain);

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
