"use strict";
/**
 * bot initialization
 */
import Messenger from '../messenger';
import * as chatscript from '../chatscript/start';


const
        config = require('config'),
        debug = require('debug')('chatbot-demo:server'),
        BASE_URL = config.url,
        messenger = Messenger.getInstance();

//We could make it more OOP with extended class instead of module but OK for now

if (config.facebook.active){
    // Messenger emmited message recived event
    messenger.on('message', (senderID:string, message:object)=>{

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

    telegram.on('text', function(msg) {

        const chatId = msg.chat.id;
/*
        chatscript.reply(fromId, text, (err, reply)=>{
            if (err) return console.error(err);

            telegram
                .sendMessage(chatId, reply)
                .catch  ( err => console.error(err)); //promise
        });*/
    });

}

if (config.slack.active) {
    const   SLACK = require('../slack'),
            slack = SLACK.client,
            SLACK_EVENTS = SLACK.events;

    slack.on(SLACK_EVENTS.MESSAGE, message => {
        // Listens to all `message` events from the team
        console.log(message);
        slack.sendMessage('this is a test message', 'C0CHZA86Q', messageSent => {
            // optionally, you can supply a callback to execute once the message has been sent
        });
    });

    slack.on(SLACK_EVENTS.CHANNEL_CREATED,  (message) => {
        // Listens to all `channel_created` events from the team
        debug(message);
    });
}




