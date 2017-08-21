# Typescript Messenger, Slack, Telegram bot demo

This is a demo chatbot integrated with Messenger, Slack, Telegram and with web interface to directly chat with bot.  
Bot uses Bruce Wilcox's chatscript, the chatbot engine that has won the Loebner's 4 times and is used for NLP in variety of tech startups.



## Requirements

* [NodeJs](http://nodejs.org) >= 6.x 
* [TypeScript](https://www.typescriptlang.org/) >=2.x
* [Chatscript](https://github.com/bwilcox-1234/ChatScript)

## Install

```sh
$ git clone git://github.com/ibrica/chatbot-demo.git
$ npm install
```

**NOTE:** In order to integrate with facebook, slack and telegram, bot must be registered and keys entered in configuration files.

To copy Bruce Wilcox's chatscript server execute

```sh
cd ./chatscript
git clone https://github.com/bwilcox-1234/ChatScript

```

chatbot is written in typescript which has to be already installed to make a build

```sh
$ npm run build

```


then bot can be started

```sh
$ npm start

```

Visit [http://localhost:3020](http://localhost:3020) or [https://localhost:3043](https://localhost:3043)  
Before chatting, chatscript bot should be builded, send following messages (or use telnet)

```sh
:build 0
:build Harry 
```

Now  you can test the bot, to change conversation modify chatscript/botdata files.

It is possible to connect to ChatScript over telnet, in this case run

```sh
$ npm run telnet
$ telnet localhost 2000
```


## Tests

```sh
$ npm test
```

## License

MIT