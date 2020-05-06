const { execSync } = require('child_process');

const OUTPUT_DIR = 'output';

const RES_WIDTH = 1280;
const RES_HEIGHT = 720;

module.exports.createFinalVideo = function(filenames, temp_dir) {
    if (!filenames || filenames.length === 0) return;

    filenames = filenames
        .map(f => `${temp_dir}/${f}`)
        .filter(hasAudio);
    const resized_filenames = filenames.map(f => `${f.split('.')[0]}-resized.mp4`);

    output_filename = new Date().toISOString().split('T')[0] + '.mp4';
    
    try {
        resizeVideos(filenames, resized_filenames);
        concatVideos(resized_filenames, `${OUTPUT_DIR}/${output_filename}`);
    } catch (e) {
        console.log(e);
    }
}

function resizeVideos(filenames, resized_filenames) {
    console.log(`Resizing ${filenames.length} videos...`);

    filenames.forEach((filename, i) => {
        execSync(createResizeCommand(filename, resized_filenames[i]));
    });
}

function concatVideos(filenames, output_filename) {
    console.log(`Concatenating ${filenames.length} videos...`);

    const concatCommand = createConcatCommand(filenames, output_filename);
    execSync(concatCommand);
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

function createResizeCommand(filename, resized_filename) {
    return `ffmpeg -i ${filename} -vf "scale=w=${RES_WIDTH}:h=${RES_HEIGHT}:force_original_aspect_ratio=1`
        + `,pad=${RES_WIDTH}:${RES_HEIGHT}:(ow-iw)/2:(oh-ih)/2" ${resized_filename}`;
}

function hasAudio(filename) {
    const info = execSync(`ffprobe -i ${filename} -show_streams -select_streams a -loglevel error`);
    return info.length !== 0;
}