import { Card, CardContent } from '@/components/ui/card';
import { Game } from '@/store/reducers/games/types';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const shortName = game.displayName.split(' — ')[1] || game.displayName;

  return (
    <Card className='overflow-hidden border bg-card hover:border-primary/50 h-[500px] transition-all hover:shadow-lg group'>
      <div className='relative h-[250px]'>
        <img
          src={game.thumbnail}
          alt={shortName}
          className='h-full w-fit aspect-video object-contain transition-transform group-hover:scale-105'
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/640x360?text=No+Image';
          }}
        />
      </div>

      <CardContent className='pt-10 pb-6 px-5'>
        <h3 className='font-semibold text-lg leading-tight line-clamp-2 mb-2.5'>
          {shortName}
        </h3>
        <p className='text-sm text-muted-foreground line-clamp-3'>
          {game.description}
        </p>
      </CardContent>
    </Card>
  );
}
