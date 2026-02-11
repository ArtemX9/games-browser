import express from 'express';
import { scanGames } from './scanner';
import { getAllGames } from './db';

import dotenv from 'dotenv';

dotenv.config({ path: '/app/.env' });

const app = express();
const PORT = 3001;

app.use('/media', express.static('/games')); // Serve local images

app.get('/api/games', async (req, res) => {
    try {
        const games = await getAllGames();
        res.json(games);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch games' });
    }
});

app.get('/api/rescan', async (req, res) => {
    await scanGames();
    res.json({ status: 'Rescan completed' });
});

scanGames().then(() => {
    app.listen(PORT, () => console.log(`BE running on port ${PORT} for your UGREEN NASync DXP4800 PLUS`));
});