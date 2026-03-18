import * as api from '@/api/api';

import {
  gamesLoadFailure,
  gamesLoadStart,
  gamesLoadSuccess,
} from '../actions/games';
import { Action } from '../hooks';

type GameIncoming = {
  display_name: string;
  thumbnail: string;
  icon: string;
  description: string;
  platform: string;
  game_folder: string;
};

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
      const gamesList = (await api.fetchGamesList()) as GameIncoming[];
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
