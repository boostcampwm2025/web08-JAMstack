import { useRef } from 'react';
import { createAvatarGenerator, AvvvatarsProvider, cn } from '@codejam/ui';
import { Pencil } from 'lucide-react';
import { adjustColor } from '@/shared/lib/utils/color';

import { PRESENCE } from '@codejam/common';
import type { Pt } from '@codejam/common';
import { ProfileBannerAnimation } from './ProfileBannerAnimation';
import { useNicknameEdit } from '../lib/hooks/useNicknameEdit';

const provider = new AvvvatarsProvider({ variant: 'shape' });
const { Avatar } = createAvatarGenerator(provider);

interface ProfileCardContentProps {
  me: Pt;
}

export function ProfileCardContent({ me }: ProfileCardContentProps) {
  const nickname = useNicknameEdit(me);
  const inputRef = useRef<HTMLInputElement>(null);

  const bannerBaseColor = adjustColor(me.color, -30);
  const bannerEndColor = adjustColor(me.color, -50);
  const bannerStyle = `linear-gradient(135deg, ${bannerBaseColor}, ${bannerEndColor})`;

  const handlePencilClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    nickname.handleClick();
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="bg-card ring-border relative overflow-hidden rounded-xl px-4 py-2 shadow-xl ring-1">
      <div
        className="absolute top-0 left-0 h-20 w-full overflow-hidden transition-colors"
        style={{ background: bannerStyle }}
      >
        <ProfileBannerAnimation />
      </div>

      <div className="b mt-12 flex flex-col gap-4">
        <div className="relative flex items-end justify-between">
          <div className="bg-card relative rounded-full">
            <Avatar
              id={me.ptHash}
              size={50}
              className="rounded-full shadow-xl"
              showOnline={me.presence === PRESENCE.ONLINE}
            />
          </div>

          <div>
            {me.ptHash && (
              <span className="border-border/50 bg-muted/50 text-muted-foreground rounded-md border p-1.5 py-0.5 font-mono text-[10px]">
                #{me.ptHash}
              </span>
            )}
          </div>
        </div>

        <div className="bg-muted/20">
          <h3 className="text-muted-foreground text-xs">사용자 이름</h3>
          <div className="flex min-w-0">
            <div
              onClick={nickname.isEditing ? undefined : nickname.handleClick}
              className={`group relative flex w-full items-center gap-2 ${
                nickname.isEditing ? '' : 'cursor-pointer'
              }`}
            >
              <input
                ref={inputRef}
                type="text"
                className={cn(
                  'bg-transparent text-lg font-semibold text-gray-900 outline-none dark:text-gray-100',
                  'border-b border-transparent transition-colors',
                  nickname.isEditing
                    ? 'border-muted-foreground field-sizing-content'
                    : 'group-hover:border-muted-foreground/50 pointer-events-none field-sizing-content truncate',
                )}
                value={nickname.isEditing ? nickname.value : me.nickname}
                onChange={nickname.handleChange}
                onKeyDown={nickname.handleKeyDown}
                onBlur={nickname.handleSubmit}
                readOnly={!nickname.isEditing}
                autoFocus={nickname.isEditing}
              />
              <Pencil
                onClick={handlePencilClick}
                className={cn(
                  'text-muted-foreground size-3.5 shrink-0 cursor-pointer',
                  nickname.isEditing
                    ? ''
                    : 'opacity-0 transition-opacity group-hover:opacity-100',
                )}
              />
              {nickname.error && (
                <span className="absolute -bottom-4 left-0 text-[10px] text-red-500">
                  {nickname.error}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="border-border/50 text-muted-foreground flex items-center justify-between border-t pt-2 text-[10px]">
          <span className="leading-0">THEME COLOR</span>
          <div className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-[2px] ring-1 ring-black/10 ring-inset dark:ring-white/20"
              style={{ backgroundColor: me.color }}
            />
            <span className="font-mono leading-0 uppercase">{me.color}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
