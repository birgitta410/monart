var yaml_config = require('node-yaml-config');
var ContextIO = require('contextio');

var config = yaml_config.load(__dirname + '/contextio.yml');

var ctxioClient = new ContextIO.Client({
	key: config.contextIo.key,
	secret: config.contextIo.secret
});

exports.readEmail = function() {

	ctxioClient.accounts().get({limit:15}, function (err, response) {
	    if (err) throw err;
	    console.log(response.body);
	});

}