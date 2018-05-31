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
var options = {
  protocol: 'https',
  versionPath: '/api/v2/',
  cacheLimit: 100 * 1000, // 100s
  timeout: 5 * 1000 // 5s
}
var P = new Pokedex(options);


// create tweet
const totalPokemon = 802;

// setInterval(tweetRandomPokemon, 1000*10);
tweetRandomPokemon();

function tweetRandomPokemon() {
  var rand = Math.floor(Math.random() * Math.floor(totalPokemon));
  var tweet = '';

  P.resource(['/api/v2/pokemon/'+rand,'api/v2/pokemon-species/'+rand])
  .then(response => {
    var name = response[0].name.charAt(0).toUpperCase() + response[0].name.slice(1)

    var sprite = response[0].sprites.front_default;

    var description = '';
    var textEntries = response[1].flavor_text_entries;

    textEntries.some(function(entry){
      if (entry.language.name == 'en' ) {
        description = entry.flavor_text;
        return true;
      }
    });

    var questionMark = "?";
    var index = description.indexOf(".");
    if (description.indexOf(".") > description.indexOf("—") && description.indexOf("—") !== -1) {
      index = description.indexOf("—");
      questionMark += " ";
    }


    description = description.substr(0, index) + questionMark + description.substr(index + 1);

    description = description.charAt(0).toLowerCase() + description.slice(1);


    tweet = "Today's Pokémon is " + name + "!\nDid you know that " + description;

    tweet = tweet.replace(name.toLowerCase(), name);

    console.log(tweet);

    tweetIt(tweet);

  })
  .catch(function(error) {
    console.log('There was an ERROR: ', error);
  });
}

// Post tweet

function tweetIt(text) {
  T.post('statuses/update', { status: text }, function(err, data, response) {
    console.log(data)
  })
}
