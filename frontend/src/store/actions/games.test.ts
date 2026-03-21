import { describe, expect, it } from 'vitest';

import {
  GAMES_LOAD_FAILURE,
  GAMES_LOAD_START,
  GAMES_LOAD_SUCCESS,
  gamesLoadFailure,
  gamesLoadStart,
  gamesLoadSuccess,
} from './games';

describe('games action creators', () => {
  describe('gamesLoadStart', () => {
    it('creates action with correct type and payload', () => {
      const action = gamesLoadStart({ offset: 0, limit: 20 });
      expect(action.type).toBe(GAMES_LOAD_START);
      expect(action.payload).toEqual({ offset: 0, limit: 20 });
    });
  });

  describe('gamesLoadSuccess', () => {
    it('creates action with correct type and games payload', () => {
      const games = [
        {
          id: 1,
          displayName: 'Hades',
          platform: 'Win',
          thumbnail: '',
          icon: '',
          description: '',
          gameFolder: 'Hades',
        },
      ];
      const action = gamesLoadSuccess({ games });
      expect(action.type).toBe(GAMES_LOAD_SUCCESS);
      expect(action.payload.games).toEqual(games);
    });
  });

  describe('gamesLoadFailure', () => {
    it('creates action with correct type and error payload', () => {
      const action = gamesLoadFailure({ error: 'Something went wrong' });
      expect(action.type).toBe(GAMES_LOAD_FAILURE);
      expect(action.payload).toEqual({ error: 'Something went wrong' });
    });
  });
});
