import dotenv from 'dotenv';
dotenv.config();

export const env = {
    botToken: process.env.BOT_TOKEN || '',
    coreApiUrl: process.env.CORE_API_URL || 'http://localhost:3000',
};

if(!env.botToken) {
    throw new Error('BOT_TOKEN is not set in .env');
}

