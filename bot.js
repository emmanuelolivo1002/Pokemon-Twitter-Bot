// Twit config
const Twit = require('twit');
var T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET       60*1000,
})

// dotenv congig
require('dotenv').config()

// Poke-API config
var Pokedex = require('pokedex-promise-v2');
var P = new Pokedex();
