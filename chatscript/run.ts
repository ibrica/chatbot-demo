"use strict";
/**
 * chatscript server in different process
 * socket.io connection to chatscript server
 * Events - emit send_msg with msg
 */

import * as net from 'net';
import * as config from 'config';
import {spawn} from 'child_process';
import * as os from 'os';

const
    cs:any = config.get('chatscript'),
    chatscriptConfig = { port: cs.port, host: cs.host, allowHalfOpen: true },
    chatscriptBot = cs.bot;

let chatscript:any;

/**
 * Start chatscript on running OS
 */
switch(os.platform()){
    case "linux":
        chatscript = spawn('./chatscript/runLinux'); //path is from process home folder
        break;
    case "darwin": //MacOS
        chatscript = spawn('./chatscript/runMacOS');
        break;
    case "win32": //Windows any version
        chatscript = spawn('chatscript/ChatScript/BINARIES/chatscript.exe'); //spawn('cmd', ['/c', 'chatscript\\runWindows.cmd']);
        break;
    default:
        console.error("Can't start Chatscript, unknown OS!");
        process.exit(1);
}
    

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
export function reply(client:String, msg:String, cb:Function) {
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
