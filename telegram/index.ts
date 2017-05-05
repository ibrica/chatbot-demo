"use strict";
import * as TelegramBot from 'node-telegram-bot-api';

const config = require('config'),
      telegramConfig = config.get('telegram'),
      TOKEN =  telegramConfig.token,
      PORT  = telegramConfig.port,
      URL = (process.env.SERVER_URL) || config.url 

/**
 * Get insstance of Telegram API client
 */
export function get(){
    let options = {
        
        webHook: {
            port: PORT,
            key:  __dirname +  '/../ssl/key.pem',
            cert: __dirname + '/../ssl/cert.pem'
        }
    };

    var telegram = new TelegramBot(TOKEN, options);
    //Controller?
    telegram.setWebHook(`${URL}:${PORT}/tg/hook`, '../ssl/cert.pem');

    return telegram;

};