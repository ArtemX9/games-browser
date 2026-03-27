import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'games-browser:collapsed-platforms';

function readCollapsedState(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function writeCollapsedState(state: Record<string, boolean>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

interface IPlatformSection {
  platform: string;
  gameCount: number;
  sectionId: string;
  children: React.ReactNode;
}

function PlatformSection({ platform, gameCount, sectionId, children }: IPlatformSection) {
  // 4. State
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    const stored = readCollapsedState();
    // Default open; only collapsed if explicitly stored as collapsed
    return stored[platform] !== true;
  });

  // 7. Event handlers
  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    const stored = readCollapsedState();
    if (open) {
      delete stored[platform];
    } else {
      stored[platform] = true;
    }
    writeCollapsedState(stored);
  }

  // 9. Main return
  return (
    <Collapsible open={isOpen} onOpenChange={handleOpenChange} asChild>
      <section id={sectionId} className='mb-14 scroll-mt-4'>
        <CollapsibleTrigger asChild>
          <button className='flex items-center gap-3 mb-6 w-full text-left group cursor-pointer bg-transparent border-0 p-0'>
            <h2 className='text-2xl md:text-3xl font-semibold tracking-tight'>{platform}</h2>
            <Badge variant='secondary' className='text-base px-3 py-1'>
              {gameCount}
            </Badge>
            <ChevronDownIcon
              className={cn(
                'size-5 text-muted-foreground ml-auto shrink-0 transition-transform duration-300',
                isOpen ? 'rotate-0' : '-rotate-90',
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className='collapsible-content'>
          <div className='collapsible-content-inner'>{children}</div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

export default PlatformSection;
