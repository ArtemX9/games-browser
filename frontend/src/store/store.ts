import { composeWithDevTools } from '@redux-devtools/extension';
import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';

import rootReducer from './reducers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const storeCreator = (preloadedState: any = {}) => {
  return createStore(
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
