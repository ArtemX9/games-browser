/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';

import { GAMES_LOAD_FAILURE, GAMES_LOAD_START, GAMES_LOAD_SUCCESS } from '@/store/actions/games';
import { Game } from '@/store/reducers/games/types';

import { GamesReducer, IGamesReducer } from './reducer';

const defaultState: IGamesReducer = {
  games: null,
  isLoading: null,
  isError: null,
};

const mockGame: Game = {
  id: 1,
  displayName: 'Hades',
  thumbnail: '',
  icon: '',
  description: '',
  platform: 'Win',
  gameFolder: 'Hades',
  releaseDate: '',
  genres: '',
  igdbPlatforms: '',
};

describe('GamesReducer', () => {
  it('returns default state for unknown action', () => {
    expect(GamesReducer(undefined, {} as any)).toEqual(defaultState);
  });

  describe(GAMES_LOAD_START, () => {
    it('sets isLoading=true, clears games, clears error', () => {
      const state = GamesReducer(undefined, {
        type: GAMES_LOAD_START,
        payload: { offset: 0, limit: 10 },
      } as any);
      expect(state).toEqual({ games: [], isLoading: true, isError: false });
    });

    it('preserves other state fields', () => {
      const prior: IGamesReducer = {
        games: [mockGame],
        isLoading: false,
        isError: true,
      };
      const state = GamesReducer(prior, {
        type: GAMES_LOAD_START,
        payload: { offset: 0, limit: 10 },
      } as any);
      expect(state.games).toEqual([]);
      expect(state.isLoading).toBe(true);
      expect(state.isError).toBe(false);
    });
  });

  describe(GAMES_LOAD_SUCCESS, () => {
    it('sets games, clears loading and error', () => {
      const games = [mockGame];
      const state = GamesReducer(undefined, {
        type: GAMES_LOAD_SUCCESS,
        payload: { games },
      } as any);
      expect(state).toEqual({ games, isLoading: false, isError: false });
    });

    it('replaces existing games', () => {
      const prior: IGamesReducer = {
        games: [{ ...mockGame, displayName: 'Old Game' }],
        isLoading: true,
        isError: false,
      };
      const newGames = [mockGame];
      const state = GamesReducer(prior, {
        type: GAMES_LOAD_SUCCESS,
        payload: { games: newGames },
      } as any);
      expect(state.games).toEqual(newGames);
    });
  });

  describe(GAMES_LOAD_FAILURE, () => {
    it('sets isError=true, clears loading and games', () => {
      const state = GamesReducer(undefined, {
        type: GAMES_LOAD_FAILURE,
        payload: { error: 'Network error' },
      } as any);
      expect(state).toEqual({ games: [], isLoading: false, isError: true });
    });
  });
});
