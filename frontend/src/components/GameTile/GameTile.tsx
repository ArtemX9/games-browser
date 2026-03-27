import { useState } from 'react';

import GameDetailModal from '@/components/GameDetailModal/GameDetailModal';
import { cn } from '@/lib/utils';
import { Game } from '@/store/reducers/games/types';

interface IGameTile {
  game: Game;
  className?: string;
}

function GameTile({ game, className }: IGameTile) {
  // 4. State
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 5. Derived values
  const shortName = game.displayName.split(' — ')[1] || game.displayName;

  // 7. Event handlers
  function handleClick() {
    setIsDetailOpen(true);
  }

  function handleDetailClose() {
    setIsDetailOpen(false);
  }

  // 9. Main return
  return (
    <>
      <button
        type='button'
        onClick={handleClick}
        className={cn(
          'group relative overflow-hidden rounded-lg bg-card border border-border',
          'w-[140px] sm:w-[160px]',
          'hover:border-primary/50 hover:shadow-md transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className,
        )}
      >
        {/* Thumbnail */}
        <div className='aspect-[3/4] overflow-hidden bg-muted'>
          <img
            src={game.thumbnail}
            alt={shortName}
            className='w-full h-full object-cover transition-transform duration-200 group-hover:scale-105'
            onError={(e) => {
              e.currentTarget.src =
                'https://placehold.co/160x213?text=No+Image';
            }}
          />
        </div>

        {/* Title overlay */}
        <div className='px-2 py-2 bg-card'>
          <p className='text-xs font-medium leading-snug line-clamp-2 text-foreground text-left'>
            {shortName}
          </p>
        </div>
      </button>

      {isDetailOpen && (
        <GameDetailModal game={game} onClose={handleDetailClose} />
      )}
    </>
  );
}

export default GameTile;
