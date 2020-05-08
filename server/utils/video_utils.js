const { execSync } = require('child_process');
const fs = require('fs');

const CLIPS_DIR = 'clips';
const OUTPUT_DIR = 'output';
const FONT_PATH = 'static/AvenirNext-Bold.ttf';

TITLE_TOP = 'FUNNIEST VIDEOS';
TITLE_FONT_SIZE = 130;
SUBTITLE_FONT_SIZE = 24;

const RES_WIDTH = 1280;
const RES_HEIGHT = 720;

module.exports.createFinalVideo = function(tweets, temp_dir = CLIPS_DIR) {
    let clips = fs.readdirSync(CLIPS_DIR)
        .filter(c => c !== '.DS_Store');

    const subtitlesMap = {};
    tweets.forEach(t => {
        subtitlesMap[t.id] = t.text
    });

    clips = clips.filter(c => hasAudio(`${temp_dir}/${c}`));

    const filenames = clips.map(c => `${temp_dir}/${c}`);
    const resized_filenames = filenames.map(f => `${f.split('.')[0]}-resized.mp4`);
    const subtitles = clips.map(c => subtitlesMap[c.split('.')[0]]);

    const output_filename = new Date().toISOString().split('T')[0] + '.mp4';
    const output_path = `${OUTPUT_DIR}/${output_filename}`;
    
    try {
        transformVideos(subtitles, filenames, resized_filenames);
        concatVideos(resized_filenames, output_path);
        createThumbnail(output_path, TITLE_TOP, createDateText(new Date()));
    } catch (e) {
        console.log(e);
    }
}

function transformVideos(subtitles, filenames, resized_filenames) {
    console.log(`Transforming ${filenames.length} videos...`);

    filenames.forEach((filename, i) => {
        execSync(createTransformCommand(subtitles[i], filename, resized_filenames[i]));
    });
}

function concatVideos(filenames, output_filename) {
    console.log(`Concatenating ${filenames.length} videos...`);

    const concatCommand = createConcatCommand(filenames, output_filename);
    execSync(concatCommand);
}

function createThumbnail(filename, title_top, title_bottom) {
    console.log('Generating thumbnail...');
    execSync(createThumbnailCommand(filename, title_top, title_bottom));
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

function createTransformCommand(subtitle, filename, resized_filename) {
    let command = `ffmpeg -i ${filename} -vf "scale=w=${RES_WIDTH}:h=${RES_HEIGHT}:force_original_aspect_ratio=1,pad=${RES_WIDTH}:${RES_HEIGHT}:(ow-iw)/2:(oh-ih)/2,`;
    command += `drawtext=fontfile=${FONT_PATH}: text=\'${subtitle}\':fontcolor=white: fontsize=${SUBTITLE_FONT_SIZE}: box=1: boxcolor=black@0.5: boxborderw=5: x=(w-text_w)/2: y= h-text_h-30"`;
    
    command += ` ${resized_filename}`;
    command += ' -loglevel error -hide_banner';
    return command;
}

function createThumbnailCommand(filename, title_top, title_bottom) {
    thumbnail_filename = `${filename.split('.')[0]}-thumbnail.png`;

    let command = `ffmpeg -i ${filename} -ss 00:00:01.000 -vframes 1 `
    command += ` -vf "drawtext=fontfile=${FONT_PATH}: text=\'${title_top}\':fontcolor=white: fontsize=${TITLE_FONT_SIZE}: x=(w-text_w)/2: y=(h-2*text_h)/2`;
    command += `,drawtext=fontfile=${FONT_PATH}: text=\'${title_bottom}\':fontcolor=white: fontsize=${TITLE_FONT_SIZE}: x=(w-text_w)/2: y=40+text_h+(h-2*text_h)/2"`;
    command += ` ${thumbnail_filename}`;
    command += ' -loglevel error -hide_banner';
    return command;
}

function hasAudio(filename) {
    const info = execSync(`ffprobe -i ${filename} -show_streams -select_streams a -loglevel error`);
    return info.length !== 0;
}

function createDateText(date) {
    let title_bottom = date.toDateString();
    title_bottom = title_bottom.substring(title_bottom.indexOf(' ') + 1);
    return title_bottom.toUpperCase();
}