import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '@/components/ThemeProvider/ThemeProvider';
import { storeCreator } from '@/store/store';
import { server } from '@/test/mocks/server';

import AppContainer from './AppContainer';

// Isolate from complex child UI so test focuses on Redux ↔ API wiring
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
  default: () => null,
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderAppContainer() {
  const store = storeCreator();
  render(
    <Provider store={store}>
      <ThemeProvider defaultTheme='system' storageKey='test-theme'>
        <AppContainer />
      </ThemeProvider>
    </Provider>,
  );
  return { store };
}

describe('AppContainer (integration)', () => {
  it('starts in loading state (isLoading=null → treated as loading)', () => {
    renderAppContainer();
    // In loading state App renders a heading, not the sidebar
    expect(screen.getByText('Games Library')).toBeInTheDocument();
    expect(screen.queryByTestId('games-sidebar')).not.toBeInTheDocument();
  });

  it('fetches games from the API and renders platform sections', async () => {
    renderAppContainer();
    // Platform name appears in both the mocked sidebar and the section heading
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'PS 2' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Win' })).toBeInTheDocument();
    });
  });

  it('renders game cards for all games returned by the API', async () => {
    renderAppContainer();
    await waitFor(() => {
      // mockGames has "PS 2 — Shadow of the Colossus" and "Win — Hades"
      expect(screen.getByText('Shadow of the Colossus')).toBeInTheDocument();
      expect(screen.getByText('Hades')).toBeInTheDocument();
    });
  });

  it('groups games by platform (sidebar shows correct platforms)', async () => {
    renderAppContainer();
    await waitFor(() => {
      const sidebar = screen.getByTestId('games-sidebar');
      expect(sidebar).toHaveTextContent('PS 2');
      expect(sidebar).toHaveTextContent('Win');
    });
  });

  it('updates Redux store with loaded games', async () => {
    const { store } = renderAppContainer();
    await waitFor(() => {
      const state = store.getState();
      expect(state.games.isLoading).toBe(false);
      expect(state.games.isError).toBe(false);
      expect(state.games.games).toHaveLength(2);
    });
  });

  it('shows error state when API returns 500', async () => {
    const { http, HttpResponse } = await import('msw');
    server.use(http.get('/api/games', () => HttpResponse.json({ error: 'Server error' }, { status: 500 })));

    renderAppContainer();
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });
});
