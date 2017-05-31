'use strict'

var util = require('./util');
var config = require('./config').config;
var constants = require('./constants').constants;
var net = require("net");
var logger = require('./logger').getLogger();
var sockets = [];
var RTN_JSON_RESULT = {};

var server = net.createServer(function(socket){
    RTN_JSON_RESULT = {};//初期化
    
    socket.on("data", function(data){
        var str = JSON.parse(data);
        logger.info(JSON.stringify(str));
        var obj = null;
        if (str instanceof Object){
            obj = str;
        }
        try {
            if(!obj){
                obj = JSON.parse(str);
            }
            logger.info(JSON.stringify(obj));

            if(obj.role && obj.command && obj.shop_code && obj.macaddress){
                if(obj.role == constants.ROLE_1 && obj.command == constants.ACCESS && sockets.indexOf(socket) != -1){
                    sendMessage(socket, {status:'00', message:'Already Accessed OK'});
                }else if(obj.role == constants.ROLE_1 && obj.command == constants.ACCESS && sockets.indexOf(socket) == -1){
                    sockets.push(socket);
                    socket.VR.obj = obj;
                    sendMessage(socket);
                }else if(obj.role == constants.ROLE_2 && obj.command == constants.ACCESS){
                    sendMessage(socket);
                }else if(obj.role == constants.ROLE_2 && obj.command == constants.START_MOVIE){
                    RTN_JSON_RESULT.command = constants.START_MOVIE;
                    sendMessage(socket);
                    broadcast(obj.shop_code);
                }else if(obj.role == constants.ROLE_2 && obj.command == constants.MONITOR){
                    sendAllSockets(socket);
                }else{
                    sendMessage(socket, {status:'31', message:'Authentication error'});
                }
            }else{
                logger.error("Parameter missing error");
                sendMessage(socket, {status:'21', message:'Parameter missing error'});
            }
        }catch(e){
            logger.error("JSON.parse error:" + e);
            sendMessage(socket, {status:'20', message:'JSON parsing error'});
        }
        logger.info('clients total count:' + sockets.length);
    });

    socket.on("close",function(){
        logger.info(JSON.stringify(socket.VR) + " has disconnected");
        var idx = sockets.indexOf(socket);
        logger.info('disconnected idx:' + idx);
        if(idx != -1){
            sockets.splice(idx, 1);
        }
        logger.info('sockets.length:' + sockets.length);
    })

    socket.on('error', function(error) {
        logger.error('Client Socket Error[' + socket.VR.ip + ']: ', error.message);
    });
}).listen(config.tcp.port, function(){
    logger.info('Server is listening OK');
});
server.on('connection', function(socket){
    socket.VR = {};
    socket.VR.ip = util.getGlobalIp(socket.address().address);
    logger.info('New Client came in! - ' + socket.VR.ip);
});

function sendMessage(socket, values){
    if(typeof values !== 'undefined'){
        RTN_JSON_RESULT.status = values.status;
        RTN_JSON_RESULT.message = values.message;
    }else{
        RTN_JSON_RESULT.status = '00';
        RTN_JSON_RESULT.message = 'OK';
    }
    logger.info("Sending to Client[" + socket.VR.ip + "]" + JSON.stringify(RTN_JSON_RESULT));
    socket.write(JSON.stringify(RTN_JSON_RESULT));
}

function broadcast(shopCode){
    var msg = JSON.stringify(RTN_JSON_RESULT);
    sockets.forEach(function(socket){
        if(socket.VR.obj.shop_code == shopCode){
            socket.write(msg);
        }
    })
}

function sendAllSockets(socket){
    var vrs = [];
    sockets.forEach(function(socket){
        vrs.push(socket.VR);
    })

    socket.write(JSON.stringify(vrs));
}