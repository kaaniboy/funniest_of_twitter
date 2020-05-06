require('dotenv').config();
const fsExtra = require('fs-extra');

const { curateTweets } = require('./utils/twitter_utils');
const { downloadVideo } = require('./utils/download_utils');
const { createFinalVideoFromTweets } = require('./utils/video_utils');
const { beginYouTubeUpload } = require('./utils/youtube_utils');

const TEMP_DIR = 'temp';
const TWITTER_NAMES = [
    'tiktok_us',
    'ffs_omg',
    'TrendingTiktoks',
    'supplierofmemes',
    'HoodMemesDaily'
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

    // Upload to YouTube
    beginYouTubeUpload();
    
    // Clean temporary files
    fsExtra.emptyDirSync(TEMP_DIR);
}

(async () => {
    run();
})();