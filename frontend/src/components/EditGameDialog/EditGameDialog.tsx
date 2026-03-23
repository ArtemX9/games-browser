import { useEffect, useState } from 'react';

import { CheckIcon, Loader2Icon, SearchIcon, XIcon } from 'lucide-react';

import { searchIgdb } from '@/api/api';
import { IgdbSearchResult } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppDispatch } from '@/store/hooks';
import { updateGameData } from '@/store/thunks/games';

interface EditGameDialogProps {
  gameName: string;
  platform: string;
  gameFolder: string;
  onClose: () => void;
}

export function EditGameDialog({
  gameName,
  platform,
  gameFolder,
  onClose,
}: EditGameDialogProps) {
  const dispatch = useAppDispatch();
  const [searchTitle, setSearchTitle] = useState(gameName);
  const [results, setResults] = useState<IgdbSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<IgdbSearchResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const runSearch = (query: string) => {
    setIsLoading(true);
    setResults([]);
    setSelected(null);
    searchIgdb(query, platform)
      .then((data) => setResults(data ?? []))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    runSearch(gameName);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => runSearch(searchTitle);

  const handleDone = async () => {
    if (!selected) return;
    setIsSaving(true);
    const customDisplayName = searchTitle !== gameName ? searchTitle : undefined;
    await dispatch(updateGameData({ platform, gameFolder, selected, customDisplayName }));
    setIsSaving(false);
    onClose();
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className='bg-background border rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-start justify-between px-5 py-4 border-b gap-3'>
          <div className='flex-1 min-w-0'>
            <h2 className='font-semibold text-base'>Select matching game</h2>
            <p className='text-sm text-muted-foreground mt-0.5 mb-2 truncate'>{gameFolder}</p>
            <div className='flex gap-2'>
              <Input
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder='Game title…'
                className='h-8 text-sm'
              />
              <Button
                variant='outline'
                size='sm'
                onClick={handleSearch}
                disabled={isLoading || !searchTitle.trim()}
              >
                <SearchIcon className='size-3.5 mr-1.5' />
                Search
              </Button>
            </div>
          </div>
          <Button variant='ghost' size='icon' className='shrink-0' onClick={onClose}>
            <XIcon className='size-4' />
          </Button>
        </div>

        {/* Results */}
        <div className='flex-1 overflow-y-auto px-5 py-3 space-y-2'>
          {isLoading && (
            <div className='flex items-center justify-center py-12 text-muted-foreground gap-2'>
              <Loader2Icon className='size-5 animate-spin' />
              <span className='text-sm'>Searching IGDB…</span>
            </div>
          )}

          {!isLoading && results.length === 0 && (
            <div className='py-12 text-center text-sm text-muted-foreground'>
              No results found on IGDB for this game and platform.
            </div>
          )}

          {!isLoading &&
            results.map((result, idx) => {
              const isSelected = selected === result;
              return (
                <button
                  key={idx}
                  className={`w-full flex gap-3 p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40 hover:bg-muted/30'
                  }`}
                  onClick={() => setSelected(result)}
                >
                  {/* Cover */}
                  <div className='shrink-0 w-16 h-20 rounded overflow-hidden bg-muted'>
                    {result.thumbnail ? (
                      <img
                        src={result.thumbnail}
                        alt={result.name}
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center text-xs text-muted-foreground'>
                        No image
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between gap-2'>
                      <span className='font-medium text-sm leading-snug'>{result.name}</span>
                      {isSelected && (
                        <CheckIcon className='size-4 text-primary shrink-0 mt-0.5' />
                      )}
                    </div>
                    <div className='text-xs text-muted-foreground mt-0.5'>
                      {[result.releaseDate, result.platforms].filter(Boolean).join(' · ')}
                    </div>
                    {result.description && (
                      <p className='text-xs text-muted-foreground mt-1.5 line-clamp-2'>
                        {result.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
        </div>

        {/* Footer */}
        <div className='border-t px-5 py-4 flex justify-end gap-2'>
          <Button variant='outline' onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleDone} disabled={!selected || isSaving}>
            {isSaving && <Loader2Icon className='size-4 animate-spin mr-2' />}
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}