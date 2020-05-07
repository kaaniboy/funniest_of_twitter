const express = require('express');

const PORT = 8000;
const server = express();

server.listen(PORT, () => console.log(`Listening for YouTube redirect at http://localhost:${PORT}`));

server.get('/', (req, res) => {
    res.send('Hello World!');
});