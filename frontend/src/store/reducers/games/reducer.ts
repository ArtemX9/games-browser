import {
  GAME_UPDATE_SUCCESS,
  GAMES_LOAD_FAILURE,
  GAMES_LOAD_START,
  GAMES_LOAD_SUCCESS,
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

type GamesActionTypes = ReturnType<typeof gamesLoadStart> &
  ReturnType<typeof gamesLoadSuccess> &
  ReturnType<typeof gamesLoadFailure> &
  ReturnType<typeof gameUpdateSuccess>;

export const GamesReducer = (
  state = defaultAppState,
  action: GamesActionTypes,
) => {
  switch (action.type) {
    case GAMES_LOAD_START:
      return {
        ...state,
        games: [],
        isLoading: true,
        isError: false,
      };
    case GAMES_LOAD_SUCCESS:
      return {
        ...state,
        games: action.payload.games,
        isLoading: false,
        isError: false,
      };
    case GAMES_LOAD_FAILURE:
      return {
        ...state,
        games: [],
        isLoading: false,
        isError: true,
      };
    case GAME_UPDATE_SUCCESS:
      return {
        ...state,
        games: (state.games ?? []).map((g) =>
          g.gameFolder === action.payload.gameFolder && g.platform === action.payload.platform
            ? {
                ...g,
                displayName: action.payload.displayName,
                thumbnail: action.payload.thumbnail,
                description: action.payload.description,
              }
            : g,
        ),
      };
    default:
      return state;
  }
};
