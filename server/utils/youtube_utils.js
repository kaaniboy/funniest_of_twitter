require('dotenv').config();
const YouTube = require('youtube-api');
const open = require('open');
const fs = require("fs");
const prettyBytes = require("pretty-bytes");

const OUTPUT_DIR = 'output';
const UPDATE_INTERVAL_MS = 1000;

const VIDEO_TITLE_PREFIX = process.env.VIDEO_TITLE_PREFIX;
const VIDEO_DESCRIPTION = process.env.VIDEO_DESCRIPTION;
const VIDEO_TAGS = process.env.VIDEO_TAGS.split(',');

const oauth = YouTube.authenticate({
    type: 'oauth',
    client_id: process.env.YOUTUBE_CLIENT_ID,
    client_secret: process.env.YOUTUBE_CLIENT_SECRET,
    redirect_url: process.env.YOUTUBE_AUTH_URL
});

module.exports.beginYouTubeAuth = function() {
    console.log('Beginning YouTube authentication...');
    open(oauth.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/youtube.upload"]
    }));
}

module.exports.uploadToYouTube = function (req, res) {
    console.log('Beginning upload to YouTube...');
    const code = req.query.code;

    oauth.getToken(code, (error, tokens) => {
        if (error) {
            console.log(error);
            return;
        }

        oauth.setCredentials(tokens);
        const today = new Date();

        const req = YouTube.videos.insert({
            resource: {
                snippet: getVideoSnippet(today),
                status: {
                    privacyStatus: 'public'
                }
            },
            media: getVideoMedia(today),
            part: 'snippet,status'
        }, (error, data) => {
            console.log("Finished uploading video to YouTube.");
            if (error) {
                console.log(error);
            }
            console.log(data);
            process.exit();
        });
    
        setInterval(function () {
            console.log(`${prettyBytes(req.req.connection._bytesDispatched)} bytes uploaded.`);
        }, UPDATE_INTERVAL_MS);
    });
}

function getVideoSnippet(date) {
    let date_text = date.toDateString();
    date_text = date_text.substring(date_text.indexOf(' ') + 1);

    return {
        title: `${VIDEO_TITLE_PREFIX} (${date_text})`,
        description: VIDEO_DESCRIPTION,
        tags: VIDEO_TAGS
    };
}

function getVideoMedia(date) {
    const video_filename = date.toISOString().split('T')[0] + '.mp4';
    return {
        body: fs.createReadStream(`${OUTPUT_DIR}/${video_filename}`)
    };
}