const ffmpeg = require('fluent-ffmpeg');
const { exec } = require('child_process');

const OUTPUT_FILENAME = 'final.mp4';
const VIDEO_CODEC = 'libx264';
const RESOLUTION = '1280x720';

module.exports.createFinalVideo = function(filenames, dir, output_filename = OUTPUT_FILENAME) {
    if (!filenames || filenames.length === 0) return;
    filenames = filenames.map(f => `${dir}/${f}`);
    
    try {
        resizeVideos(filenames, resized_filenames => {
            concatVideos(resized_filenames, `${dir}/${output_filename}`);
        });
    } catch (e) {
        console.log(e);
    }
}

function resizeVideos(filenames, callback) {
    console.log(`Resizing ${filenames.length} videos...`);
    let finished = new Array(filenames.length).fill(false);

    const resized_filenames = filenames.map(f => `${f.split('.')[0]}-resized.mp4`);

    filenames.forEach((f, i) => {
        ffmpeg(f)
            .withVideoCodec(VIDEO_CODEC)
            .withSize(RESOLUTION)
            .autoPad()
            .saveToFile(resized_filenames[i])
            .on('end', () => {
                finished[i] = true;
                if (finished.every(f => f)) {
                    callback(resized_filenames);
                    return;
                }
            });
    });
}

function concatVideos(filenames, output_filename) {
    console.log(`Resizing ${filenames.length} videos...`);

    const concatCommand = createConcatCommand(filenames, output_filename);
    console.log(concatCommand);

    exec(concatCommand, (error, _, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
        }
    });
}

function createConcatCommand(filenames, output_filename) {
    let command = 'ffmpeg ';
    command += filenames.map(f => `-i ${f}`).join(' ');
    command += ' -filter_complex "';
    command += filenames.map((f, i) => `[${i}:v] [${i}:a]`).join(' ');
    command += ` concat=n=${filenames.length}:v=1:a=1 [v] [a]"`;
    command += ` -map "[v]" -map "[a]" ${output_filename}`
    return command;
}