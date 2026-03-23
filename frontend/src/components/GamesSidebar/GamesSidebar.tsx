import { RotateCwIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { triggerRescan } from '@/api/api';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface IGamesSidebar {
  platforms: string[];
}

function platformToId(platform: string): string {
  return platform.toLowerCase().replace(/\s+/g, '-');
}

function GamesSidebar({ platforms }: IGamesSidebar) {
  // 4. State
  const [isRescanning, setIsRescanning] = useState(false);

  // 7. Event handlers
  async function handleRescan() {
    setIsRescanning(true);
    await triggerRescan();
    setIsRescanning(false);
    toast.success('Rescan complete');
  }

  function handlePlatformClick(platform: string) {
    const id = platformToId(platform);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // 9. Main return
  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='flex flex-row items-center gap-2 py-3'>
        <SidebarTrigger />
        <span className='font-semibold text-sm truncate group-data-[collapsible=icon]:hidden'>
          Games Library
        </span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platforms</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platforms.map((platform) => (
                <SidebarMenuItem key={platform}>
                  <SidebarMenuButton
                    onClick={() => handlePlatformClick(platform)}
                    tooltip={platform}
                  >
                    <span>{platform}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Separator />
        <Button
          variant='ghost'
          className='w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2'
          onClick={handleRescan}
          disabled={isRescanning}
        >
          <RotateCwIcon
            className={`size-4 shrink-0 ${isRescanning ? 'animate-spin' : ''}`}
          />
          <span className='group-data-[collapsible=icon]:hidden'>Rescan</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default GamesSidebar;
