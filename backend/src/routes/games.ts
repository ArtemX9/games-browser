import path from 'path';

import archiver from 'archiver';
import { Router } from 'express';
import fs from 'fs-extra';

import { getAllGames, updateGame } from '../db';
import { searchGames } from '../igdb';
import { scanGames } from '../scanner';

const GAMES_ROOT = '/games';

const router = Router();

router.get('/games', async (req, res) => {
    try {
        const games = await getAllGames();
        res.json(games);
    } catch (_err) {
        res.status(500).json({ error: 'Failed to fetch games' });
    }
});

router.get('/rescan', async (req, res) => {
    try {
        await scanGames();
        res.json({ status: 'Rescan completed' });
    } catch (err) {
        res.status(500).json({ error: `Failed to rescan games ${err}` });
    }
});

router.get('/igdb-search', async (req, res) => {
    const { query, platform } = req.query as { query: string; platform: string };
    if (!query || !platform) {
        res.status(400).json({ error: 'query and platform are required' });
        return;
    }
    try {
        const results = await searchGames(query, platform);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: `Failed to fetch games from IDGB ${err}` });
    }

});

router.patch('/games/:platform/:gameFolder', async (req, res) => {
    const { platform, gameFolder } = req.params;
    const { displayName, thumbnail, description, releaseDate, genres, igdbPlatforms } = req.body as {
        displayName: string;
        thumbnail: string;
        description: string;
        releaseDate: string;
        genres: string;
        igdbPlatforms: string;
    };
    try {
        await updateGame(gameFolder, platform, displayName, thumbnail, description, releaseDate, genres, igdbPlatforms);
        res.json({ status: 'ok' });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to update game' });
    }
});

router.get('/download/:platform/:gameFolder', async (req, res) => {
    const { platform, gameFolder } = req.params;
    const gamePath = path.join(GAMES_ROOT, platform, gameFolder);

    if (!(await fs.pathExists(gamePath))) {
        res.status(404).json({ error: 'Game folder not found' });
        return;
    }

    const zipName = `${gameFolder}.zip`;
    res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);
    res.setHeader('Content-Type', 'application/zip');

    const archive = archiver('zip', { zlib: { level: 0 } });
    archive.on('error', (err) => res.destroy(err));
    archive.pipe(res);
    archive.directory(gamePath, gameFolder);
    await archive.finalize();
});

export default router;
