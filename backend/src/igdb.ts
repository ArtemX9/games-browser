import 'dotenv/config';

import { IgdbGameData } from './types';

const CLIENT_ID = process.env.IGDB_CLIENT_ID;
const CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('IGDB credentials missing. Set IGDB_CLIENT_ID and IGDB_CLIENT_SECRET in .env');
}

let accessToken: string | null = null;
let tokenExpiry: number = 0;

const PLATFORM_TO_IGDB_ID: Record<string, number> = {
  'PS': 7,
  'PS 2': 8,
  'PS 3': 9,
  'PSP': 38,
  'PS Vita': 46,
  'Xbox': 11,
  'Xbox 360': 12,
  'Win': 6,
  'Mac': 14
};
const API_IGDB = 'https://api.igdb.com/v4';
const IMAGES_IGDB = 'https://images.igdb.com';
const ID_TWITCH = 'https://id.twitch.tv';

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  try {
    const res = await fetch(`${ID_TWITCH}/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`, { method: 'POST' });
    const data = await res.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000 - 60000; // Refresh early

    console.log('IGDB token refreshed');
    if (!accessToken) {
      throw new Error('IGDB token could not be refreshed');
    }
    return accessToken;
  } catch (err) {
    console.error('IGDB token error:', err);
    throw err;
  }
}

function mapGameData(game: {
  name: string;
  summary?: string;
  cover?: {
    image_id: string
  };
  release_dates?: {
    human: string
  }[];
  genres?: {
    name: string
  }[];
  platforms?: {
    name: string
  }[]
}): IgdbGameData {
  const thumbnail = game.cover?.image_id ? `${IMAGES_IGDB}/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg` : null;
  return {
    name: game.name,
    description: game.summary || 'No description available.',
    thumbnail,
    releaseDate: game.release_dates?.[0]?.human || '',
    genres: game.genres?.map((g) => g.name).join(', ') || '',
    platforms: game.platforms?.map((p) => p.name).join(', ') || ''
  };
}

export async function searchGames(query: string, platform: string): Promise<IgdbGameData[]> {
  if (!CLIENT_ID || !CLIENT_SECRET) return [];

  const token = await getAccessToken();
  const platformID = PLATFORM_TO_IGDB_ID[platform];
  const whereClause = platformID ? `where platforms = (${platformID}); ` : '';

  try {
    const res = await fetch(`${API_IGDB}/games`, {
      method: 'POST',
      body: `search "${query}"; fields id,name,summary,release_dates.human,cover.image_id,genres.name,platforms.name; ${whereClause}limit 10;`,
      headers: {
        'Client-ID': CLIENT_ID!,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'text/plain'
      }
    });
    const data = await res.json();

    return data.map(mapGameData);
  } catch (err) {
    console.error(`IGDB search error for "${query}":`, err);
    return [];
  }
}

export async function searchGame(query: string, platform: string): Promise<IgdbGameData | null> {
  if (!CLIENT_ID || !CLIENT_SECRET) return null;

  const token = await getAccessToken();
  const platformID = PLATFORM_TO_IGDB_ID[platform];


  try {
    const res = await fetch(`${API_IGDB}/games`, {
      method: 'POST',
      body: `search "${query}"; fields id,name,summary,release_dates.human,cover.image_id,genres.name,platforms.name; where platforms = (${platformID}); limit 5;`,
      headers: {
        'Client-ID': CLIENT_ID!,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'text/plain'
      }
    });

    const data = await res.json();

    if (data.length === 0) {
      console.log(`No IGDB match for "${query}" and platform "${platform}"`);
      return null;
    }

    return mapGameData(data[0]);
  } catch (err) {
    console.error(`IGDB search error for "${query}":`, err);
    return null;
  }
}
