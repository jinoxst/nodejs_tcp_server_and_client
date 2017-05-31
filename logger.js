var log4js = require('log4js');


function getLogger(){
	log4js.configure('log4js.json', {});
	var logger = log4js.getLogger();
	logger.setLevel('INFO');

	return logger;
}

exports.getLogger = getLogger;