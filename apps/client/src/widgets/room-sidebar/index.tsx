import { useState } from 'react';
import { cn } from '@codejam/ui';
import { Participants } from '@/widgets/participants';
import { FileList } from '@/widgets/files';
import { SidebarButton } from './components/SidebarButton';
import { MoreTabContent } from './components/MoreTabContent';
import { SETTINGS_TAB, SIDEBAR_TABS } from './lib/sidebar-data';
import { SidebarProfile } from './components/SidebarProfile';
import { SidebarPanel } from './components/SidebarPanel';
import { SettingsTabContent } from './components/SettingsTabContent';
import { DoorOpen } from 'lucide-react';
import { LeaveRoomDialog } from '../dialog/LeaveRoomDialog';
import { emitLeftRoom } from '@/stores/socket-events/room';
import { Logo } from './components/Logo';
import { useSidebarStore } from '@/stores/sidebar';

export function RoomSidebar({ className }: { className?: string }) {
  const { activeSidebarTab, isPinned, toggleSidebarTab } = useSidebarStore();
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  const isOpen = activeSidebarTab !== null || isPinned;
  const visibleTab = activeSidebarTab ?? (isPinned ? 'FILES' : null);

  return (
    <div className={cn('flex', className)}>
      <nav className="bg-muted/10 z-10 flex w-16 flex-col items-center gap-2 border-r p-4">
        <Logo />

        {SIDEBAR_TABS.map((tab) => (
          <SidebarButton
            key={tab.id}
            isActive={visibleTab === tab.id}
            onClick={() => toggleSidebarTab(tab.id)}
            icon={tab.icon}
            label={tab.label}
          />
        ))}

        <div className="mt-auto flex w-full flex-col items-center gap-2">
          <SidebarButton
            key={SETTINGS_TAB.id}
            isActive={visibleTab === SETTINGS_TAB.id}
            onClick={() => toggleSidebarTab(SETTINGS_TAB.id)}
            icon={SETTINGS_TAB.icon}
            label={SETTINGS_TAB.label}
          />
          <SidebarButton
            onClick={() => setIsLeaveDialogOpen(true)}
            icon={<DoorOpen size={22} />}
            label="나가기"
          />

          <div className="h-1" />
          <SidebarProfile />
          <div className="h-1" />
        </div>
      </nav>
      <SidebarPanel isOpen={isOpen}>
        {visibleTab === 'PARTICIPANTS' && <Participants />}
        {visibleTab === 'FILES' && <FileList />}
        {visibleTab === 'MORE' && <MoreTabContent />}
        {visibleTab === 'SETTINGS' && <SettingsTabContent />}
      </SidebarPanel>

      <LeaveRoomDialog
        open={isLeaveDialogOpen}
        onOpenChange={setIsLeaveDialogOpen}
        onConfirm={emitLeftRoom}
      />
    </div>
  );
}
