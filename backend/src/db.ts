// backend/src/db.ts
import { prisma } from './lib/prisma';
import { Game } from './types';

export const insertGame = async (
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
  await prisma.games.upsert({
    where: {
      display_name: displayName
    },
    update: {
      thumbnail,
      icon,
      description,
      platform,
      game_folder: gameFolder,
      release_date: releaseDate,
      genres,
      igdb_platforms: igdbPlatforms,
    },
    create: {
      display_name: displayName,
      thumbnail,
      icon,
      description,
      platform,
      game_folder: gameFolder,
      release_date: releaseDate,
      genres,
      igdb_platforms: igdbPlatforms,
    }
  })
};

export const updateGame = async (
    gameFolder: string,
    platform: string,
    displayName: string,
    thumbnail: string,
    description: string,
    releaseDate: string,
    genres: string,
    igdbPlatforms: string
): Promise<void> => {
  await prisma.games.update({
    where: {
      game_folder_platform: {
        game_folder: gameFolder,
        platform,
      },
    },
    data: {
      display_name: displayName,
      thumbnail,
      description,
      release_date: releaseDate,
      genres,
      igdb_platforms: igdbPlatforms,
      manually_matched: true,
    },
  });
};

export const getGameByPath = async (platform: string, gameFolder: string): Promise<Game | null> => {
  return prisma.games.findUnique({
    where: {
      game_folder_platform: {
        platform,
        game_folder: gameFolder
      }
    }
  })
};

export const deleteOrphanedGames = async (validPaths: Array<{ platform: string; gameFolder: string }>): Promise<void> => {
  if (validPaths.length === 0) {
    await prisma.games.deleteMany();
    return;
  }

  await prisma.games.deleteMany({
    where: {
      NOT: {
        OR: validPaths.map(({ platform, gameFolder }) => ({
          platform,
          game_folder: gameFolder,
        })),
      },
    },
  });
};

export const clearGames = async (): Promise<void> => {
  await prisma.games.deleteMany();
};

export const getAllGames = async (): Promise<Game[]> => {
  return prisma.games.findMany({
    orderBy: {
      platform: 'asc',
      display_name: 'asc',
    }
  });
};
