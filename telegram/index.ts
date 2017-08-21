"use strict";
import * as TelegramBot from 'node-telegram-bot-api';

const config = require('config'),
      telegramConfig = config.get('telegram'),
      TOKEN =  telegramConfig.token;

// Create a bot that uses 'polling' to fetch new updates
const telegram = new TelegramBot(TOKEN, {polling:true});


/**
 * Register event handler for received Telegram text messages
 * @param cb Callback function
 */
export function receiveTelegram(cb:Function) {
    telegram.on('message', message => {
      console.log("Received from Telegram: " + message.text);
      cb(message.chat.id, message.text);
    });
}

/**
 * Send Message to Telegram
 * @param message Text to send
 * @param chatId ID of the chat
 */
export function sendToTelegram(chatId:String, message:String) {
    // send a message to the chat
    telegram.sendMessage(chatId, message);
}
  
