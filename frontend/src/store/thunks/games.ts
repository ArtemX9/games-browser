import * as api from '@/api/api';
import { ApiGame, IgdbSearchResult } from '@/api/types';

import {
  gameUpdateSuccess,
  gamesLoadFailure,
  gamesLoadStart,
  gamesLoadSuccess,
} from '../actions/games';
import { Action } from '../hooks';

interface IFetchGames {
  offset: number;
  limit: number;
}

export const fetchGamesList =
  ({ offset, limit }: IFetchGames): Action =>
  async (dispatch) => {
    dispatch(
      gamesLoadStart({
        offset,
        limit,
      }),
    );
    try {
      const gamesList = (await api.fetchGamesList()) as ApiGame[];
      dispatch(
        gamesLoadSuccess({
          games: gamesList.map((game) => ({
            id: game.id,
            displayName: game.display_name,
            thumbnail: game.thumbnail,
            icon: game.icon,
            description: game.description,
            platform: game.platform,
            gameFolder: game.game_folder,
          })),
        }),
      );
    } catch (e: unknown) {
      dispatch(gamesLoadFailure({ error: String(e) }));
    }
  };

interface IUpdateGame {
  platform: string;
  gameFolder: string;
  selected: IgdbSearchResult;
}

export const updateGameData =
  ({ platform, gameFolder, selected }: IUpdateGame): Action =>
  async (dispatch) => {
    const displayName = selected.name;
    await api.updateGame(platform, gameFolder, {
      displayName,
      thumbnail: selected.thumbnail ?? '',
      description: selected.description,
      releaseDate: selected.releaseDate,
      genres: selected.genres,
      igdbPlatforms: selected.platforms,
    });
    dispatch(
      gameUpdateSuccess({
        gameFolder,
        platform,
        displayName,
        thumbnail: selected.thumbnail ?? '',
        description: selected.description,
      }),
    );
  };
