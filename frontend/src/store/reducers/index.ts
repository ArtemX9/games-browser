import { Reducer, combineReducers } from 'redux';

import { GamesReducer, IGamesReducer } from './games/reducer';

export interface IApplicationState {
  games: IGamesReducer;
}
const rootReducer: Reducer<IApplicationState> =
  combineReducers<IApplicationState>({
    games: GamesReducer,
  });

export default rootReducer;
