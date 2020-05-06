require('dotenv').config();
const fsExtra = require('fs-extra');

const { curateTweets } = require('./utils/twitter_utils');
const { downloadVideo } = require('./utils/download_utils');
const { createFinalVideoFromTweets, createThumbnailCommand } = require('./utils/video_utils');

const TEMP_DIR = 'temp';
const TWITTER_NAMES = [
    'tiktok_us',
    'ffs_omg',
];

async function run() {
    // Clean temporary files
    fsExtra.emptyDirSync(TEMP_DIR);
    
    // Retrieve tweets
    const tweets = await curateTweets(TWITTER_NAMES);

    // Download videos in tweets
    await Promise.all(tweets.map(async tweet => {
        await downloadVideo(tweet.video_url, `${tweet.id}.mp4`, TEMP_DIR);
    }));

    // Concat videos into a final video
    createFinalVideoFromTweets(tweets, TEMP_DIR);
    
    // Clean temporary files
    fsExtra.emptyDirSync(TEMP_DIR);
}

(async () => {
    run();
})();