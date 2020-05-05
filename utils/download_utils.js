const download = require('download');

module.exports.downloadVideo = async function(video_url, filename, dir) {
    console.log('Downloading video ' + filename);
    const options = { filename };
    try {
        await download(video_url, dir, options);
    } catch (error) {
        console.log(error);
    }
}