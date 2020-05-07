const express = require('express');
const cors = require('cors');
const fs = require('fs');

const CLIPS_DIR = 'clips';
const PORT = 9000;

const server = express();
server.use('/static', express.static(__dirname + '/clips'));
server.use(cors());

server.get('/', (req, res) => {
    res.send('Hello World!');
});

server.get('/clips', (req, res) => {
    const clips = fs.readdirSync(CLIPS_DIR)
        .filter(c => c !== '.DS_Store');
    res.json({ clips });
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

server.listen(PORT, () => console.log(`Listening for YouTube redirect at http://localhost:${PORT}`));