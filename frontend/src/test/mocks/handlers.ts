import { HttpResponse, http } from 'msw';

import { getGamesURL, getRescanURL } from '@/api/routes';
import { ApiGame } from '@/api/types';

export const mockGames: ApiGame[] = [
  {
    id: 1,
    display_name: 'PS 2 — Shadow of the Colossus',
    thumbnail: '/media/PS 2/Shadow of the Colossus/thumbnail.png',
    icon: '',
    description: 'An action-adventure game.',
    platform: 'PS 2',
    game_folder: 'Shadow of the Colossus',
    release_date: '2005',
    genres: 'Action, Adventure',
    igdb_platforms: 'PlayStation 2',
  },
  {
    id: 2,
    display_name: 'Win — Hades',
    thumbnail: '/media/Win/Hades/thumbnail.png',
    icon: '',
    description: 'A rogue-like dungeon crawler.',
    platform: 'Win',
    game_folder: 'Hades',
    release_date: '2020',
    genres: 'Action, RPG',
    igdb_platforms: 'PC (Microsoft Windows)',
  },
];

export const handlers = [
  http.get(getGamesURL(), () => HttpResponse.json(mockGames)),
  http.get(getRescanURL(), () => HttpResponse.json({ success: true })),
];
