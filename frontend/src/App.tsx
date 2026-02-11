import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {GameCard} from '@/components/GameCard/GameCard';
import {Game} from '@/store/reducers/games/types';
import {ModeToggle} from '@/components/ThemeProvider/ModeToggle';


interface IApp {
    isLoading: boolean
    isError: boolean
    games: Record<string, Game[]>;
}
function App({isLoading, isError, games}: IApp) {

    if (isError) {
        return <div>Error</div>;
    }

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <h1 className="text-4xl font-bold mb-8 text-center">Games Library</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-80 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 px-4 md:px-8">
            <div className='absolute r-4 t-4'><ModeToggle /></div>
            <h1 className="text-4xl font-bold mb-10 text-center tracking-tight">
                Games Library
            </h1>

            {Object.entries(games).map(([platform, platformGames]) => (
                <section key={platform} className="mb-14">
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                            {platform}
                        </h2>
                        <Badge variant="secondary" className="text-base px-3 py-1">
                            {platformGames.length}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {platformGames.map(game => (
                            <GameCard key={game.displayName} game={game} />
                        ))}
                    </div>
                </section>
            ))}

            {Object.values(games).length === 0 && !isLoading && renderNoGames()}
        </div>
    )

    function renderNoGames() {
        return (
            <Card className="mx-auto max-w-md text-center p-8">
                <CardHeader>
                    <CardTitle className="text-xl">No games found</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                    <p className="text-muted-foreground">
                        Make sure your game folders contain <code>thumbnail.png</code>,{' '}
                        <code>icon.png</code> and <code>description.txt</code>.
                    </p>
                </CardContent>
            </Card>
        )
    }
}

export default App