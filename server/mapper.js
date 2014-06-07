var _ = require('lodash');
var moment = require('moment');

var myMail = 'bboeckel@thoughtworks.com';
var contextIoData = {
	messages: [
		{
			read: false,
			from: 'acolleague@thoughtworks.com',
			date: moment(1402057473).format('YYYY-MM-DD')
		},
		{
			read: false,
			from: 'susanne@justsoftwareag.com',
			date: moment(1402057473).format('YYYY-MM-DD')
		}
	]
};

// alle 10 Sekunden context.io fragen
// query mit date_after = das letzte Mal als ich gefragt habe


exports.mapEmailData = function() {

	function isFromThoughtworks(message) {
		return message.from.indexOf('thoughtworks.com') > -1;
	}

	var countInternal = _.countBy(contextIoData.messages, isFromThoughtworks);
	var internalMessagesCounter = countInternal.true;
	var externalMessagesCounter = countInternal.false;

	var internalMessagesRect = { color: "blue" };
	if(internalMessagesCounter < 5) {
		internalMessagesRect.size = "small";
	} else if(internalMessagesCounter < 15) {
		internalMessagesRect.size = "medium";
	} else {
		internalMessagesRect.size = "large";
	}

	var externalMessagesRect = { color: "red" };
	if(externalMessagesCounter < 5) {
		externalMessagesRect.size = "small";
	} else if(internalMessagesCounter < 15) {
		externalMessagesRect.size = "medium";
	} else {
		externalMessagesRect.size = "large";
	}

	return [ internalMessagesRect, externalMessagesRect ];

};