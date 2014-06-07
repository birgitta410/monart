var yaml_config = require('node-yaml-config');
var ContextIO = require('contextio');
var _ = require('lodash');

var config;

try {
	config = yaml_config.load(__dirname + '/contextio.yml');
} catch(err) {
	console.log('could not read yml, trying Heroku vars');
	config = {
		default: {
		  contextIo: {
		    key: process.env.CONTEXT_KEY,
		    secret: process.env.CONTEXT_SECRET
		  }
    	}
	};
}

var ctxioClient = new ContextIO.Client({
	key: config.contextIo.key,
	secret: config.contextIo.secret
});

exports.readEmail = function(callback, callbackParameter) {

	ctxioClient.accounts('53932932facadd1674f0da85').messages().get(
		{
			limit:15
		}, function (err, response) {
	    if (err) throw err;
	    // console.log('response', response.body);
	    callback(response.body, callbackParameter);
	});

}