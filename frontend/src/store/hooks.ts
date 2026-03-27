import type { TypedUseSelectorHook } from 'react-redux';
import { createSelectorHook, useDispatch } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IApplicationState } from './reducers';

export type AppDispatch = ThunkDispatch<IApplicationState, unknown, AnyAction>;
export type TypedDispatch = ThunkDispatch<IApplicationState, unknown, AnyAction>;
export type Action = (dispatch: AppDispatch, getState: () => IApplicationState) => void;

export const useAppDispatch = () => useDispatch<TypedDispatch>();
export const useAppSelector: TypedUseSelectorHook<IApplicationState> = createSelectorHook<IApplicationState>();
