import { HttpResponse, http } from 'msw';

import { getGamesURL, getRescanURL } from '@/api/routes';

export const mockGames = [
  {
    display_name: 'PS 2 — Shadow of the Colossus',
    thumbnail: '/media/PS 2/Shadow of the Colossus/thumbnail.png',
    icon: '',
    description: 'An action-adventure game.',
    platform: 'PS 2',
    game_folder: 'Shadow of the Colossus',
  },
  {
    display_name: 'Win — Hades',
    thumbnail: '/media/Win/Hades/thumbnail.png',
    icon: '',
    description: 'A rogue-like dungeon crawler.',
    platform: 'Win',
    game_folder: 'Hades',
  },
];

export const handlers = [
  http.get(getGamesURL(), () => HttpResponse.json(mockGames)),
  http.get(getRescanURL(), () => HttpResponse.json({ success: true })),
];
