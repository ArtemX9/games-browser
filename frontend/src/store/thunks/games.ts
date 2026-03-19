import * as api from '@/api/api';
import { ApiGame } from '@/api/types';

import {
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
