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
                                             igdb_platforms TEXT
        )
    `);
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
            `UPDATE games SET display_name=?, thumbnail=?, description=?, release_date=?, genres=?, igdb_platforms=?
             WHERE game_folder=? AND platform=?`,
            [displayName, thumbnail, description, releaseDate, genres, igdbPlatforms, gameFolder, platform],
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