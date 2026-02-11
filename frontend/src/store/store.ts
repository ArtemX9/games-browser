import { composeWithDevTools } from '@redux-devtools/extension';
import { Action, applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';

import rootReducer, { IApplicationState } from './reducers';

export const storeCreator = (preloadedState: any = {}) => {
  return createStore<IApplicationState, Action<never>, object, object>(
    rootReducer,
    preloadedState,
    composeWithDevTools(applyMiddleware(thunkMiddleware)),
  );
};

/**
 * Configure Redux Store
 */
function configureStore() {
  return storeCreator();
}

const store = configureStore();

export default store;
