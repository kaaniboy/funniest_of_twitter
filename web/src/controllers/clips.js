import axios from 'axios';

const CLIPS_ENDPOINT = 'http://localhost:9000/clips/';

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
        console.log('DELETE!');
        await axios.delete(`${CLIPS_ENDPOINT}${file_name}`);
    } catch (error) {
        console.log('Erorr deleting clip: ');
        console.log(error);
    }
}