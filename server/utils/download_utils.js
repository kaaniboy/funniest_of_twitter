const download = require('download');

const CLIPS_DIR = 'clips';

module.exports.downloadVideo = async function(video_url, filename, dir = CLIPS_DIR) {
    const options = { filename };
    try {
        await download(video_url, dir, options);
    } catch (error) {
        console.log(error);
    }
}