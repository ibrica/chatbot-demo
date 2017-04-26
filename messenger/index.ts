'use strict';
/**
 * Messenger API class
 * @type {EventEmitter}
 */

import {EventEmitter} from 'events'
import * as request from 'request'
const crypto = require('crypto'),
      config = require('config'),
      facebook  = config.get('facebook');


// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) || facebook.appSecret;

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) || facebook.validationToken;

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) || facebook.pageAccessToken;

// URL where the app is running (include protocol). Used to point to scripts and
// assets located at this address.
const SERVER_URL = (process.env.SERVER_URL) || config.url;

// Messenger URL
const FB_URL = (process.env.FB_URL) || config.facebook.serverURL;



if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
    console.error("Missing config values");
    process.exit(1);
}

/**
 * Messenger proxy, singleton
 */
export default class Messenger extends EventEmitter {
     private static _instance: Messenger;
    //Contructor private to prevent instantiating
    private constructor () {
        super();
    }

    /**
     * get singleton instance
     */
    public static getInstance()
    {
        return this._instance || (this._instance = new this());
    }

    /**
     * Verify that the callback came from Facebook. Using the App Secret from
     * the App Dashboard, we can verify the signature that is sent with each
     * callback in the x-hub-signature field, located in the header.
     * https://developers.facebook.com/docs/graph-api/webhooks#setup
     *
     */
    public static verifyRequestSignature(req, res, buf) {
        var signature = req.headers["x-hub-signature"];

        if (!signature) {
            // For testing, let's log an error. In production, you should throw an
            // error.
            console.error("Couldn't validate the signature.");
        } else {
            var elements = signature.split('=');
            var method = elements[0];
            var signatureHash = elements[1];

            var expectedHash = crypto.createHmac('sha1', APP_SECRET)
                .update(buf)
                .digest('hex');

            if (signatureHash != expectedHash) {
                // For testing, let's log an error. In production, you should throw an
                // error.
                console.error("Couldn't validate the signature.");
                //this.emit('error', new Error("Couldn't validate the request signature."));
            }
        }
    }

    /*
     * Authorization Event
     *
     * The value for 'optin.ref' is defined in the entry point. For the "Send to
     * Messenger" plugin, it is the 'data-ref' field. Read more at
     * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
     *
     */
     receivedAuthentication(event) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfAuth = event.timestamp;

        // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
        // The developer can set this to an arbitrary value to associate the
        // authentication callback with the 'Send to Messenger' click event. This is
        // a way to do account linking when the user clicks the 'Send to Messenger'
        // plugin.
        var passThroughParam = event.optin.ref;

        console.log("Received authentication for user %d and page %d with pass " +
            "through param '%s' at %d", senderID, recipientID, passThroughParam,
            timeOfAuth);

    }

    /*
     * Message Event
     *
     * This event is called when a message is sent to your page. The 'message'
     * object format can vary depending on the kind of message that was received.
     * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
     *
     * For this example, we're going to echo any text that we get. If we get some
     * special keywords ('button', 'generic', 'receipt'), then we'll send back
     * examples of those bubbles to illustrate the special message bubbles we've
     * created. If we receive a message with an attachment (image, video, audio),
     * then we'll simply confirm that we've received the attachment.
     *
     */
     receivedMessage(event) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfMessage = event.timestamp;
        var message = event.message;

        console.log("Received message for user %d and page %d at %d with message:",
            senderID, recipientID, timeOfMessage);
        console.log(JSON.stringify(message));

        var isEcho = message.is_echo;
        var messageId = message.mid;
        var appId = message.app_id;
        var metadata = message.metadata;

        // You may get a text or attachment but not both
        var messageText = message.text;
        var messageAttachments = message.attachments;
        var quickReply = message.quick_reply;

        if (isEcho) {
            // Just logging message echoes to console
            console.log("Received echo for message %s and app %d with metadata %s", messageId, appId, metadata);
        } else if (quickReply) {
            let quickReplyPayload = JSON.parse(quickReply.payload);
            this.emit('quickie', senderID, quickReplyPayload);
            //console.log("Quick reply for message %s with payload %s", messageId, quickReplyPayload);
        } else if (messageText) {
            this.emit('message', senderID, message);
        } else if (messageAttachments) {
            this.emit('attachment', senderID, messageAttachments);
        }
}


    /*
     * Delivery Confirmation Event
     *
     * This event is sent to confirm the delivery of a message. Read more about
     * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
     *
     */
     receivedDeliveryConfirmation(event) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var delivery = event.delivery;
        var messageIDs = delivery.mids;
        var watermark = delivery.watermark;
        var sequenceNumber = delivery.seq;

         if (messageIDs) {
             messageIDs.forEach(function(messageID) {
                 console.log("Received delivery confirmation for message ID: %s",
                     messageID);
             });
         }

        console.log("All message before %d were delivered.", watermark);
    }


    /*
     * Postback Event
     *
     * This event is called when a postback is tapped on a Structured Message.
     * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
     *
     */
     receivedPostback(event) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfPostback = event.timestamp;

        // The 'payload' param is a developer-defined field which is set in a postback
        // button for Structured Messages.
        var payload = event.postback.payload;

        console.log("Received postback for user %d and page %d with payload '%s' " +
            "at %d", senderID, recipientID, payload, timeOfPostback);

         this.emit('postback', senderID, recipientID, JSON.parse(payload));
    }

    /*
     * Message Read Event
     *
     * This event is called when a previously-sent message has been read.
     * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
     *
     */
     receivedMessageRead(event) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;

        // All messages before watermark (a timestamp) or sequence have been seen.
        var watermark = event.read.watermark;
        var sequenceNumber = event.read.seq;

        console.log("Received message read event for watermark %d and sequence " +
            "number %d", watermark, sequenceNumber);
    }

    /*
     * Account Link Event
     *
     * This event is called when the Link Account or UnLink Account action has been
     * tapped.
     * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
     *
     */
     receivedAccountLink(event) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;

        var status = event.account_linking.status;
        var authCode = event.account_linking.authorization_code;

        console.log("Received account link event with for user %d with status %s " +
            "and auth code %s ", senderID, status, authCode);
    }

    /*
     * Send an image using the Send API.
     *
     */
     sendImageMessage(recipientId, url) {
            var messageData = {
                recipient: {
                    id: recipientId
                },
                message: {
                    attachment: {
                        type: "image",
                        payload: {
                            url: SERVER_URL + url
                        }
                    }
                }
        };

        this.callSendAPI(messageData);
    }


    /*
     * Send audio using the Send API.
     * @url is relative path
     *
     */
     sendAudioMessage(recipientId, url) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "audio",
                    payload: {
                        url: SERVER_URL + url
                    }
                }
            }
        };

        this.callSendAPI(messageData);
    }

    /*
     * Send a video using the Send API.
     *
     */
     sendVideoMessage(recipientId, url) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "video",
                    payload: {
                        url: SERVER_URL + url
                    }
                }
            }
        };

        this.callSendAPI(messageData);
    }

    /*
     * Send a file using the Send API.
     *
     */
     sendFileMessage(recipientId, url) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "file",
                    payload: {
                        url: SERVER_URL + "/assets/test.txt"
                    }
                }
            }
        };

        this.callSendAPI(messageData);
    }

    /*
     * Send a text message using the Send API.
     *
     */
     sendTextMessage(recipientId:string, messageText:string, metadata?) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: messageText,
                metadata
            }
        };

        this.callSendAPI(messageData);

     }


    /*
     * Send a Structured Message (Generic Message type) using the Send API.
     * type: template
     *
     */
     sendTemplate(recipientId, payload) {
            var messageData = {
                recipient: {
                    id: recipientId
                },
                message: {
                    attachment: {
                        type: "template",
                        payload
                    }
                }
            };

        this.callSendAPI(messageData);
    }


    /*
     * Send a message with Quick Reply buttons.
     *
     */
     sendQuickReply(recipientId, text, quick_replies) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text,
                quick_replies,
            }
        };

        this.callSendAPI(messageData);
    }

    /*
     * Send a read receipt to indicate the message has been read
     *
     */
    sendReadReceipt(recipientId)
    {
        console.log("Sending a read receipt to mark message as seen");

        var messageData = {
            recipient: {
                id: recipientId
            },
            sender_action: "mark_seen"
        };

        this.callSendAPI(messageData);
    }

    /*
     * Turn typing indicator on
     *
     */
     sendTypingOn(recipientId) {
        console.log("Turning typing indicator on");

            var messageData = {
                recipient: {
                    id: recipientId
                },
                sender_action: "typing_on"
            };

            this.callSendAPI(messageData);
        }

    /*
     * Turn typing indicator off
     *
     */
     sendTypingOff(recipientId) {
        console.log("Turning typing indicator off");

        var messageData = {
            recipient: {
                id: recipientId
            },
            sender_action: "typing_off"
        };

        this.callSendAPI(messageData);
    }

    /*
     * Send a message with the account linking call-to-action
     *
     */
     sendAccountLinking(recipientId) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: "Welcome. Link your account.",
                        buttons:[{
                            type: "account_link",
                            url: SERVER_URL + "/authorize"
                        }]
                    }
                }
            }
        };

        this.callSendAPI(messageData);
    }

    sendLocation(recipientId, text){
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text,
                "quick_replies": [
                    {
                        "content_type": "location",
                    }
                ]
            }
        };
        this.callSendAPI(messageData);
    }

    /*
     * Call the Send API. The message data goes in the body. If successful, we'll
     * get the message id in a response
     *
     */
     private callSendAPI(messageData) {
        request({
            uri: FB_URL,
            qs: { access_token: PAGE_ACCESS_TOKEN },
            method: 'POST',
            json: messageData

        },  (error, response, body) => {
            if (!error && response.statusCode == 200) {
                var recipientId = body.recipient_id;
                var messageId = body.message_id;

                if (messageId) {
                    console.log("Successfully sent message with id %s to recipient %s",
                        messageId, recipientId);
                } else {
                    console.log("Successfully called Send API for recipient %s",
                        recipientId);
                }
            } else {
                console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
                this.emit('error', new Error(body.error));
            }
        });
    }
}

