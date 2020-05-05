const ffmpeg = require('fluent-ffmpeg');

const OUTPUT_FILENAME = 'merged.mp4';

module.exports.concatenateVideos = function(filenames, dir) {
    if (!filenames || filenames.length === 0) return;
    console.log('Concatenating videos');
    filenames = filenames.map(f => dir + '/' + f);
    
    const merged = ffmpeg();
    merged.addInput(filenames[0]);
    //for (let f of filenames) {
    //    merged.addInput(f);
    //}
    merged.mergeToFile(dir + '/' + OUTPUT_FILENAME, dir);
}