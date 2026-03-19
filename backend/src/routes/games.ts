import path from 'path';

import archiver from 'archiver';
import { Router } from 'express';
import fs from 'fs-extra';

import { clearGames, getAllGames } from '../db';
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
    await clearGames();
    await scanGames();
    res.json({ status: 'Rescan completed' });
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
