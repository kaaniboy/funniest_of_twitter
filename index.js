require('dotenv').config();

const { getVideoTweets } = require('./utils/twitter_utils');
const { downloadVideo } = require('./utils/download_utils');
const { createFinalVideo } = require('./utils/video_utils');

const TEMP_DIR = 'temp';

(async () => {
    const tweets = await getVideoTweets('TheWorldOfFunny');
    tweets.forEach(t => downloadVideo(t.video_url, `${t.id}.mp4`, TEMP_DIR));
    const filenames = tweets.map(t => `${t.id}.mp4`);
    createFinalVideo(filenames, TEMP_DIR);
})();