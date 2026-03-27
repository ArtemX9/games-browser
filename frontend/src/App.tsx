import { LayoutGridIcon, LayoutListIcon } from 'lucide-react';
import { useState } from 'react';

import EditGameDialog from '@/components/EditGameDialog/EditGameDialog';
import GameCard from '@/components/GameCard/GameCard';
import GameDetailModal from '@/components/GameDetailModal/GameDetailModal';
import GameTile from '@/components/GameTile/GameTile';
import GamesSidebar from '@/components/GamesSidebar/GamesSidebar';
import PlatformSection from '@/components/PlatformSection/PlatformSection';
import ModeToggle from '@/components/ThemeProvider/ModeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Game } from '@/store/reducers/games/types';

export enum ViewMode {
  CARDS = 'cards',
  TILES = 'titles',
}

export type GameInfo = {
  shortName: string;
  game: Game;
};

interface IApp {
  isLoading: boolean;
  isError: boolean;
  games: Record<string, Game[]>;
}

function platformToId(platform: string): string {
  return platform.toLowerCase().replace(/\s+/g, '-');
}

function App({ isLoading, isError, games }: IApp) {
  // 4. State
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.CARDS);
  const [editiableGame, setEditableGame] = useState<GameInfo | null>(null);
  const [gameDetail, setGameDetail] = useState<GameInfo | null>(null);

  // 7. Event handlers
  function handleToggleViewMode() {
    setViewMode((prev) =>
      prev === ViewMode.CARDS ? ViewMode.TILES : ViewMode.CARDS,
    );
  }

  function handleEditGameModalOpenClick({ shortName, game }: GameInfo) {
    setEditableGame({
      shortName,
      game,
    });
  }

  function handleEditGameModalCloseClick() {
    setEditableGame(null);
  }

  function handleOpenGameTileClick({ shortName, game }: GameInfo) {
    setGameDetail({ shortName, game });
  }

  function handleCloseGameTileClick() {
    setGameDetail(null);
  }

  // 8. Early returns
  if (isError) {
    return <div>Error</div>;
  }

  if (isLoading) {
    return (
      <div className='container mx-auto p-6'>
        <h1 className='text-4xl font-bold mb-8 text-center'>Games Library</h1>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className='h-80 w-full rounded-xl' />
          ))}
        </div>
      </div>
    );
  }

  const platforms = Object.keys(games);

  // 9. Main return
  return (
    <SidebarProvider>
      <GamesSidebar platforms={platforms} />
      <SidebarInset>
        <header className='flex items-center justify-between px-4 py-3 border-b'>
          <SidebarTrigger className='-ml-1' />
          <h1 className='text-xl font-bold tracking-tight'>Games Library</h1>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleToggleViewMode}
              title={
                viewMode === ViewMode.CARDS
                  ? 'Switch to tiles view'
                  : 'Switch to cards view'
              }
            >
              {viewMode === ViewMode.CARDS ? (
                <LayoutGridIcon className='size-4' />
              ) : (
                <LayoutListIcon className='size-4' />
              )}
            </Button>
            <ModeToggle />
          </div>
        </header>

        <main className='py-6 px-4 md:px-8'>
          {platforms.map((platform) => (
            <PlatformSection
              key={platform}
              platform={platform}
              gameCount={games[platform].length}
              sectionId={platformToId(platform)}
            >
              <div className='flex flex-wrap items-stretch justify-center gap-6'>
                {games[platform].map(renderGameCard)}
              </div>
            </PlatformSection>
          ))}

          {!!editiableGame && (
            <EditGameDialog
              gameName={editiableGame.shortName}
              platform={editiableGame.game.platform}
              gameFolder={editiableGame.game.gameFolder}
              onClose={handleEditGameModalCloseClick}
            />
          )}

          {!!gameDetail && (
            <GameDetailModal
              game={gameDetail.game}
              onClose={handleCloseGameTileClick}
            />
          )}

          {platforms.length === 0 && renderNoGames()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );

  // 10. Render helpers
  function renderGameCard(game: Game) {
    if (viewMode === ViewMode.CARDS) {
      return (
        <GameCard
          key={game.displayName}
          game={game}
          className='last:justify-start'
          onEditGameModalOpenClick={handleEditGameModalOpenClick}
        />
      );
    }

    return (
      <GameTile
        key={game.displayName}
        game={game}
        onOpenGameTileClick={handleOpenGameTileClick}
      />
    );
  }

  function renderNoGames() {
    return (
      <Card className='mx-auto max-w-md text-center p-8'>
        <CardHeader>
          <CardTitle className='text-xl'>No games found</CardTitle>
        </CardHeader>
        <CardContent className='pt-2'>
          <p className='text-muted-foreground'>
            Make sure your game folders contain <code>thumbnail.png</code>,{' '}
            <code>icon.png</code> and <code>description.txt</code>.
          </p>
        </CardContent>
      </Card>
    );
  }
}

export default App;
