import { RoomCode } from './RoomCode';
import { Title } from './components/Title';
import { ShareButton } from './components/ShareButton';
import { DestroyRoomButton } from './components/DestroyRoomButton';
import { ThemeToggleButton } from './components/ThemeToggleButton';
import { RoleBadge } from './components/RoleBadge';
import { OnlineStatusButton } from './components/OnlineStatusButton';
import { usePermission } from '@/shared/lib/hooks/usePermission';
// import { CodeExecutionButton } from './components/CodeExecutionButton';

type HeaderProps = {
  roomCode: string;
};

export default function Header({ roomCode }: HeaderProps) {
  const { role } = usePermission();

  return (
    <header className="border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex h-full min-w-0 flex-1 items-center">
          <Title />
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <RoleBadge role={role} />
          <RoomCode roomCode={roomCode} />
          <OnlineStatusButton />
          <ShareButton roomCode={roomCode} />
          <DestroyRoomButton />
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
}
