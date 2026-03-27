import fs from 'fs-extra';
import path from 'path';
import { deleteOrphanedGames, getGameByPath, insertGame } from './db';
import { searchGame } from './igdb';

const GAMES_ROOT = '/games';

export const scanGames = async () => {
    try {
        const platforms = await fs.readdir(GAMES_ROOT);

        const validPaths: Array<{ platform: string; gameFolder: string }> = [];

        // First pass: collect all valid (platform, gameFolder) pairs from the filesystem
        for (const platform of platforms) {
            const platformPath = path.join(GAMES_ROOT, platform);
            const stat = await fs.stat(platformPath);
            if (!stat.isDirectory()) continue;

            const gameFolders = await fs.readdir(platformPath);
            for (const gameFolder of gameFolders) {
                const gamePath = path.join(platformPath, gameFolder);
                if (!(await fs.stat(gamePath)).isDirectory()) continue;
                validPaths.push({ platform, gameFolder });
            }
        }

        // Remove DB entries whose folders no longer exist on disk
        await deleteOrphanedGames(validPaths);

        // Second pass: insert new games or refresh auto-matched ones
        for (const { platform, gameFolder } of validPaths) {
            const gamePath = path.join(GAMES_ROOT, platform, gameFolder);

            const thumbnailPath = path.join(gamePath, 'thumbnail.png');
            const iconPath = path.join(gamePath, 'icon.png');
            const descriptionPath = path.join(gamePath, 'description.txt');

            const localThumbnail = `/media/${platform}/${gameFolder}/thumbnail.png`;
            const localIcon = `/media/${platform}/${gameFolder}/icon.png`;
            let localDescription = '';

            const hasLocalFiles = await Promise.all([
                fs.pathExists(thumbnailPath),
                fs.pathExists(iconPath),
                fs.pathExists(descriptionPath),
            ]);

            if (hasLocalFiles.every(Boolean)) {
                localDescription = (await fs.readFile(descriptionPath, 'utf-8')).trim();
            } else {
                console.log(`Skipping local files for ${gameFolder} - incomplete`);
            }

            const existing = await getGameByPath(platform, gameFolder);

            // Preserve manually matched games — only update local file fields (icon)
            if (existing?.manually_matched) {
                const icon = hasLocalFiles[1] ? localIcon : existing.icon;
                if (icon !== existing.icon) {
                    insertGame(
                        existing.display_name,
                        existing.thumbnail,
                        icon,
                        existing.description,
                        platform,
                        gameFolder,
                        existing.release_date,
                        existing.genres,
                        existing.igdb_platforms
                    );
                }
                console.log(`Preserved (manually matched): ${existing.display_name}`);
                continue;
            }

            // Clean folder name for IGDB search (remove underscores, regions, etc.)
            const searchQuery = gameFolder.replace(/[_-]/g, ' ').replace(/\s*\(.*\)\s*/g, '').trim();

            const igdbData = await searchGame(searchQuery, platform);

            const displayName = igdbData?.name || `${platform} — ${gameFolder}`;
            const thumbnail = igdbData?.thumbnail || (hasLocalFiles[0] ? localThumbnail : '');
            const icon = hasLocalFiles[1] ? localIcon : '';
            const description = igdbData?.description || localDescription;

            insertGame(
                displayName,
                thumbnail,
                icon,
                description,
                platform,
                gameFolder,
                igdbData?.releaseDate || '',
                igdbData?.genres || '',
                igdbData?.platforms || ''
            );

            console.log(`Added/Updated: ${displayName} (IGDB: ${!!igdbData})`);
        }

        console.log('Games scan completed');
    } catch (err) {
        console.error('Scan error:', err);
    }
};