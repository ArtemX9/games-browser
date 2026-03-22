import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as api from '@/api/api';
import { IgdbSearchResult } from '@/api/types';
import * as gamesThunks from '@/store/thunks/games';

import { EditGameDialog } from './EditGameDialog';

const mockDispatch = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

vi.mock('@/store/thunks/games', async (importOriginal) => {
  const original = await importOriginal<typeof gamesThunks>();
  return { ...original, updateGameData: vi.fn(() => vi.fn()) };
});

const mockResult: IgdbSearchResult = {
  name: 'Hades',
  description: 'A rogue-like dungeon crawler.',
  thumbnail: 'https://example.com/hades.jpg',
  releaseDate: '2020',
  genres: 'RPG',
  platforms: 'PC (Microsoft Windows)',
};

const defaultProps = {
  gameName: 'Hades',
  platform: 'Win',
  gameFolder: 'Hades',
  onClose: vi.fn(),
};

describe('EditGameDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, 'searchIgdb').mockResolvedValue([mockResult]);
  });

  it('renders input pre-filled with gameName', () => {
    render(<EditGameDialog {...defaultProps} />);
    expect(screen.getByPlaceholderText('Game title…')).toHaveValue('Hades');
  });

  it('searches with gameName on mount', async () => {
    render(<EditGameDialog {...defaultProps} />);
    await waitFor(() => {
      expect(api.searchIgdb).toHaveBeenCalledWith('Hades', 'Win');
    });
  });

  it('shows search results after load', async () => {
    render(<EditGameDialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Hades')).toBeInTheDocument();
    });
  });

  it('triggers new search with modified title on Search button click', async () => {
    render(<EditGameDialog {...defaultProps} />);
    await waitFor(() => screen.getByText('Hades'));

    const input = screen.getByPlaceholderText('Game title…');
    fireEvent.change(input, { target: { value: 'Hades: The Game' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(api.searchIgdb).toHaveBeenCalledWith('Hades: The Game', 'Win');
    });
  });

  it('triggers new search on Enter key in input', async () => {
    render(<EditGameDialog {...defaultProps} />);
    await waitFor(() => screen.getByText('Hades'));

    const input = screen.getByPlaceholderText('Game title…');
    fireEvent.change(input, { target: { value: 'New Search' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(api.searchIgdb).toHaveBeenCalledWith('New Search', 'Win');
    });
  });

  it('passes customDisplayName when title is modified before Done', async () => {
    render(<EditGameDialog {...defaultProps} />);
    await waitFor(() => screen.getByText('Hades'));

    const input = screen.getByPlaceholderText('Game title…');
    fireEvent.change(input, { target: { value: 'Custom Title' } });

    fireEvent.click(screen.getByText('Hades'));
    fireEvent.click(screen.getByRole('button', { name: /done/i }));

    await waitFor(() => {
      expect(gamesThunks.updateGameData).toHaveBeenCalledWith(
        expect.objectContaining({ customDisplayName: 'Custom Title' }),
      );
    });
  });

  it('does not pass customDisplayName when title is unchanged', async () => {
    render(<EditGameDialog {...defaultProps} />);
    await waitFor(() => screen.getByText('Hades'));

    fireEvent.click(screen.getByText('Hades'));
    fireEvent.click(screen.getByRole('button', { name: /done/i }));

    await waitFor(() => {
      expect(gamesThunks.updateGameData).toHaveBeenCalledWith(
        expect.objectContaining({ customDisplayName: undefined }),
      );
    });
  });

  it('calls onClose after successful save', async () => {
    render(<EditGameDialog {...defaultProps} />);
    await waitFor(() => screen.getByText('Hades'));

    fireEvent.click(screen.getByText('Hades'));
    fireEvent.click(screen.getByRole('button', { name: /done/i }));

    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('does not call updateGameData when closed without selection', async () => {
    render(<EditGameDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(gamesThunks.updateGameData).not.toHaveBeenCalled();
  });

  it('clears selection when a new search is triggered', async () => {
    render(<EditGameDialog {...defaultProps} />);
    await waitFor(() => screen.getByText('Hades'));

    fireEvent.click(screen.getByText('Hades'));
    expect(screen.getByRole('button', { name: /done/i })).not.toBeDisabled();

    const input = screen.getByPlaceholderText('Game title…');
    fireEvent.change(input, { target: { value: 'Something Else' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /done/i })).toBeDisabled();
    });
  });

  it('shows no results message when search returns empty array', async () => {
    vi.spyOn(api, 'searchIgdb').mockResolvedValue([]);
    render(<EditGameDialog {...defaultProps} />);
    await waitFor(() => {
      expect(
        screen.getByText(/no results found on igdb/i),
      ).toBeInTheDocument();
    });
  });
});