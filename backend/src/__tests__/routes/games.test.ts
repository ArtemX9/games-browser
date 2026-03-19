import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { faker } from '@faker-js/faker';

vi.mock('../../db', () => ({ getAllGames: vi.fn(), clearGames: vi.fn(), insertGame: vi.fn() }));
vi.mock('../../scanner', () => ({ scanGames: vi.fn() }));
vi.mock('fs-extra');

import { getAllGames, clearGames } from '../../db';
import { scanGames } from '../../scanner';
import fs from 'fs-extra';
import { Game } from '../../types';

import router from '../../routes/games';

const mockedGetAllGames = vi.mocked(getAllGames);
const mockedClearGames = vi.mocked(clearGames);
const mockedScanGames = vi.mocked(scanGames);
const mockedPathExists = vi.mocked(fs.pathExists);

const app = express();
app.use(express.json());
app.use('/api', router);

const makeGame = (overrides: Partial<Game> = {}): Game => ({
  id: faker.number.int({ min: 1 }),
  display_name: faker.commerce.productName(),
  thumbnail: faker.image.url(),
  icon: faker.image.url(),
  description: faker.lorem.sentence(),
  platform: faker.helpers.arrayElement(['PS 2', 'Win', 'Xbox 360']),
  game_folder: faker.system.fileName(),
  release_date: faker.date.past().getFullYear().toString(),
  genres: 'Action, RPG',
  igdb_platforms: 'PlayStation 2',
  ...overrides,
});

describe('GET /api/games', () => {
  it('returns the list of games as JSON', async () => {
    const games = [makeGame(), makeGame()];
    mockedGetAllGames.mockResolvedValue(games);

    const res = await request(app).get('/api/games');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(games);
    expect(mockedGetAllGames).toHaveBeenCalledTimes(1);
  });

  it('returns 500 when getAllGames throws', async () => {
    mockedGetAllGames.mockRejectedValue(new Error('DB failure'));

    const res = await request(app).get('/api/games');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to fetch games' });
  });

  it('returns empty array when no games exist', async () => {
    mockedGetAllGames.mockResolvedValue([]);

    const res = await request(app).get('/api/games');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/rescan', () => {
  it('calls clearGames and scanGames and returns status', async () => {
    mockedClearGames.mockResolvedValue();
    mockedScanGames.mockResolvedValue();

    const res = await request(app).get('/api/rescan');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'Rescan completed' });
    expect(mockedClearGames).toHaveBeenCalledTimes(1);
    expect(mockedScanGames).toHaveBeenCalledTimes(1);
  });
});

describe('GET /api/download/:platform/:gameFolder', () => {
  beforeEach(() => {
    mockedPathExists.mockReset();
  });

  it('returns 404 when game folder does not exist', async () => {
    mockedPathExists.mockResolvedValue(false as never);

    const res = await request(app).get('/api/download/PS 2/some_game');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Game folder not found' });
  });

  it('sets correct headers for a zip download', async () => {
    const gameFolder = 'some_game';
    mockedPathExists.mockResolvedValue(true as never);

    const res = await request(app).get(`/api/download/PS 2/${gameFolder}`).buffer(true);

    expect(res.headers['content-disposition']).toContain(`filename="${gameFolder}.zip"`);
    expect(res.headers['content-type']).toContain('application/zip');
  });
});
