'use strict'

var net = require("net");
var client = new net.Socket();

client.connect(112233, 'server_ip', function(){
    client.write('{"role":"2","command":"MONITOR","shop_code":"shop_code","macaddress":"foobar_macaddress"}');
});

client.on("data", function(data){
	console.log("message from Server:" + data);

	client.end();
})