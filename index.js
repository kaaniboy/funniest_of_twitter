require('dotenv').config();

const { getVideoTweets } = require('./utils/twitter_utils');
const { downloadVideo } = require('./utils/download_utils');
const { concatenateVideos } = require('./utils/video_utils');

const TEMP_DIR = 'temp';

(async () => {
    const tweets = await getVideoTweets('TheWorldOfFunny');
    for (let t of tweets) {
        downloadVideo(t.video_url, t.id + '.mp4', TEMP_DIR);
    }
    const filenames = tweets.map(t => t.id + '.mp4');
    concatenateVideos(filenames, TEMP_DIR);
})();