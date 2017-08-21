"use strict";
/**
 * Bot initialization
 */
import Messenger from '../messenger';
import * as chatscript from '../chatscript/run';


const
        config = require('config'),
        debug = require('debug')('chatbot-demo:server'),
        BASE_URL = config.url,
        messenger = Messenger.getInstance();

//We could make it more OOP with extended class instead of module but OK for now

if (config.facebook.active){
    // Messenger emmited message recived event
    messenger.on('message', (senderID:string, message:any)=>{
        chatscript.reply(senderID, message.text, (err, reply)=>{
            if (err) return console.error(err);            
            //Send via send API
            messenger.sendTextMessage(senderID, reply);
        });

    });


    // Postbacks from clicks
    messenger.on('postback', (senderID:string, recipientID:string, payload:object)=>{
        //User defined
    });
}

if (config.telegram.active){
    //Needed for telegram webhooks
    //create telegram proxy
    const telegram = require('../telegram'),
        sendToTelegram = telegram.sendToTelegram,
        receiveTelegram = telegram.receiveTelegram;

    //Chatscript replies to recieved message
    receiveTelegram((chatId, text) => {
        chatscript.reply(chatId, text, (err, reply)=>{
            if (err) return console.error(err);            
            sendToTelegram(chatId, reply);
        });
    });  

}

//Slack Bot
if (config.slack.active) {
    //Import can't be in statement so using require
    const slack = require('../slack'),
          sendToSlack = slack.sendToSlack,
          receiveSlack = slack.receiveSlack;

    //Chatscript replies to recieved message
    receiveSlack((user, text, channel) => {
        chatscript.reply(user, text, (err, reply)=>{
            if (err) return console.error(err);            
            sendToSlack(reply, channel);
        });
    });        




}

/**
 * Reply to web message
 * @param client 
 * @param message 
 * @param cb 
 */
export function reply(client:String, message:String, cb:Function){
        chatscript.reply(client, message, (err, reply)=>{
                cb(err, reply);
        });
}

