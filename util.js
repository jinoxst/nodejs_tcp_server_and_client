var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

function sha1(data){
	var sha1sum = crypto.createHash('sha1');
	sha1sum.update(data);
	return sha1sum.digest('hex');
}

function getGlobalIp(ip){
	if(ip && typeof ip.replace === "function"){
		return ip.replace('::ffff:', '');
	}else{
		return '';
	}
}

exports.sha1 = sha1;
exports.getGlobalIp = getGlobalIp;