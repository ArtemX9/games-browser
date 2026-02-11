import {
    GAMES_LOAD_FAILURE,
    GAMES_LOAD_START,
    GAMES_LOAD_SUCCESS,
    gamesLoadFailure,
    gamesLoadStart,
    gamesLoadSuccess,
} from '@/store/actions/games';
import {Game} from '@/store/reducers/games/types';

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

type GamesActionTypes = ReturnType<typeof gamesLoadStart> & ReturnType<typeof gamesLoadSuccess> & ReturnType<typeof gamesLoadFailure>;


export const GamesReducer = (state = defaultAppState, action: GamesActionTypes) => {
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
        default:
            return state;
    }
};