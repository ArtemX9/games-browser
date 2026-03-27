import { CalendarIcon, DownloadIcon, MonitorIcon, TagIcon } from 'lucide-react';

import { getDownloadURL } from '@/api/routes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Game } from '@/store/reducers/games/types';

interface IGameDetailModal {
  game: Game;
  onClose: () => void;
}

function GameDetailModal({ game, onClose }: IGameDetailModal) {
  // 5. Derived values
  const shortName = game.displayName.split(' — ')[1] || game.displayName;
  const downloadURL = getDownloadURL(game.platform, game.gameFolder);
  const genreList = game.genres
    ? game.genres
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
    : [];
  const platformList = game.igdbPlatforms
    ? game.igdbPlatforms
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  // 9. Main return
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-0' showCloseButton>
        <div className='flex flex-col sm:flex-row gap-0'>
          {/* Thumbnail column */}
          <div className='sm:w-56 shrink-0 bg-muted flex items-center justify-center rounded-tl-xl rounded-bl-xl overflow-hidden'>
            <img
              src={game.thumbnail}
              alt={shortName}
              className='w-full h-full object-cover sm:object-contain sm:max-h-80'
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/320x200?text=No+Image';
              }}
            />
          </div>

          {/* Details column */}
          <div className='flex-1 flex flex-col p-5 gap-4 min-w-0'>
            <DialogHeader>
              <Badge variant='secondary' className='w-fit text-xs'>
                {game.platform}
              </Badge>
              <DialogTitle className='text-xl leading-snug mt-1'>{shortName}</DialogTitle>
            </DialogHeader>

            {renderMeta()}

            {game.description && (
              <>
                <Separator />
                <p className='text-sm text-muted-foreground leading-relaxed'>{game.description}</p>
              </>
            )}

            <div className='mt-auto pt-2'>
              <Button asChild className='w-full gap-2'>
                <a href={downloadURL} download={`${game.gameFolder}.zip`}>
                  <DownloadIcon className='size-4' />
                  Download
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // 10. Render helpers
  function renderMeta() {
    const hasAnyMeta = game.releaseDate || genreList.length > 0 || platformList.length > 0;

    if (!hasAnyMeta) return null;

    return (
      <div className='flex flex-col gap-2.5 text-sm'>
        {game.releaseDate && (
          <div className='flex items-center gap-2 text-muted-foreground'>
            <CalendarIcon className='size-4 shrink-0' />
            <span>{game.releaseDate}</span>
          </div>
        )}

        {genreList.length > 0 && (
          <div className='flex items-start gap-2'>
            <TagIcon className='size-4 shrink-0 mt-0.5 text-muted-foreground' />
            <div className='flex flex-wrap gap-1'>
              {genreList.map((genre) => (
                <Badge key={genre} variant='outline' className='text-xs'>
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {platformList.length > 0 && (
          <div className='flex items-start gap-2'>
            <MonitorIcon className='size-4 shrink-0 mt-0.5 text-muted-foreground' />
            <div className='flex flex-wrap gap-1'>
              {platformList.map((platform) => (
                <Badge key={platform} variant='secondary' className='text-xs'>
                  {platform}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default GameDetailModal;
