'use strict'

var net = require("net");
var client = new net.Socket();

client.connect(112233, 'server_ip', function(){
    console.log("Connected");
});

process.stdin.resume();
process.stdin.on("data",function(data){
	var d = data.toString();
    broadcast(d);
})

client.on("data", function(data){
	console.log("message from Server:" + data);
})

client.on('tiimeout', function(){
	console.log('timeout -> end');
	client.end();
	process.exit(1);
});

client.on('error', function(){
	console.log('error occurred...');
	client.end();
	process.exit(1);
});

client.on('close', function(){
	console.log('close occurred...');
	process.exit(1);
});

client.on('end', function(){
	console.log('end occurred...');
	process.exit(1);
});

function broadcast(msg){
	console.log("sending from Client:" + JSON.stringify(msg));
    client.write(JSON.stringify(msg));
}