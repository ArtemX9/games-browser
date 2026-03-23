import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as api from '@/api/api';
import { SidebarProvider } from '@/components/ui/sidebar';

import GamesSidebar from './GamesSidebar';

vi.mock('sonner', () => ({
  toast: { success: vi.fn() },
}));

function renderSidebar(platforms: string[] = []) {
  return render(
    <SidebarProvider>
      <GamesSidebar platforms={platforms} />
    </SidebarProvider>,
  );
}

describe('GamesSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, 'triggerRescan').mockResolvedValue(undefined);
  });

  it('renders a menu entry for each platform', () => {
    renderSidebar(['PS 2', 'Win', 'Xbox 360']);
    expect(screen.getByText('PS 2')).toBeInTheDocument();
    expect(screen.getByText('Win')).toBeInTheDocument();
    expect(screen.getByText('Xbox 360')).toBeInTheDocument();
  });

  it('renders the rescan button', () => {
    renderSidebar();
    expect(screen.getByRole('button', { name: /rescan/i })).toBeInTheDocument();
  });

  it('calls triggerRescan when rescan button is clicked', async () => {
    renderSidebar();
    await userEvent.click(screen.getByRole('button', { name: /rescan/i }));
    expect(api.triggerRescan).toHaveBeenCalledTimes(1);
  });

  it('disables the rescan button while rescan is in progress', async () => {
    let resolveRescan!: (value?: unknown) => void;
    vi.spyOn(api, 'triggerRescan').mockReturnValue(
      new Promise((r) => {
        resolveRescan = r;
      }),
    );

    renderSidebar();
    const button = screen.getByRole('button', { name: /rescan/i });
    await userEvent.click(button);

    expect(button).toBeDisabled();

    resolveRescan();
    await waitFor(() => expect(button).not.toBeDisabled());
  });

  it('shows success toast after rescan completes', async () => {
    const { toast } = await import('sonner');
    renderSidebar();
    await userEvent.click(screen.getByRole('button', { name: /rescan/i }));
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Rescan complete'),
    );
  });

  it('scrolls to the correct section on platform click', async () => {
    const scrollIntoView = vi.fn();
    vi.spyOn(document, 'getElementById').mockReturnValue({
      scrollIntoView,
    } as unknown as HTMLElement);

    renderSidebar(['PS 2']);
    await userEvent.click(screen.getByText('PS 2'));

    expect(document.getElementById).toHaveBeenCalledWith('ps-2');
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  it('renders the Games Library header label', () => {
    renderSidebar();
    expect(screen.getByText('Games Library')).toBeInTheDocument();
  });
});
