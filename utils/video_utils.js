const { execSync } = require('child_process');

const OUTPUT_DIR = 'output';
const FONT_PATH = 'static/AvenirNext-Bold.ttf';

const RES_WIDTH = 1280;
const RES_HEIGHT = 720;

module.exports.createFinalVideoFromTweets = function(tweets, temp_dir) {
    if (!tweets || tweets.length === 0) return;

    // TODO: Support videos without audio.
    tweets = tweets.filter(t => hasAudio(`${temp_dir}/${t.id}.mp4`));

    const filenames = tweets.map(t => `${temp_dir}/${t.id}.mp4`);
    const resized_filenames = filenames.map(f => `${f.split('.')[0]}-resized.mp4`);
    const subtitles = tweets.map(t => t.text);

    const output_filename = new Date().toISOString().split('T')[0] + '.mp4';
    
    try {
        resizeVideos(subtitles, filenames, resized_filenames);
        concatVideos(resized_filenames, `${OUTPUT_DIR}/${output_filename}`);
        createThumbnail(`${OUTPUT_DIR}/${output_filename}`);
    } catch (e) {
        console.log(e);
    }
}

function resizeVideos(subtitles, filenames, resized_filenames) {
    console.log(`Resizing ${filenames.length} videos...`);

    filenames.forEach((filename, i) => {
        execSync(createResizeCommand(subtitles[i], filename, resized_filenames[i]));
    });
}

function concatVideos(filenames, output_filename) {
    console.log(`Concatenating ${filenames.length} videos...`);

    const concatCommand = createConcatCommand(filenames, output_filename);
    execSync(concatCommand);
}

function createThumbnail(filename) {
    console.log('Generating thumbnail...');
    execSync(createThumbnailCommand(filename));
}

function createConcatCommand(filenames, output_filename) {
    let command = 'ffmpeg ';
    command += filenames.map(f => `-i ${f}`).join(' ');
    command += ' -filter_complex "';
    command += filenames.map((f, i) => `[${i}:v] [${i}:a]`).join(' ');
    command += ` concat=n=${filenames.length}:v=1:a=1 [v] [a]"`;
    command += ` -map "[v]" -map "[a]" ${output_filename}`
    command += ' -loglevel error -hide_banner';
    return command;
}

function createResizeCommand(subtitle, filename, resized_filename) {
    let command = `ffmpeg -i ${filename} -vf "scale=w=${RES_WIDTH}:h=${RES_HEIGHT}:force_original_aspect_ratio=1,pad=${RES_WIDTH}:${RES_HEIGHT}:(ow-iw)/2:(oh-ih)/2,`;
    command += `drawtext=fontfile=${FONT_PATH}: text=\'${subtitle}\':fontcolor=white: fontsize=24: box=1: boxcolor=black@0.5: boxborderw=5: x=(w-text_w)/2: y= h-text_h-30"`;
    
    command += ` ${resized_filename}`;
    command += ' -loglevel error -hide_banner';
    return command;
}

function createThumbnailCommand(filename) {
    thumbnail_filename = `${filename.split('.')[0]}-thumbnail.png`;
    return `ffmpeg -i ${filename} -ss 00:00:01.000 -vframes 1 ${thumbnail_filename}`;
}

function hasAudio(filename) {
    const info = execSync(`ffprobe -i ${filename} -show_streams -select_streams a -loglevel error`);
    return info.length !== 0;
}