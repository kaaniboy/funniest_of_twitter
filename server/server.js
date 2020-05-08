const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const fsExtra = require('fs-extra');

const { curateTweets } = require('./utils/twitter_utils');
const { downloadVideo } = require('./utils/download_utils');
const { createFinalVideo } = require('./utils/video_utils');
const { beginYouTubeAuth, uploadToYouTube } = require('./utils/youtube_utils');

const PORT = 9000;

const WEB_PUBLIC_DIR = path.join(__dirname, '../../web/public');
const CLIPS_DIR = path.join(__dirname, 'clips');

let tweets = [];

module.exports.startServer = function() {
    const server = express();

    server.use(bodyParser.json());
    server.use(express.static(WEB_PUBLIC_DIR));
    server.use('/static', express.static(CLIPS_DIR));

    server.use(cors());

    server.get('/', (req, res) => {
        res.sendFile('index.html');
    });

    server.get('/clips', (req, res) => {
        const clips = fs.readdirSync(CLIPS_DIR)
            .filter(c => c !== '.DS_Store');
        res.json({ clips });
    });

    server.post('/clips', async (req, res) => {
        const accounts = req.body.accounts;
        tweets = await curateTweets(accounts);
        
        console.log(`Downloading ${tweets.length} videos...`);
        await Promise.all(tweets.map(async tweet => {
            await downloadVideo(tweet.video_url, `${tweet.id}.mp4`);
        }));

        res.send({ success: true });
    });

    server.delete('/clips/:file_name', (req, res) => {
        const { file_name } = req.params;
        try {
            fs.unlinkSync(`${CLIPS_DIR}/${file_name}`);
            res.json({ success: true });
        } catch (error) {
            res.json({ success: false });
        }
    });

    server.post('/upload', (req, res) => {
        createFinalVideo(tweets);
        beginYouTubeAuth();
        
        // Clean temporary files
        fsExtra.emptyDirSync(CLIPS_DIR);
        res.send({ success: true });
    });

    server.get('/youtube_redirect', uploadToYouTube);

    server.listen(PORT, () => console.log(`Launching web UI at http://localhost:${PORT}`));
    return server;
}

const isCLI = !module.parent;
if (isCLI) {
    module.exports.startServer();
}