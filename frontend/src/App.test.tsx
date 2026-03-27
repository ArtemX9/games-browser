import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '@/components/ThemeProvider/ThemeProvider';
import { Game } from '@/store/reducers/games/types';

import App from './App';

// Isolate App from complex child components that need additional providers/setup
vi.mock('@/components/GamesSidebar/GamesSidebar', () => ({
  default: ({ platforms }: { platforms: string[] }) => (
    <nav data-testid='games-sidebar'>
      {platforms.map((p) => (
        <span key={p}>{p}</span>
      ))}
    </nav>
  ),
}));

vi.mock('@/components/ThemeProvider/ModeToggle', () => ({
  default: () => <button>Toggle theme</button>,
}));

function renderApp(props: { isLoading: boolean; isError: boolean; games: Record<string, Game[]> }) {
  return render(
    <ThemeProvider defaultTheme='system' storageKey='test-theme'>
      <App {...props} />
    </ThemeProvider>,
  );
}

const makeGame = (platform: string, name: string, gameFolder = name): Game => ({
  id: 1,
  displayName: name,
  thumbnail: '',
  icon: '',
  description: '',
  platform,
  gameFolder,
  releaseDate: '',
  genres: '',
  igdbPlatforms: '',
});

describe('App', () => {
  describe('error state', () => {
    it('renders error message', () => {
      renderApp({ isLoading: false, isError: true, games: {} });
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('does not render the sidebar in error state', () => {
      renderApp({ isLoading: false, isError: true, games: {} });
      expect(screen.queryByTestId('games-sidebar')).not.toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('renders the Games Library heading', () => {
      renderApp({ isLoading: true, isError: false, games: {} });
      expect(screen.getByText('Games Library')).toBeInTheDocument();
    });

    it('renders skeleton placeholders', () => {
      renderApp({ isLoading: true, isError: false, games: {} });
      // 6 skeletons are rendered; each has the animate-pulse class from shadcn Skeleton
      const skeletons = document.querySelector('.grid')?.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons?.length).toBeGreaterThan(0);
    });
  });

  describe('empty state', () => {
    it('shows "No games found" when games object is empty', () => {
      renderApp({ isLoading: false, isError: false, games: {} });
      expect(screen.getByText('No games found')).toBeInTheDocument();
    });
  });

  describe('with games', () => {
    it('renders a section for each platform', () => {
      const games = {
        Win: [makeGame('Win', 'Hades')],
        'PS 2': [makeGame('PS 2', 'Shadow of the Colossus')],
      };
      renderApp({ isLoading: false, isError: false, games });
      // Platform name appears in both the mocked sidebar and the section heading
      expect(screen.getByRole('heading', { name: 'Win' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'PS 2' })).toBeInTheDocument();
    });

    it('renders game cards inside each platform section', () => {
      const games = {
        Win: [makeGame('Win', 'Hades')],
      };
      renderApp({ isLoading: false, isError: false, games });
      expect(screen.getByText('Hades')).toBeInTheDocument();
    });

    it('renders a badge showing the game count per platform', () => {
      const games = {
        Win: [makeGame('Win', 'Hades'), makeGame('Win', 'Hades 2', 'Hades2')],
      };
      renderApp({ isLoading: false, isError: false, games });
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('passes platform list to GamesSidebar', () => {
      const games = {
        Win: [makeGame('Win', 'Hades')],
        'Xbox 360': [makeGame('Xbox 360', 'Halo 3')],
      };
      renderApp({ isLoading: false, isError: false, games });
      const sidebar = screen.getByTestId('games-sidebar');
      expect(sidebar).toHaveTextContent('Win');
      expect(sidebar).toHaveTextContent('Xbox 360');
    });

    it('sets section id as kebab-case platform name', () => {
      const games = {
        'Xbox 360': [makeGame('Xbox 360', 'Halo 3')],
      };
      renderApp({ isLoading: false, isError: false, games });
      const section = document.getElementById('xbox-360');
      expect(section).toBeInTheDocument();
    });
  });
});
