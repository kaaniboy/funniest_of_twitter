const download = require('download');
const fs = require('fs');
const fsExtra = require('fs-extra');

const CLIPS_DIR = 'clips';

module.exports.clearClips = function() {
    fsExtra.emptyDirSync(CLIPS_DIR);
}

module.exports.downloadClips = async function(tweets) {
    console.log(`Downloading ${tweets.length} clips...`);
    module.exports.clearClips();

    await Promise.all(tweets.map(async tweet => {
        await downloadClip(tweet.video_url, `${tweet.id}.mp4`);
    }));
}

async function downloadClip(video_url, filename) {
    const options = { filename };
    try {
        await download(video_url, CLIPS_DIR, options);
    } catch (error) {
        console.log(error);
    }
}

module.exports.getClips = function() {
    return fs.readdirSync(CLIPS_DIR)
        .filter(c => c !== '.DS_Store');
}

module.exports.deleteClip = function(file_name) {
    try {
        fs.unlinkSync(`${CLIPS_DIR}/${file_name}`);
        return true;
    } catch (error) {
        return false;
    }
}