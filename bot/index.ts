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
    messenger.on('message', (senderID:string, message:object)=>{
        //User defined
    });


    // Postbacks from clicks
    messenger.on('postback', (senderID:string, recipientID:string, payload:object)=>{
        //User defined
    });
}

if (config.telegram.active){
    //Needed for telegram webhooks
    //create telegram proxy
    let telegram = require('../telegram').get();

    telegram.on('text', function(message) {

        //Reply to the same chat
        const chatId = message.chat.id;

        chatscript.reply(chatId, message.text, (err, reply)=>{
            if (err) return console.error(err);
            //Send message to chat
            telegram
                .sendMessage(chatId, reply)
                .catch  ( err => console.error(err)); //promise
        });
    });

}

//Slack Bot
if (config.slack.active) {
    //Import can't be in statement so using require
    const slack = require('../slack'),
          SLACK_EVENTS = slack.SLACK_EVENTS,
          rtm = slack.rtm,
          sendToSlack = slack.sendToSlack;


    rtm.on(SLACK_EVENTS.MESSAGE, message => {
        // Listens to all `message` events from the team
        //Don't respond to own message or channel joins
        if (message.user === rtm.activeUserId || message.subtype === "channel_join") return;

        chatscript.reply(message.user, message.text, (err, reply)=>{
            if (err) return console.error(err);            
            sendToSlack('this is a test message', message.channel);
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

