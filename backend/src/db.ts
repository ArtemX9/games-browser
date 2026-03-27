// backend/src/db.ts
import { Database } from 'sqlite3';

import { Game } from './types';

const db = new Database('/app/games.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS games (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             display_name TEXT UNIQUE,
                                             thumbnail TEXT,
                                             icon TEXT,
                                             description TEXT,
                                             platform TEXT,
                                             game_folder TEXT,
                                             release_date TEXT,
                                             genres TEXT,
                                             igdb_platforms TEXT,
                                             manually_matched INTEGER DEFAULT 0
        )
    `);
    // Migration: add manually_matched column if it doesn't exist yet
    db.run(`ALTER TABLE games ADD COLUMN manually_matched INTEGER DEFAULT 0`, () => {
        // Ignore errors — column already exists in up-to-date DBs
    });
});

export const insertGame = (
    displayName: string,
    thumbnail: string,
    icon: string,
    description: string,
    platform: string,
    gameFolder: string,
    releaseDate: string = '',
    genres: string = '',
    igdbPlatforms: string = ''
) => {
    db.run(
        `INSERT OR REPLACE INTO games 
     (display_name, thumbnail, icon, description, platform, game_folder, release_date, genres, igdb_platforms)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [displayName, thumbnail, icon, description, platform, gameFolder, releaseDate, genres, igdbPlatforms]
    );
};

export const updateGame = (
    gameFolder: string,
    platform: string,
    displayName: string,
    thumbnail: string,
    description: string,
    releaseDate: string,
    genres: string,
    igdbPlatforms: string
): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE games SET display_name=?, thumbnail=?, description=?, release_date=?, genres=?, igdb_platforms=?, manually_matched=1
             WHERE game_folder=? AND platform=?`,
            [displayName, thumbnail, description, releaseDate, genres, igdbPlatforms, gameFolder, platform],
            (err) => {
                if (err) reject(err);
                else resolve();
            }
        );
    });
};

export const getGameByPath = (platform: string, gameFolder: string): Promise<Game | null> => {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM games WHERE platform=? AND game_folder=?',
            [platform, gameFolder],
            (err, row) => {
                if (err) reject(err);
                else resolve((row as Game) ?? null);
            }
        );
    });
};

export const deleteOrphanedGames = (validPaths: Array<{ platform: string; gameFolder: string }>): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (validPaths.length === 0) {
            // No valid paths means all games are orphaned — clear everything
            db.run('DELETE FROM games', (err) => {
                if (err) reject(err);
                else resolve();
            });
            return;
        }
        const placeholders = validPaths.map(() => '(?,?)').join(',');
        const params = validPaths.flatMap(({ platform, gameFolder }) => [platform, gameFolder]);
        db.run(
            `DELETE FROM games WHERE (platform, game_folder) NOT IN (${placeholders})`,
            params,
            (err) => {
                if (err) reject(err);
                else resolve();
            }
        );
    });
};

export const clearGames = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM games', (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

export const getAllGames = (): Promise<Game[]> => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM games ORDER BY platform, display_name', (err, rows) => {
            if (err) reject(err);
            else resolve(rows as Game[]);
        });
    });
};