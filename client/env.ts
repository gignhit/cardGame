require('dotenv').config();
const TOKEN = process.env.DISCORD_TOKEN ?? '';
const CLIENT_ID = process.env.CLIENT_ID ?? '';

export {TOKEN, CLIENT_ID};
