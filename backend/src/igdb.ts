// backend/src/igdb.ts
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '/app/.env' }); // Load from container root if mounted

const CLIENT_ID = process.env.IGDB_CLIENT_ID;
const CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('IGDB credentials missing. Set IGDB_CLIENT_ID and IGDB_CLIENT_SECRET in .env');
}

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
    if (accessToken && Date.now() < tokenExpiry) return accessToken;

    try {
        const res = await axios.post(
            'https://id.twitch.tv/oauth2/token',
            null,
            {
                params: {
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    grant_type: 'client_credentials',
                },
            }
        );

        accessToken = res.data.access_token;
        tokenExpiry = Date.now() + res.data.expires_in * 1000 - 60000; // Refresh early
        console.log('IGDB token refreshed');
        if (!accessToken) {
            throw new Error('IGDB token could not be refreshed')
        }
        return accessToken;
    } catch (err) {
        console.error('IGDB token error:', err);
        throw err;
    }
}

export async function searchGame(query: string): Promise<any | null> {
    if (!CLIENT_ID || !CLIENT_SECRET) return null;

    const token = await getAccessToken();

    try {
        const res = await axios.post(
            'https://api.igdb.com/v4/games',
            `search "${query}"; fields id,name,summary,release_dates.human,cover.image_id,genres.name,platforms.name; limit 5;`,
            {
                headers: {
                    'Client-ID': CLIENT_ID!,
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'text/plain',
                },
            }
        );

        if (res.data.length === 0) {
            console.log(`No IGDB match for "${query}"`);
            return null;
        }

        const game = res.data[0]; // Best match

        let thumbnail = null;
        if (game.cover?.image_id) {
            thumbnail = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`;
        }

        return {
            name: game.name,
            description: game.summary || 'No description available.',
            thumbnail,
            releaseDate: game.release_dates?.[0]?.human || '',
            genres: game.genres?.map((g: any) => g.name).join(', ') || '',
            platforms: game.platforms?.map((p: any) => p.name).join(', ') || '',
        };
    } catch (err) {
        console.error(`IGDB search error for "${query}":`, err);
        return null;
    }
}