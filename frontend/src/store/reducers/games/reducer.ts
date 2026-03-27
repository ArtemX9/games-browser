import {
  GAMES_LOAD_FAILURE,
  GAMES_LOAD_START,
  GAMES_LOAD_SUCCESS,
  GAME_UPDATE_SUCCESS,
  gameUpdateSuccess,
  gamesLoadFailure,
  gamesLoadStart,
  gamesLoadSuccess,
} from '@/store/actions/games';
import { Game } from '@/store/reducers/games/types';

export interface IGamesReducer {
  games: Game[] | null;
  isLoading: boolean | null;
  isError: boolean | null;
}

const defaultAppState: IGamesReducer = {
  games: null,
  isLoading: null,
  isError: null,
};

type GamesActionTypes =
  | ReturnType<typeof gamesLoadStart>
  | ReturnType<typeof gamesLoadSuccess>
  | ReturnType<typeof gamesLoadFailure>
  | ReturnType<typeof gameUpdateSuccess>;

export const GamesReducer = (state = defaultAppState, action: GamesActionTypes) => {
  switch (action.type) {
    case GAMES_LOAD_START:
      return {
        ...state,
        games: [],
        isLoading: true,
        isError: false,
      };
    case GAMES_LOAD_SUCCESS: {
      const typedAction = action as ReturnType<typeof gamesLoadSuccess>;
      return {
        ...state,
        games: typedAction.payload.games,
        isLoading: false,
        isError: false,
      };
    }
    case GAMES_LOAD_FAILURE:
      return {
        ...state,
        games: [],
        isLoading: false,
        isError: true,
      };
    case GAME_UPDATE_SUCCESS: {
      const typedAction = action as ReturnType<typeof gameUpdateSuccess>;
      return {
        ...state,
        games: (state.games ?? []).map((g) =>
          g.gameFolder === typedAction.payload.gameFolder && g.platform === typedAction.payload.platform
            ? {
                ...g,
                displayName: typedAction.payload.displayName,
                thumbnail: typedAction.payload.thumbnail,
                description: typedAction.payload.description,
                releaseDate: typedAction.payload.releaseDate,
                genres: typedAction.payload.genres,
                igdbPlatforms: typedAction.payload.igdbPlatforms,
              }
            : g,
        ),
      };
    }
    default:
      return state;
  }
};
