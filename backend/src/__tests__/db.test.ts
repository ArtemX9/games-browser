import { beforeEach, describe, expect, it, vi } from 'vitest';
import { faker } from '@faker-js/faker';

import { Game } from '../types';

const mockUpsert = vi.hoisted(() => vi.fn());
const mockDeleteMany = vi.hoisted(() => vi.fn());
const mockFindMany = vi.hoisted(() => vi.fn());

vi.mock('../lib/prisma', () => ({
  prisma: {
    games: {
      upsert: mockUpsert,
      deleteMany: mockDeleteMany,
      findMany: mockFindMany,
    },
  },
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
  manually_matched: false,
  ...overrides,
});

describe('db', () => {
  beforeEach(() => {
    mockUpsert.mockReset();
    mockDeleteMany.mockReset();
    mockFindMany.mockReset();
  });

  describe('insertGame', () => {
    it('calls prisma.games.upsert with correct args', async () => {
      const game = makeGame();
      mockUpsert.mockResolvedValueOnce(game);

      await insertGame(
        game.display_name!,
        game.thumbnail!,
        game.icon!,
        game.description!,
        game.platform!,
        game.game_folder!,
        game.release_date!,
        game.genres!,
        game.igdb_platforms!,
      );

      expect(mockUpsert).toHaveBeenCalledWith({
        where: { display_name: game.display_name },
        update: {
          thumbnail: game.thumbnail,
          icon: game.icon,
          description: game.description,
          platform: game.platform,
          game_folder: game.game_folder,
          release_date: game.release_date,
          genres: game.genres,
          igdb_platforms: game.igdb_platforms,
        },
        create: {
          display_name: game.display_name,
          thumbnail: game.thumbnail,
          icon: game.icon,
          description: game.description,
          platform: game.platform,
          game_folder: game.game_folder,
          release_date: game.release_date,
          genres: game.genres,
          igdb_platforms: game.igdb_platforms,
        },
      });
    });

    it('uses empty strings for optional params when not provided', async () => {
      const game = makeGame();
      mockUpsert.mockResolvedValueOnce(game);

      await insertGame(game.display_name!, game.thumbnail!, game.icon!, game.description!, game.platform!, game.game_folder!);

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ release_date: '', genres: '', igdb_platforms: '' }),
        }),
      );
    });
  });

  describe('clearGames', () => {
    it('resolves when prisma.games.deleteMany succeeds', async () => {
      mockDeleteMany.mockResolvedValueOnce({ count: 0 });
      await expect(clearGames()).resolves.toBeUndefined();
      expect(mockDeleteMany).toHaveBeenCalledWith();
    });

    it('rejects when prisma.games.deleteMany throws', async () => {
      const error = new Error('DB error');
      mockDeleteMany.mockRejectedValueOnce(error);
      await expect(clearGames()).rejects.toThrow('DB error');
    });
  });

  describe('getAllGames', () => {
    it('resolves with rows from prisma.games.findMany', async () => {
      const games = [makeGame(), makeGame()];
      mockFindMany.mockResolvedValueOnce(games);

      await expect(getAllGames()).resolves.toEqual(games);
      expect(mockFindMany).toHaveBeenCalledWith({
        orderBy: { platform: 'asc', display_name: 'asc' },
      });
    });

    it('rejects when prisma.games.findMany throws', async () => {
      const error = new Error('DB read error');
      mockFindMany.mockRejectedValueOnce(error);
      await expect(getAllGames()).rejects.toThrow('DB read error');
    });
  });
});