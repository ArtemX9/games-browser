import { beforeEach, describe, expect, it, vi } from 'vitest';
import { faker } from '@faker-js/faker';

vi.mock('fs-extra');
vi.mock('../db', () => ({ insertGame: vi.fn(), clearGames: vi.fn(), getAllGames: vi.fn() }));
vi.mock('../igdb', () => ({ searchGame: vi.fn() }));

import fs from 'fs-extra';
import { clearGames, insertGame } from '../db';
import { searchGame } from '../igdb';
import { scanGames } from '../scanner';
import { IgdbGameData } from '../types';

const mockedReaddir = vi.mocked(fs.readdir);
const mockedStat = vi.mocked(fs.stat);
const mockedPathExists = vi.mocked(fs.pathExists);
const mockedReadFile = vi.mocked(fs.readFile);
const mockedInsertGame = vi.mocked(insertGame);
const mockedSearchGame = vi.mocked(searchGame);

const makeIgdbData = (overrides: Partial<IgdbGameData> = {}): IgdbGameData => ({
  name: faker.commerce.productName(),
  description: faker.lorem.paragraph(),
  thumbnail: faker.image.url(),
  releaseDate: faker.date.past().getFullYear().toString(),
  genres: 'Action, RPG',
  platforms: 'PlayStation 2',
  ...overrides,
});

const platform = 'PS 2';
const gameFolder = 'some_game';
const dirStat = { isDirectory: () => true } as never;

describe('scanGames', () => {
  beforeEach(() => {
    mockedReaddir.mockResolvedValueOnce([platform] as never).mockResolvedValueOnce([gameFolder] as never);
    mockedStat.mockResolvedValue(dirStat);
    mockedPathExists.mockResolvedValue(true as never);
    mockedReadFile.mockResolvedValue('Local description' as never);
  });

  it('calls insertGame with IGDB data when available', async () => {
    const igdbData = makeIgdbData();
    mockedSearchGame.mockResolvedValue(igdbData);

    await scanGames();

    expect(mockedSearchGame).toHaveBeenCalledWith('some game', platform);
    expect(mockedInsertGame).toHaveBeenCalledWith(
      igdbData.name,
      igdbData.thumbnail,
      expect.stringContaining(gameFolder),
      igdbData.description,
      platform,
      gameFolder,
      igdbData.releaseDate,
      igdbData.genres,
      igdbData.platforms,
    );
  });

  it('falls back to local files when IGDB returns null', async () => {
    mockedSearchGame.mockResolvedValue(null);

    await scanGames();

    expect(mockedInsertGame).toHaveBeenCalledWith(
      `${platform} — ${gameFolder}`,
      `/media/${platform}/${gameFolder}/thumbnail.png`,
      `/media/${platform}/${gameFolder}/icon.png`,
      'Local description',
      platform,
      gameFolder,
      '',
      '',
      '',
    );
  });

  it('skips non-directory entries in platform folder', async () => {
    mockedReaddir.mockReset().mockResolvedValueOnce([platform] as never).mockResolvedValueOnce(['file.txt', gameFolder] as never);

    let statCallCount = 0;
    mockedStat.mockImplementation(async () => {
      statCallCount++;
      return { isDirectory: () => statCallCount !== 2 } as never;
    });

    mockedSearchGame.mockResolvedValue(null);

    await scanGames();

    expect(mockedInsertGame).toHaveBeenCalledTimes(1);
  });

  it('does not throw on scan error', async () => {
    mockedReaddir.mockReset().mockRejectedValueOnce(new Error('Permission denied'));
    await expect(scanGames()).resolves.not.toThrow();
  });

  it('uses empty thumbnail and description when local files are absent and no IGDB data', async () => {
    mockedPathExists.mockResolvedValue(false as never);
    mockedSearchGame.mockResolvedValue(null);

    await scanGames();

    expect(mockedInsertGame).toHaveBeenCalledWith(expect.any(String), '', '', '', platform, gameFolder, '', '', '');
  });

  it('prefers IGDB thumbnail over local when both present', async () => {
    const igdbData = makeIgdbData({ thumbnail: 'https://igdb.example.com/cover.jpg' });
    mockedSearchGame.mockResolvedValue(igdbData);

    await scanGames();

    expect(mockedInsertGame.mock.calls[0][1]).toBe(igdbData.thumbnail);
  });

  it('does not call clearGames', async () => {
    mockedSearchGame.mockResolvedValue(null);
    await scanGames();
    expect(clearGames).not.toHaveBeenCalled();
  });
});
