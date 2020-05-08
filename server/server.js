const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const cors = require('cors');
const open = require('open');

const { curateTweets } = require('./utils/twitter_utils');
const { downloadClips, getClips, deleteClip, clearClips } = require('./utils/file_utils');
const { createFinalVideo } = require('./utils/video_utils');
const { beginYouTubeAuth, uploadToYouTube } = require('./utils/youtube_utils');

const PORT = 9000;

const WEB_PUBLIC_DIR = path.join(__dirname, '../web/public');
const CLIPS_DIR = path.join(__dirname, 'clips');

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
        res.json({ clips: getClips() });
    });

    server.post('/clips', async (req, res) => {
        const accounts = req.body.accounts;
        server.locals.tweets = await curateTweets(accounts);
        await downloadClips(server.locals.tweets);

        res.send({ success: true });
    });

    server.delete('/clips/:file_name', (req, res) => {
        const { file_name } = req.params;
        const success = deleteClip(file_name);
        res.json({ success });
    });

    server.post('/upload', (req, res) => {
        console.log(server.locals.tweets);
        createFinalVideo(server.locals.tweets);
        beginYouTubeAuth();

        clearClips();
        res.send({ success: true });
    });

    server.get('/youtube_redirect', uploadToYouTube);
    server.listen(PORT);
}

const isCLI = !module.parent;
if (isCLI) {
    module.exports.startServer();
    open(`http://localhost:${PORT}`);
}