// dotenv congig
require('dotenv').config()

// fs config
const fs = require('fs');

// request config
const request = require('request');

// Twit config
const Twit = require('twit');
var T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})
var stream = T.stream('user');

// Poke-API config
var Pokedex = require('pokedex-promise-v2');
var options = {
  protocol: 'https',
  versionPath: '/api/v2/',
  cacheLimit: 100 * 1000, // 100s
  timeout: 5 * 1000 // 5s
}
var P = new Pokedex(options);


// constants
const totalPokemon = 802;

// Image data
const filename = "pokemon.png";


// Random quotes
const quotes = require('./quotes');


// Tweet every 24 hours
tweetRandomPokemon();
setInterval(tweetRandomPokemon, 1000*60*60*24);



// When followed
stream.on('follow', followed);

function followed(eventMessage) {
  var screenName = eventMessage.source.screen_name;
  console.log(screenName+" followed!");

  var quote = quotes[Math.floor(Math.random()*quotes.length)];

  tweetIt("@"+screenName+" Thank You for following! "+quote);
}

var b64content = fs.readFileSync(filename, {encoding: 'base64'})
// Get image from url in fs
function getImage(url, tweet) {
  console.log("Requesting...");
  request(url).pipe(fs.createWriteStream(filename))
  console.log("Requested");

  tweetWithMedia(b64content, tweet);
}


function tweetWithMedia(b64content, tweet) {

  T.post('media/upload', { media_data: b64content }, function uploadedImage (err, data, response) {
    console.log("Uploading");
    if (err) {
      console.log(err);
    } else {

      var mediaIdStr = data.media_id_string
      var altText = "Pokémon of the day"
      var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

      T.post('media/metadata/create', meta_params, function (err, data, response) {
        console.log("Posting");
        if (!err) {
          // now we can reference the media and post a tweet (media will attach to the tweet)
          var params = {
            status: tweet,
            media_ids: [mediaIdStr]
          }
          tweetIt(params);
        } else {
          console.log(err);
        }
      })
    }
  }
)}



// Random tweet
function tweetRandomPokemon() {
  var rand = Math.floor(Math.random() * Math.floor(totalPokemon));

  getPokemonTweet(rand);

}

function getPokemonTweet(rand) {
  P.resource(['/api/v2/pokemon/'+rand,'api/v2/pokemon-species/'+rand])
  .then(response => {



    var name = response[0].name;

    formattedName = formatName(name);

    var sprite = response[0].sprites.front_default;

    var textEntries = response[1].flavor_text_entries;

    var description = getTextEntry(textEntries);

    var tweet = createTweetText(description, formattedName);

    console.log(tweet);

    var spriteUrl = response[0].sprites.front_default;
    getImage(spriteUrl, tweet);


  })
  .catch(function(error) {
    console.log('There was an ERROR: ', error);
  });
}

// Post tweet
function tweetIt(params) {
  T.post('statuses/update', params, function(err, data, response) {
    if (err) {
      console.log(err);
    } else {
      console.log("Tweet sent");
    }
  })
}

function formatName (name) {

  var formattedName = '';

  // Special Cases
  switch (name) {
    case 'nidoran-m':
      formattedName = "Nidoran♂";
      break;
    case 'nidoran-f':
      formattedName = "Nidoran♀";
      break;
    case 'farfetchd':
      formattedName = "Farfetch'd";
      break;
    case 'mr-mime':
      formattedName = "Mr. Mime";
      break;
    case 'mime-jr':
      formattedName = "Mime Jr.";
      break;
    case 'ho-oh':
      formattedName = "Ho-Oh";
      break;
    case 'porygon-z':
      formattedName = "Porygon-Z";
      break;
    case 'tapu-lele':
      formattedName = "Tapu Lele";
      break;
    case 'tapu-koko':
      formattedName = "Tapu Koko";
      break;
    case 'tapu-bulu':
      formattedName = "Tapu Bulu";
      break;
    case 'tapu-fini':
      formattedName = "Tapu Fini";
      break;
    case 'type-null':
      formattedName = "Type: Null";
      break;

    default: formattedName = name.charAt(0).toUpperCase() + name.slice(1);

  }
  return formattedName;

}

function getTextEntry(textEntries) {
  var textEntry = '';
  textEntries.some(function(entry){
    if (entry.language.name == 'en' ) {
      textEntry = entry.flavor_text.replace(/\n/g, ' ');
      return true;
    }
  });
  return textEntry;
}

function createTweetText(description, name) {
  var questionMark = "?";
  var index = description.indexOf(".");

  if (description.indexOf(".") > description.indexOf("—") && description.indexOf("—") !== -1) {
    index = description.indexOf("—");
    questionMark += " ";
  }


  description = description.substr(0, index) + questionMark + description.substr(index + 1);

  description = description.charAt(0).toLowerCase() + description.slice(1);


  var tweet = "Today's Pokémon is " + name + "!\n\nDid you know that " + description;

  tweet = tweet.replace(name.toLowerCase(), name);


  return tweet;
}
