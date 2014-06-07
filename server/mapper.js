var _ = require('lodash');
var moment = require('moment');
var http = require('http');

var emailReader = require('./emailReader.js');

var EMAIL_DOMAIN;
emailReader.getAccountInfo(function(accountInfo) {
	var email = accountInfo.email_addresses[0];
	EMAIL_DOMAIN = email.substring(email.indexOf('@') + 1);
});

exports.readEmail = function(callWhenDone) {
	emailReader.readEmail(mapEmailDataToRectangles, callWhenDone);	
};

function mapEmailDataToRectangles(messages, callback) {

	var unreadMessages = _.filter(messages, function(message) {
		return _.contains(message.flags, '\\Seen');
	});
	console.log('Got UNREAD emails from', _.map(unreadMessages, function(message) {
		return message.addresses.from.email + ', ' + message.date;
	}));
	

	var messagesToday = _.filter(unreadMessages, function(message) {
		return moment().diff(moment(message.date, 'X'), 'days') === 0;
	});
	var messagesYesterday = _.filter(unreadMessages, function(message) {
		return moment().diff(moment(message.date, 'X'), 'days') === 1;
	});
	var messagesOld = _.filter(unreadMessages, function(message) {
		return moment().diff(moment(message.date, 'X'), 'days') > 1;
	});

	function isFromSameDomain(message) {
		return message.addresses.from.email.indexOf(EMAIL_DOMAIN) > -1;
	}

	var countInternalToday = _.countBy(messagesToday, isFromSameDomain);
	var countInternalYesterday = _.countBy(messagesYesterday, isFromSameDomain);
	var countInternalOld = _.countBy(messagesOld, isFromSameDomain);

	var colorInternal = "blue";
	var colorExternal = "red";
	callback(_.compact([ 
		createRectangle(countInternalToday.true || 0, colorInternal, 2), 
		createRectangle(countInternalToday.false || 0, colorExternal, 2),
		createRectangle(countInternalYesterday.true || 0, colorInternal, 1), 
		createRectangle(countInternalYesterday.false || 0, colorExternal, 1),
		createRectangle(countInternalOld.true || 0, colorInternal, 0), 
		createRectangle(countInternalOld.false || 0, colorExternal, 0) ]));

};

function createRectangle(count, color, column) {
	// Still sending 0-values for now, so we have more to show
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
