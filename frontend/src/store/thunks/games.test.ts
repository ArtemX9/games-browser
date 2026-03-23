import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as api from '@/api/api';
import { IgdbSearchResult } from '@/api/types';
import {
  GAMES_LOAD_FAILURE,
  GAMES_LOAD_START,
  GAMES_LOAD_SUCCESS,
  GAME_UPDATE_SUCCESS,
} from '@/store/actions/games';

import { fetchGamesList, updateGameData } from './games';

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
      id: 1,
      displayName: 'Win — Hades',
      thumbnail: '/media/Win/Hades/thumbnail.png',
      icon: '',
      description: 'A rogue-like dungeon crawler.',
      platform: 'Win',
      gameFolder: 'Hades',
      releaseDate: '2020',
      genres: 'Action',
      igdbPlatforms: 'PC (Microsoft Windows)',
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
    expect(successPayload.games[0].releaseDate).toBe('2005');
    expect(successPayload.games[0].igdbPlatforms).toBe('PlayStation 2');
    expect('display_name' in successPayload.games[0]).toBe(false);
    expect('game_folder' in successPayload.games[0]).toBe(false);
    expect('release_date' in successPayload.games[0]).toBe(false);
    expect('igdb_platforms' in successPayload.games[0]).toBe(false);
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

describe('updateGameData thunk', () => {
  const dispatch = vi.fn();
  const getState = () => ({
    games: { games: null, isLoading: null, isError: null },
  });

  const mockSelected: IgdbSearchResult = {
    name: 'Hades',
    description: 'A rogue-like dungeon crawler.',
    thumbnail: 'https://example.com/hades.jpg',
    releaseDate: '2020',
    genres: 'RPG',
    platforms: 'PC (Microsoft Windows)',
  };

  beforeEach(() => {
    dispatch.mockClear();
    vi.spyOn(api, 'updateGame').mockResolvedValue(undefined);
  });

  it('uses selected.name as displayName when no customDisplayName', async () => {
    await updateGameData({
      platform: 'Win',
      gameFolder: 'Hades',
      selected: mockSelected,
    })(dispatch, getState);

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0][0].type).toBe(GAME_UPDATE_SUCCESS);
    expect(dispatch.mock.calls[0][0].payload.displayName).toBe('Hades');
  });

  it('uses customDisplayName when provided', async () => {
    await updateGameData({
      platform: 'Win',
      gameFolder: 'Hades',
      selected: mockSelected,
      customDisplayName: 'Custom Title',
    })(dispatch, getState);

    expect(dispatch.mock.calls[0][0].payload.displayName).toBe('Custom Title');
  });

  it('passes customDisplayName to updateGame API call', async () => {
    await updateGameData({
      platform: 'Win',
      gameFolder: 'Hades',
      selected: mockSelected,
      customDisplayName: 'Custom Title',
    })(dispatch, getState);

    expect(api.updateGame).toHaveBeenCalledWith(
      'Win',
      'Hades',
      expect.objectContaining({ displayName: 'Custom Title' }),
    );
  });

  it('dispatches GAME_UPDATE_SUCCESS with correct fields', async () => {
    await updateGameData({
      platform: 'Win',
      gameFolder: 'Hades',
      selected: mockSelected,
    })(dispatch, getState);

    expect(dispatch.mock.calls[0][0].payload).toEqual({
      gameFolder: 'Hades',
      platform: 'Win',
      displayName: 'Hades',
      thumbnail: 'https://example.com/hades.jpg',
      description: 'A rogue-like dungeon crawler.',
      releaseDate: '2020',
      genres: 'RPG',
      igdbPlatforms: 'PC (Microsoft Windows)',
    });
  });
});
