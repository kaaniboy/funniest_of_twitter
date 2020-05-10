require('dotenv').config();
const Twitter = require('twitter');
const emojiStrip = require('emoji-strip');

const MILLIS_IN_SEC = 1000;
const MILLIS_IN_DAY = 24 * 60 * 60 * 1000;
const SEC_IN_MIN = 60;
const TWEET_TEXT_SPLIT = 'https://t.co/';

const TWEETS_PER_ACCOUNT = +process.env.TWEETS_PER_ACCOUNT;
const MINIMUM_TOTAL_DURATION_SEC = +process.env.MINIMUM_TOTAL_DURATION_SEC;
const MAX_TWEET_DURATION_SEC = +process.env.MAX_TWEET_DURATION_SEC;

const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    bearer_token: process.env.TWITTER_BEARER_TOKEN
});

module.exports.curateTweets = async function(screen_names, count = TWEETS_PER_ACCOUNT) {
    console.log(`Retrieving ${MINIMUM_TOTAL_DURATION_SEC / SEC_IN_MIN} minutes of video tweets`);

    let videoTweets = await retrieveVideoTweets(screen_names, count);
    videoTweets = videoTweets.filter(tweet => tweet.duration_sec < MAX_TWEET_DURATION_SEC);
    
    let curatedTweets = [];
    let totalDurationSec = 0;
    
    for (let tweet of videoTweets) {
        if (totalDurationSec > MINIMUM_TOTAL_DURATION_SEC) break;
        curatedTweets.push(tweet);
        totalDurationSec += tweet.duration_sec;
    }
    return curatedTweets;
}

async function retrieveVideoTweets(screen_names, count) {
    try {
        let tweets = [];
        await Promise.all(screen_names.map(async (screen_name) => {
            const params = {
                screen_name, 
                count
            };

            const newTweets = await client.get('statuses/user_timeline', params);
            tweets = tweets.concat(newTweets);
        }));
        
        const videoTweets = tweets
            .filter(hasVideo)
            .map(extractTweetInfo);
        
        videoTweets.sort((a, b) => b.relevance - a.relevance);
        return videoTweets;
    } catch (error) {
        console.log(error);
        return [];
    }
}

function hasVideo(tweet) {
    if (!tweet.extended_entities) {
        return false;
    }
    return tweet.extended_entities.media[0].type === 'video';
}

function extractTweetInfo(tweet) {
    const video_info = tweet.extended_entities.media[0].video_info;
    const video_bitrates = video_info.variants.map(v => v.bitrate || 0);
    const video_size = tweet.extended_entities.media[0].sizes.large;
    const text = tweet.text.split(TWEET_TEXT_SPLIT)[0].trim();

    const video_url = video_info.variants[
        video_bitrates.indexOf(Math.max(...video_bitrates))
    ].url;

    const relevance = calculateRelevance(
        tweet.favorite_count,
        new Date(tweet.created_at)
    );

    return {
        id: tweet.id_str,
        name: tweet.user.name,
        text: cleanText(text),
        created_at: tweet.created_at,
        favorite_count: tweet.favorite_count,
        relevance: relevance,
        bitrate: Math.max(...video_bitrates),
        aspect_ratio: video_info.aspect_ratio,
        video_size,
        video_url,
        duration_sec: video_info.duration_millis / MILLIS_IN_SEC
    };
}

function cleanText(text) {
    // Replace & with 'and'
    text = text.replace(/&/g, 'and');
    text = text.replace(/"/g, '');
    // Remove emojis
    return emojiStrip(text).trim();
}

function calculateRelevance(favorite_count, created_at) {
    const daysElapsed = Math.max(1, (Date.now() - created_at.getTime()) / MILLIS_IN_DAY);
    return favorite_count / (2 * daysElapsed);
}