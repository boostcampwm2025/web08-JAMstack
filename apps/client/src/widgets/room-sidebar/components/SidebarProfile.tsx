import { Popover, PopoverTrigger, PopoverContent } from '@codejam/ui';
import { usePt } from '@/stores/pts';
import { useRoomStore } from '@/stores/room';
import { createAvatarGenerator, AvvvatarsProvider } from '@codejam/ui';
import { ProfileCardContent } from './ProfileCardContent';
import { PRESENCE } from '@codejam/common';

const provider = new AvvvatarsProvider({ variant: 'shape' });
const { Avatar } = createAvatarGenerator(provider);

export function SidebarProfile() {
  const { myPtId } = useRoomStore();
  const me = usePt(myPtId);

  if (!myPtId || !me) {
    return <div className="bg-muted/50 h-10 w-10 animate-pulse rounded-full" />;
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            className="group relative flex h-12 w-12 items-center justify-center rounded-2xl outline-none"
            title="설정 및 프로필"
          >
            <div className="transition-transform duration-150 ease-out group-hover:scale-[1.08] group-active:scale-[0.96]">
              <Avatar
                id={me.ptHash}
                size={40}
                showOnline={me.presence === PRESENCE.ONLINE}
              />
            </div>
          </button>
        }
      />
      <PopoverContent
        side="right"
        align="end"
        sideOffset={17}
        className="border-none bg-transparent p-0 shadow-none"
      >
        <ProfileCardContent me={me} />
      </PopoverContent>
    </Popover>
  );
}
