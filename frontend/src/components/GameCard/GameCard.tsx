import { DownloadIcon, PencilIcon } from 'lucide-react';

import { GameInfo } from '@/App';
import { getDownloadURL } from '@/api/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Game } from '@/store/reducers/games/types';

interface IGameCard {
  game: Game;
  className?: string;
  onEditGameModalOpenClick: ({ shortName, game }: GameInfo) => void;
}

function GameCard({ game, className, onEditGameModalOpenClick }: IGameCard) {
  // 5. Derived values
  const shortName = game.displayName.split(' — ')[1] || game.displayName;
  const downloadURL = getDownloadURL(game.platform, game.gameFolder);

  function handleEditOpen() {
    onEditGameModalOpenClick({ shortName, game });
  }

  // 9. Main return
  return (
    <Card
      className={cn(
        'overflow-hidden border bg-card hover:border-primary/50 h-[550px] w-[300px] transition-all hover:shadow-lg group flex flex-col relative',
        className,
      )}
    >
      <div className='h-[250px] shrink-0'>
        <img
          src={game.thumbnail}
          alt={shortName}
          className='h-full w-fit aspect-video object-contain transition-transform group-hover:scale-105'
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/640x360?text=No+Image';
          }}
        />
        <Button
          variant='secondary'
          size='icon'
          className='absolute top-2 right-2 size-7 opacity-0 group-hover:opacity-100 transition-opacity'
          onClick={handleEditOpen}
          title='Edit game info'
        >
          <PencilIcon className='size-3.5' />
        </Button>
      </div>

      <CardContent className='pt-2 pb-0 px-5 flex-1 overflow-hidden'>
        <h3 className='font-semibold text-lg leading-tight line-clamp-2 mb-2.5'>{shortName}</h3>
        <p className='text-sm text-muted-foreground line-clamp-4'>{game.description}</p>
      </CardContent>

      <CardFooter className='px-5 pb-2'>
        <Button asChild variant='outline' size='sm' className='w-full gap-2'>
          <a href={downloadURL} download={`${game.gameFolder}.zip`}>
            <DownloadIcon className='size-4' />
            Download
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default GameCard;
