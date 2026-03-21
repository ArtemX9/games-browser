import dotenv from 'dotenv';

import express from 'express';

import { scanGames } from './scanner';
import gamesRouter from './routes/games';

dotenv.config({ path: '/app/.env' });

const app = express();
const PORT = 3001;

app.use(express.json());
app.use('/media', express.static('/games'));
app.use('/api', gamesRouter);

scanGames().then(() => {
    app.listen(PORT, () => console.log(`BE running on port ${PORT} for your UGREEN NASync DXP4800 PLUS`));
});