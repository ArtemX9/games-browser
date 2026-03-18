import { GameCard } from '@/components/GameCard/GameCard';
import { GamesSidebar } from '@/components/GamesSidebar/GamesSidebar';
import { ModeToggle } from '@/components/ThemeProvider/ModeToggle';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Game } from '@/store/reducers/games/types';

interface IApp {
  isLoading: boolean;
  isError: boolean;
  games: Record<string, Game[]>;
}

function platformToId(platform: string): string {
  return platform.toLowerCase().replace(/\s+/g, '-');
}

function App({ isLoading, isError, games }: IApp) {
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

  return (
    <SidebarProvider>
      <GamesSidebar platforms={platforms} />
      <SidebarInset>
        <header className='flex items-center justify-between px-4 py-3 border-b'>
          <SidebarTrigger className='-ml-1' />
          <h1 className='text-xl font-bold tracking-tight'>Games Library</h1>
          <ModeToggle />
        </header>

        <main className='py-6 px-4 md:px-8'>
          {platforms.map((platform) => (
            <section
              key={platform}
              id={platformToId(platform)}
              className='mb-14 scroll-mt-4'
            >
              <div className='flex items-center gap-3 mb-6'>
                <h2 className='text-2xl md:text-3xl font-semibold tracking-tight'>
                  {platform}
                </h2>
                <Badge variant='secondary' className='text-base px-3 py-1'>
                  {games[platform].length}
                </Badge>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
                {games[platform].map((game) => (
                  <GameCard key={game.displayName} game={game} />
                ))}
              </div>
            </section>
          ))}

          {platforms.length === 0 && renderNoGames()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );

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
