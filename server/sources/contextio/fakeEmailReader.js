var _ = require('lodash');
var moment = require('moment');

var old = moment().subtract('days', 3);
var yesterday = moment().subtract('days', 1);
var today = moment();
var fakeEmails;


exports.init = function() {

};

exports.readEmail = function(callback, callbackParameter) {
	fakeEmails = [];
	
	_.times(GLOBAL.TODAY_INTERNAL || 20, createInternalToday);
	_.times(GLOBAL.TODAY_EXTERNAL || 10, createExternalToday);
	_.times(4, createInternalYesterday);
	_.times(21, createExternalYesterday);
	_.times(4, createInternalOld);
	_.times(4, createExternalOld);
	
	callback(fakeEmails, callbackParameter);

};

function createInternalToday() {
	fakeEmails.push( { addresses: { from: { email: 'hello.artwise@gmail.com' }},
		  flags: [],
		   date: today });
}

function createExternalToday() {
	fakeEmails.push( { addresses: { from: { email: 'hello.artwise@web.de' }},
		  flags: [],
		   date: today });
}

function createInternalYesterday() {
	fakeEmails.push( { addresses: { from: { email: 'hello.artwise@gmail.com' }},
		  flags: [],
		   date: yesterday });
}

function createExternalYesterday() {
	fakeEmails.push( { addresses: { from: { email: 'hello.artwise@web.de' }},
		  flags: [],
		   date: yesterday });
}

function createInternalOld() {
	fakeEmails.push( { addresses: { from: { email: 'hello.artwise@gmail.com' }},
		  flags: [],
		   date: old });
}

function createExternalOld() {
	fakeEmails.push( { addresses: { from: { email: 'hello.artwise@web.de' }},
		  flags: [],
		   date: old });
}

exports.getAccountInfo = function(callback, callbackParameter) {
	callback( { email_adresses: [ 'artwise.test@gmail.com'] }, callbackParameter);
};
