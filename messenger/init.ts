/**
 * Set facebook messanger app through POST-s
 * 
 */
"use strict";
const request = require('request'),
      config = require('config'),
      facebook = config.get('facebook'),
      PAGE_ACCESS_TOKEN = facebook.pageAccessToken,
      url = `https://graph.facebook.com/v2.6/me/thread_settings?access_token=${PAGE_ACCESS_TOKEN}`;


exports.menu = () => {
  let data = {
    "setting_type" : "call_to_actions",
    "thread_state" : "existing_thread",
    "call_to_actions" : [
        {
            "type": "postback",
            "title": "USER_DEFINED_TITLE",
            "payload": "USER_DEFINED_PAYLOAD"
        }
    ]
  };
  post(data);
};

exports.greeting = () => {
  let data = {
      "setting_type":"greeting",
      "greeting":{
          "text":"USER_DEFINED_TEXT"
      }
  };
  post(data);
};

exports.getStarted = () => {
  let data = {
      "setting_type":"call_to_actions",
      "thread_state":"new_thread",
      "call_to_actions":[
          {
              "payload":"USER_DEFINED_PAYLOAD"
          }
      ]
  };
  post(data);
};

exports.deleteMenu = () => {
    let data = {
        "setting_type":"call_to_actions",
        "thread_state":"existing_thread"
    };
    post(data);
};

exports.deleteGreeting = () => {
    let data = {
        "setting_type":"call_to_actions",
        "thread_state":"new_thread"
    };
    post(data);
};

exports.deleteGetStarted = () => {
    let data = {
        "setting_type":"greeting"
    };
    post(data);
};
//For webview post necessary
exports.whiteList = () => {
    let data = {
        "setting_type" : "domain_whitelisting",
        "whitelisted_domains" : ["USER_DEFINED_DOMAIN"],
        "domain_action_type": "add"
    };
    post(data);
};

function post(data){
    request
        .post(url)
        .json(data)
        .on('response',  response =>  console.log("Cloud response:\n " + JSON.stringify(response)))
        .on('error', error => console.error(error));
}

