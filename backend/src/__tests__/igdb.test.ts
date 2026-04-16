import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { faker } from '@faker-js/faker';

import { IgdbGameData } from '../types';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);
vi.mock('dotenv/config', () => ({}));

const TOKEN_RESPONSE = { access_token: 'test-token', expires_in: 3600 };

const makeResponse = (data: unknown) => ({ json: () => Promise.resolve(data) });

const makeIgdbGame = () => ({
  id: faker.number.int(),
  name: faker.commerce.productName(),
  summary: faker.lorem.paragraph(),
  cover: { image_id: faker.string.alphanumeric(10) },
  release_dates: [{ human: faker.date.past().getFullYear().toString() }],
  genres: [{ name: 'Action' }, { name: 'RPG' }],
  platforms: [{ name: 'PlayStation 2' }],
});

const setupSearchMock = (gamesData: object[]) => {
  mockFetch.mockImplementation(async (url: string) => {
    if (url.includes('twitch.tv')) return makeResponse(TOKEN_RESPONSE);
    return makeResponse(gamesData);
  });
};

describe('searchGame', () => {
  let searchGame: (q: string, platform: string) => Promise<IgdbGameData | null>;

  beforeEach(async () => {
    mockFetch.mockReset();
    vi.resetModules();
    process.env.IGDB_CLIENT_ID = 'test-client-id';
    process.env.IGDB_CLIENT_SECRET = 'test-client-secret';
    ({ searchGame } = await import('../igdb'));
  });

  afterEach(() => {
    delete process.env.IGDB_CLIENT_ID;
    delete process.env.IGDB_CLIENT_SECRET;
  });

  it('returns null when credentials are missing', async () => {
    vi.resetModules();
    delete process.env.IGDB_CLIENT_ID;
    delete process.env.IGDB_CLIENT_SECRET;
    const { searchGame: sgNoCredentials } = await import('../igdb');
    await expect(sgNoCredentials('Test Game', 'PS 2')).resolves.toBeNull();
  });

  it('returns mapped game data on successful IGDB response', async () => {
    const igdbGame = makeIgdbGame();
    setupSearchMock([igdbGame]);

    const result = await searchGame('Test Game', 'PS 2');

    expect(result).toEqual({
      name: igdbGame.name,
      description: igdbGame.summary,
      thumbnail: `https://images.igdb.com/igdb/image/upload/t_cover_big/${igdbGame.cover.image_id}.jpg`,
      releaseDate: igdbGame.release_dates[0].human,
      genres: 'Action, RPG',
      platforms: 'PlayStation 2',
    });
  });

  it('returns null when no games found', async () => {
    setupSearchMock([]);
    await expect(searchGame('Unknown Game', 'PS 2')).resolves.toBeNull();
  });

  it('returns null on IGDB API error', async () => {
    mockFetch
      .mockResolvedValueOnce(makeResponse(TOKEN_RESPONSE))
      .mockRejectedValueOnce(new Error('Network error'));
    await expect(searchGame('Test Game', 'Win')).resolves.toBeNull();
  });

  it('uses fallback description when summary is missing', async () => {
    setupSearchMock([{ ...makeIgdbGame(), summary: undefined }]);
    const result = await searchGame('Test Game', 'PS 2');
    expect(result?.description).toBe('No description available.');
  });

  it('returns null thumbnail when cover is missing', async () => {
    setupSearchMock([{ ...makeIgdbGame(), cover: undefined }]);
    const result = await searchGame('Test Game', 'PS 2');
    expect(result?.thumbnail).toBeNull();
  });
});