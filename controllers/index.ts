"use strict";
/**
 * Application controllers
 */
import { NextFunction, Request, Response } from "express";
import Messenger from '../messenger';
import * as bot from '../bot'

const facebook = require('config').get('facebook'), //JSON types in controllers
    VALIDATION_TOKEN = facebook.validationToken,
    messenger = Messenger.getInstance();
  
export default class IndexController {

    /**
     * Index page
     * @param req 
     * @param res 
     */
    static index(req:Request, res:Response){
      res.render('index', { title: 'chatbot-demo' });
    }

    /**
     * subscribe to FB postbacks
     * @param req 
     * @param res 
     */
    static subscribe(req:Request, res:Response){
        if (req.query['hub.mode'] === 'subscribe' &&
            req.query['hub.verify_token'] === VALIDATION_TOKEN) {
            console.log("Validating webhook");
            res.status(200).send(req.query['hub.challenge']);
        } else {
            console.error("Failed validation. Make sure the validation tokens match.");
            res.sendStatus(403);
        }
    };

    /**
     * FacebookReceive
     * @param req
     * @param res 
     */
    static receive(req:Request, res:Response) {
        var data = req.body;
        console.log(JSON.stringify(data));
        /*
         * All callbacks for Messenger are POST-ed. They will be sent to the same
         * webhook. Be sure to subscribe your app to your page to receive callbacks
         * for your page.
         * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
         *
         */
        // Make sure this is a page subscription
        if (data.object == 'page') {
            // Iterate over each entry
            // There may be multiple if batched
            data.entry.forEach((pageEntry)=>{
                let pageID = pageEntry.id;
                let timeOfEvent = pageEntry.time;

                // Iterate over each messaging event
                pageEntry.messaging.forEach(function(messagingEvent) {
                    if (messagingEvent.optin) {
                        messenger.receivedAuthentication(messagingEvent);
                    } else if (messagingEvent.message) {
                        messenger.receivedMessage(messagingEvent);
                    } else if (messagingEvent.delivery) {
                        messenger.receivedDeliveryConfirmation(messagingEvent);
                    } else if (messagingEvent.postback) {
                        messenger.receivedPostback(messagingEvent);
                    } else if (messagingEvent.read) {
                        messenger.receivedMessageRead(messagingEvent);
                    } else if (messagingEvent.account_linking) {
                        messenger.receivedAccountLink(messagingEvent);
                    } else {
                        console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                    }
                });
            });

            // Assume all went well.
            //
            // You must send back a 200, within 20 seconds, to let us know you've
            // successfully received the callback. Otherwise, the request will time out.
            res.sendStatus(200);
        }else {
            res.sendStatus(400); //Not a fb page, what is it
        }
    };

    /**
     * Post from web page
     * @param req 
     * @param res 
     */
    static web(req:Request, res:Response){
        let message = req.body.message;
        if(!message) return res.sendStatus(400); //Bad request
        
        bot.reply(req.ip,message, (err, reply)=>{
            if(err) return res.sendStatus(500);
            //Now reply
            res.send(reply);
        });     
    }   
}





