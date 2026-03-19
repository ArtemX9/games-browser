import { beforeEach, describe, expect, it, vi } from 'vitest';
import { faker } from '@faker-js/faker';

import { Game } from '../types';

const mockRun = vi.hoisted(() => vi.fn());
const mockAll = vi.hoisted(() => vi.fn());
const mockSerialize = vi.hoisted(() => vi.fn((cb: (() => void) | undefined) => cb && cb()));

vi.mock('sqlite3', () => ({
  Database: vi.fn(function (this: Record<string, unknown>) {
    this.run = mockRun;
    this.all = mockAll;
    this.serialize = mockSerialize;
  }),
}));

import { clearGames, getAllGames, insertGame } from '../db';

const makeGame = (overrides: Partial<Game> = {}): Game => ({
  id: faker.number.int(),
  display_name: faker.commerce.productName(),
  thumbnail: faker.image.url(),
  icon: faker.image.url(),
  description: faker.lorem.sentence(),
  platform: faker.helpers.arrayElement(['PS 2', 'Win', 'Xbox 360']),
  game_folder: faker.system.fileName(),
  release_date: faker.date.past().getFullYear().toString(),
  genres: faker.helpers.arrayElements(['Action', 'RPG', 'Adventure']).join(', '),
  igdb_platforms: faker.helpers.arrayElement(['PlayStation 2', 'PC (Microsoft Windows)']),
  ...overrides,
});

describe('db', () => {
  beforeEach(() => {
    mockRun.mockReset();
    mockAll.mockReset();
  });

  describe('insertGame', () => {
    it('calls db.run with correct SQL and params', () => {
      const game = makeGame();
      insertGame(
        game.display_name,
        game.thumbnail,
        game.icon,
        game.description,
        game.platform,
        game.game_folder,
        game.release_date,
        game.genres,
        game.igdb_platforms,
      );
      expect(mockRun).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO games'),
        [
          game.display_name,
          game.thumbnail,
          game.icon,
          game.description,
          game.platform,
          game.game_folder,
          game.release_date,
          game.genres,
          game.igdb_platforms,
        ],
      );
    });

    it('uses empty strings for optional params when not provided', () => {
      const game = makeGame();
      insertGame(game.display_name, game.thumbnail, game.icon, game.description, game.platform, game.game_folder);
      expect(mockRun).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO games'),
        [game.display_name, game.thumbnail, game.icon, game.description, game.platform, game.game_folder, '', '', ''],
      );
    });
  });

  describe('clearGames', () => {
    it('resolves when db.run succeeds', async () => {
      mockRun.mockImplementationOnce((_sql: string, callback: (err: Error | null) => void) => {
        callback(null);
      });
      await expect(clearGames()).resolves.toBeUndefined();
      expect(mockRun).toHaveBeenCalledWith('DELETE FROM games', expect.any(Function));
    });

    it('rejects when db.run errors', async () => {
      const error = new Error('DB error');
      mockRun.mockImplementationOnce((_sql: string, callback: (err: Error | null) => void) => {
        callback(error);
      });
      await expect(clearGames()).rejects.toThrow('DB error');
    });
  });

  describe('getAllGames', () => {
    it('resolves with rows from db.all', async () => {
      const games = [makeGame(), makeGame()];
      mockAll.mockImplementationOnce((_sql: string, callback: (err: Error | null, rows: Game[]) => void) => {
        callback(null, games);
      });
      await expect(getAllGames()).resolves.toEqual(games);
      expect(mockAll).toHaveBeenCalledWith(
        'SELECT * FROM games ORDER BY platform, display_name',
        expect.any(Function),
      );
    });

    it('rejects when db.all errors', async () => {
      const error = new Error('DB read error');
      mockAll.mockImplementationOnce((_sql: string, callback: (err: Error | null, rows: Game[]) => void) => {
        callback(error, []);
      });
      await expect(getAllGames()).rejects.toThrow('DB read error');
    });
  });
});
