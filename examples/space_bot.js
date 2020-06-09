/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates a multi-stage conversation

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node demo_bot.js

# USE THE BOT:

  Find your bot inside Slack

  Say: "pizzatime"

  The bot will reply "What flavor of pizza do you want?"

  Say what flavor you want.

  The bot will reply "Awesome" "What size do you want?"

  Say what size you want.

  The bot will reply "Ok." "So where do you want it delivered?"

  Say where you want it delivered.

  The bot will reply "Ok! Goodbye."

  ...and will refrain from billing your card because this is just a demo :P

# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var Botkit = require('../lib/Botkit.js');
var fetch = require('node-fetch');

// if (!process.env.token) {
//   console.log('Error: Specify token in environment');
//   process.exit(1);
// }

var controller = Botkit.slackbot({
 debug: true
});

controller.spawn({
  token: process.env.SLACK_TOKEN
}).startRTM((err) => {
  if (err) {
    throw new Error(err);
  }
});

controller.hears(['astronauts','in space'],['ambient'], (bot, message) => {
  bot.startConversation(message, inSpace);
});

controller.hears([' iss[\.| |\?]', 'international space station'],['ambient'], (bot, message) => {
  bot.startConversation(message, whereISS);
});

inSpace = function(response, convo) {
  fetch('http://api.open-notify.org/astros.json').
  then((response) => {
    return response.json();
  }).
  then((json) => {
    var listNames = '';
    var nameCount = 1;
    var nameMax = json['people'].length;
    for (var name of json['people']) {
      listNames += name['name'];
      if (nameCount < nameMax) {
        listNames += ', ';
      } else {
        listNames += '.';
      }
      nameCount++;
    }
    convo.say('There are ' + json['number'] + ' people in space right now: ' + listNames);
  });
}

whereISS = function (response, convo) {
  fetch('http://api.open-notify.org/iss-now.json').
  then((response) => {
    return response.json();
  }).
  then((json) => {
    var mapURL = 'http://maps.googleapis.com/maps/api/staticmap?center=' + json['iss_position'].latitude + ',' + json['iss_position'].longitude + '&zoom=3&size=600x300&maptype=roadmap&markers=color:orange%7Clabel:A%7C' + json['iss_position'].latitude + ',' + json['iss_position'].longitude + '&sensor=false';
    convo.say('The ISS is here: ' + mapURL);
  });
}
