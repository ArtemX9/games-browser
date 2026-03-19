import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as api from '@/api/api';
import {
  GAMES_LOAD_FAILURE,
  GAMES_LOAD_START,
  GAMES_LOAD_SUCCESS,
} from '@/store/actions/games';

import { fetchGamesList } from './games';

const getState = () => ({
  games: { games: null, isLoading: null, isError: null },
});

describe('fetchGamesList thunk', () => {
  const dispatch = vi.fn();

  beforeEach(() => dispatch.mockClear());

  it('dispatches GAMES_LOAD_START then GAMES_LOAD_SUCCESS with camelCase fields', async () => {
    vi.spyOn(api, 'fetchGamesList').mockResolvedValue([
      {
        id: 1,
        display_name: 'Win — Hades',
        thumbnail: '/media/Win/Hades/thumbnail.png',
        icon: '',
        description: 'A rogue-like dungeon crawler.',
        platform: 'Win',
        game_folder: 'Hades',
        release_date: '2020',
        genres: 'Action',
        igdb_platforms: 'PC (Microsoft Windows)',
      },
    ]);

    await fetchGamesList({ offset: 0, limit: 10 })(dispatch, getState);

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch.mock.calls[0][0].type).toBe(GAMES_LOAD_START);
    expect(dispatch.mock.calls[0][0].payload).toEqual({ offset: 0, limit: 10 });

    expect(dispatch.mock.calls[1][0].type).toBe(GAMES_LOAD_SUCCESS);
    expect(dispatch.mock.calls[1][0].payload.games[0]).toEqual({
      displayName: 'Win — Hades',
      thumbnail: '/media/Win/Hades/thumbnail.png',
      icon: '',
      description: 'A rogue-like dungeon crawler.',
      platform: 'Win',
      gameFolder: 'Hades',
    });
  });

  it('converts snake_case fields to camelCase for all games', async () => {
    vi.spyOn(api, 'fetchGamesList').mockResolvedValue([
      {
        id: 2,
        display_name: 'PS 2 — Shadow of the Colossus',
        thumbnail: '/media/PS 2/Shadow of the Colossus/thumbnail.png',
        icon: 'icon.png',
        description: 'An action-adventure game.',
        platform: 'PS 2',
        game_folder: 'Shadow of the Colossus',
        release_date: '2005',
        genres: 'Action, Adventure',
        igdb_platforms: 'PlayStation 2',
      },
    ]);

    await fetchGamesList({ offset: 0, limit: 10 })(dispatch, getState);

    const successPayload = dispatch.mock.calls[1][0].payload;
    expect(successPayload.games[0].displayName).toBe(
      'PS 2 — Shadow of the Colossus',
    );
    expect(successPayload.games[0].gameFolder).toBe('Shadow of the Colossus');
    expect('display_name' in successPayload.games[0]).toBe(false);
    expect('game_folder' in successPayload.games[0]).toBe(false);
  });

  it('dispatches GAMES_LOAD_START then GAMES_LOAD_FAILURE on error', async () => {
    vi.spyOn(api, 'fetchGamesList').mockRejectedValue(
      new Error('Network error'),
    );

    await fetchGamesList({ offset: 0, limit: 10 })(dispatch, getState);

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch.mock.calls[0][0].type).toBe(GAMES_LOAD_START);
    expect(dispatch.mock.calls[1][0].type).toBe(GAMES_LOAD_FAILURE);
    expect(dispatch.mock.calls[1][0].payload.error).toContain('Network error');
  });
});
