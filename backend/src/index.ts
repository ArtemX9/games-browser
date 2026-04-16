import dotenv from 'dotenv';

import express from 'express';

import { scanGames } from './scanner';
import gamesRouter from './routes/games';
import { connectDB } from './lib/prisma';

const env = process.env.NODE_ENV || 'development';
switch (env) {
  case 'development':
    dotenv.config({ path: '.env' });
    break;
  case 'production':
    dotenv.config({ path: '/app/.env' });
    break;
  default:
    throw new Error(`Unknown environment: ${env}`);
}


const app = express();
const PORT = 3001;

app.use(express.json());
app.use('/media', express.static('/games'));
app.use('/api', gamesRouter);

connectDB().then(() => {
  return scanGames();
})
  .then(() => {
    app.listen(PORT, () => console.log(`BE running on port ${PORT} for your UGREEN NASync DXP4800 PLUS`));
  }).catch(err => console.error(err));
