import { Game } from '@/store/reducers/games/types';

export const GAMES_LOAD_START = 'GAMES_LOAD_START';
export const GAMES_LOAD_SUCCESS = 'GAMES_LOAD_SUCCESS';
export const GAMES_LOAD_FAILURE = 'GAMES_LOAD_FAILURE';
export const GAME_UPDATE_SUCCESS = 'GAME_UPDATE_SUCCESS';

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

interface IGameUpdateSuccess {
  gameFolder: string;
  platform: string;
  displayName: string;
  thumbnail: string;
  description: string;
  releaseDate: string;
  genres: string;
  igdbPlatforms: string;
}

export const gameUpdateSuccess = ({
  gameFolder,
  platform,
  displayName,
  thumbnail,
  description,
  releaseDate,
  genres,
  igdbPlatforms,
}: IGameUpdateSuccess) => ({
  type: GAME_UPDATE_SUCCESS,
  payload: {
    gameFolder,
    platform,
    displayName,
    thumbnail,
    description,
    releaseDate,
    genres,
    igdbPlatforms,
  },
});
