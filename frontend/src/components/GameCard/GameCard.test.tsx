import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Game } from '@/store/reducers/games/types';

import GameCard from './GameCard';

const baseGame: Game = {
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
};

describe('GameCard', () => {
  it('extracts and renders the short name from displayName (after —)', () => {
    render(<GameCard game={baseGame} />);
    expect(screen.getByText('Hades')).toBeInTheDocument();
  });

  it('renders full displayName when no — separator present', () => {
    const game = { ...baseGame, displayName: 'Hades' };
    render(<GameCard game={game} />);
    expect(screen.getByText('Hades')).toBeInTheDocument();
  });

  it('renders thumbnail image with correct src and alt', () => {
    render(<GameCard game={baseGame} />);
    const img = screen.getByRole('img', { name: 'Hades' });
    expect(img).toHaveAttribute('src', '/media/Win/Hades/thumbnail.png');
  });

  it('renders the game description', () => {
    render(<GameCard game={baseGame} />);
    expect(
      screen.getByText('A rogue-like dungeon crawler.'),
    ).toBeInTheDocument();
  });

  it('renders download link with correct href', () => {
    render(<GameCard game={baseGame} />);
    const link = screen.getByRole('link', { name: /download/i });
    expect(link).toHaveAttribute('href', '/api/download/Win/Hades');
  });

  it('sets download attribute to gameFolder.zip', () => {
    render(<GameCard game={baseGame} />);
    const link = screen.getByRole('link', { name: /download/i });
    expect(link).toHaveAttribute('download', 'Hades.zip');
  });

  it('URL-encodes platform and gameFolder in download link', () => {
    const game: Game = {
      ...baseGame,
      platform: 'PS 2',
      gameFolder: 'Shadow of the Colossus',
      displayName: 'PS 2 — Shadow of the Colossus',
    };
    render(<GameCard game={game} />);
    const link = screen.getByRole('link', { name: /download/i });
    expect(link).toHaveAttribute(
      'href',
      '/api/download/PS%202/Shadow%20of%20the%20Colossus',
    );
  });

  it('falls back to placeholder image on img error', () => {
    render(<GameCard game={baseGame} />);
    const img = screen.getByRole('img', { name: 'Hades' });
    fireEvent.error(img);
    expect(img).toHaveAttribute(
      'src',
      'https://placehold.co/640x360?text=No+Image',
    );
  });
});
