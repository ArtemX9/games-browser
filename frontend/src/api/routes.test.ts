import { describe, expect, it } from 'vitest';

import { getDownloadURL, getGamesURL, getRescanURL } from './routes';

describe('API routes', () => {
  it('getGamesURL returns /api/games', () => {
    expect(getGamesURL()).toBe('/api/games');
  });

  it('getRescanURL returns /api/rescan', () => {
    expect(getRescanURL()).toBe('/api/rescan');
  });

  describe('getDownloadURL', () => {
    it('builds URL from platform and folder', () => {
      expect(getDownloadURL('Win', 'Hades')).toBe('/api/download/Win/Hades');
    });

    it('URL-encodes spaces', () => {
      expect(getDownloadURL('PS 2', 'Shadow of the Colossus')).toBe('/api/download/PS%202/Shadow%20of%20the%20Colossus');
    });

    it('URL-encodes special characters', () => {
      expect(getDownloadURL('Xbox 360', 'Halo 3')).toBe('/api/download/Xbox%20360/Halo%203');
    });
  });
});
