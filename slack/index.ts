/**
 * Connect to Slack Real Time API 
 */
import {RtmClient,CLIENT_EVENTS, RTM_EVENTS} from '@slack/client';
const config = require('config'),
      token = config.get('slack').token || '';

let CONNECTED:Boolean = false;


export const rtm = new RtmClient(token, {logLevel: 'error'});


let channel:String;

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const c of rtmStartData.channels) {
	  if (c.is_member && c.name ==='general') { channel = c.id }
  }
  console.log(`Slack: Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}`);
});


// you need to wait for the client to fully connect before you can send messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
  CONNECTED = true;
});

rtm.start();


/**
 * Send Message to Slack
 * @param message Send to channel
 * @param channel 
 */
export function sendToSlack(message:String, channel:String) {
    channel = channel ||  "#general";
    if (CONNECTED){
      rtm.sendMessage(message, channel);
    } else {
      console.error("Not connected to Slack! Message can't be send!");
    }
}

/**
 * Register event handler for received Slack messages
 * @param cb Callback function
 */
export function receiveSlack(cb:Function) {
  rtm.on(RTM_EVENTS.MESSAGE, message => {
    // Listens to all `message` events from the team
    //Don't respond to own message or channel joins
    if (message.user === rtm.activeUserId || message.subtype === "channel_join") return;      
    console.log("Received from Slack: " + message.text);
    cb(message.user, message.text, message.channel);
  });
}
