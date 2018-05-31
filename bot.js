// dotenv congig
require('dotenv').config()

// Twit config
const Twit = require('twit');
var T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})


// Poke-API config
var Pokedex = require('pokedex-promise-v2');
var P = new Pokedex();


// Post tweet
T.post('statuses/update', { status: 'hello world!' }, function(err, data, response) {
  console.log(data)
})
