import { Game } from '@/store/reducers/games/types';

export const GAMES_LOAD_START = 'GAMES_LOAD_START';
export const GAMES_LOAD_SUCCESS = 'GAMES_LOAD_SUCCESS';
export const GAMES_LOAD_FAILURE = 'GAMES_LOAD_FAILURE';

interface IGamesLoadStart {
  offset: number;
  limit: number;
}

export const gamesLoadStart = ({ offset, limit }: IGamesLoadStart) => ({
  type: GAMES_LOAD_START,
  payload: {
    offset,
    limit,
  },
});

interface IGamesLoadSuccess {
  games: Game[];
}

export const gamesLoadSuccess = ({ games }: IGamesLoadSuccess) => ({
  type: GAMES_LOAD_SUCCESS,
  payload: {
    games,
  },
});

interface IGamesLoadFailure {
  error: string;
}

export const gamesLoadFailure = ({ error }: IGamesLoadFailure) => ({
  type: GAMES_LOAD_FAILURE,
  payload: {
    error,
  },
});
