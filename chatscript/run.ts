"use strict";
/**
 * chatscript server in different process
 * socket.io connection to chatscript server
 * Events - emit send_msg with msg
 */

const net = require('net'),
    config = require('config'),
    cs = config.get('chatscript'),
    chatscriptConfig = { port: cs.port, host: cs.host, allowHalfOpen: true },
    chatscriptBot = cs.bot,
    spawn = require('child_process').spawn,
    chatscript = spawn('./chatscript/runScript'); //path is from process home folder

//Start chatscript
chatscript.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

chatscript.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
});

chatscript.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
});



//TODO: Keep socket open, don't open it on every send (NOT possible now)
/**
 * Reply from chatscript server
 * @param {object} client 
 * @param {string} msg 
 * @param {function} cb 
 */
export function reply(client, msg, cb) {
    var chatscriptSocket = net.createConnection(chatscriptConfig, () => {
        var payload = client + '\x00' + chatscriptBot + '\x00' + msg + '\x00';
        chatscriptSocket.write(payload);
        // console.log('send_msg')
    });

    // on receive data from chatscriptSocket
    chatscriptSocket.on('data', data => {
        console.log(data.toString());
        cb(null, data.toString()); // FROM SERVER
    });
    // on end from chatscriptSocket
    chatscriptSocket.on('end', () => {
        console.log('disconnected from server');
    });
    // on error from chatscriptSocket
    chatscriptSocket.on('error', err => {
        cb(err);
        console.error('error from server ' + err + ' ' + chatscriptSocket.address()[1]);
    });

};