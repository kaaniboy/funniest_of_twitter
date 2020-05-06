const Twitter = require('twitter');

const TWEET_COUNT = 5;

const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    bearer_token: process.env.TWITTER_BEARER_TOKEN
});

module.exports.getVideoTweets = async function(screen_name, count = TWEET_COUNT) {
    console.log('Retrieving video tweets');
    const params = { screen_name, count };

    try {
        const tweets = await client.get('statuses/user_timeline', params);
        const videoTweets = tweets.filter(hasVideo).map(extractTweetInfo);
        return videoTweets;
    } catch (error) {
        console.log(error);
        return null;
    }
}

function hasVideo(tweet) {
    if (!tweet.extended_entities) {
        return false;
    }
    return tweet.extended_entities.media[0].type === 'video';
}

function extractTweetInfo(tweet) {
    const video_details = tweet.extended_entities.media[0].video_info;
    const video_bitrates = video_details.variants.map(v => v.bitrate || 0);
    const video_size = tweet.extended_entities.media[0].sizes.large;

    const video_url = video_details.variants[
        video_bitrates.indexOf(Math.max(...video_bitrates))
    ].url;

    return {
        id: tweet.id_str,
        bitrate: Math.max(...video_bitrates),
        name: tweet.user.name,
        text: tweet.text,
        aspect_ratio: video_details.aspect_ratio,
        video_size,
        video_url
    };
}