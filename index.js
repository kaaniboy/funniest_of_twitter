require('dotenv').config();
const { getVideoTweets } = require('./twitter_utils');

(async () => {
    const tweets = await getVideoTweets('TheWorldOfFunny');
    console.log(tweets);
})();