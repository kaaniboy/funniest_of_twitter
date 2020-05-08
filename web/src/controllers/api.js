import axios from 'axios';

const CLIPS_ENDPOINT = 'http://localhost:9000/clips/';
const UPLOAD_ENDPOINT = 'http://localhost:9000/upload';

export async function uploadToYouTube() {
    try {
        await axios.post(UPLOAD_ENDPOINT);
    } catch (error) {
        console.log('Error finalizing and uploading: ');
        console.log(error);
    }
}

export async function downloadClips(accounts) {
    try {
        await axios.post(CLIPS_ENDPOINT, { accounts });
    } catch (error) {
        console.log('Error downloading clips: ');
        console.log(error);
    }
}

export async function getClips() {
    try {
        const res = await axios.get(CLIPS_ENDPOINT);
        return res.data.clips;
    } catch(error) {
        console.log('Error getting clips: ');
        console.log(error);
        return [];
    }
}

export async function deleteClip(file_name) {
    try {
        await axios.delete(`${CLIPS_ENDPOINT}${file_name}`);
    } catch (error) {
        console.log('Erorr deleting clip: ');
        console.log(error);
    }
}