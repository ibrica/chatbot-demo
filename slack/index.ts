import {RtmClient, RTM_EVENTS} from '@slack/client';
const config = require('config'),
      token = config.get('slack').token;

const rtm = new RtmClient(token, {logLevel: 'debug'});

rtm.start();

export let client = rtm, events = RTM_EVENTS;
