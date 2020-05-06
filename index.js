require('dotenv').config();
const fsExtra = require('fs-extra');

const { curateTweets } = require('./utils/twitter_utils');
const { downloadVideo } = require('./utils/download_utils');
const { createFinalVideo } = require('./utils/video_utils');

const TEMP_DIR = 'temp';
const TWITTER_NAMES = [
    'tiktok_us',
    'ffs_omg',
];

async function run() {
    // const tweets = await curateTweets(TWITTER_NAMES);
    /*
    tweets.forEach(t => downloadVideo(t.video_url, `${t.id}.mp4`, TEMP_DIR));
    const filenames = tweets.map(t => `${t.id}.mp4`);
    createFinalVideo(filenames, TEMP_DIR);
    */
   fsExtra.emptyDirSync(TEMP_DIR)
}

(async () => {
    run();
})();