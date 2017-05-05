/**
 * Connect to Slack Real Time API 
 */
import {RtmClient,CLIENT_EVENTS, RTM_EVENTS} from '@slack/client';
const config = require('config'),
      token = config.get('slack').token;

let CONNECTED:Boolean = false;


export const rtm = new RtmClient(token, {logLevel: 'debug'});

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload if you want to cache it
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

// you need to wait for the client to fully connect before you can send messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
  CONNECTED = true;
});

rtm.start();

export let SLACK_EVENTS = CLIENT_EVENTS.RTM;

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
