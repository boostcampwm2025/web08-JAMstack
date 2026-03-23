import type { PtRole } from '@codejam/common';
import { cn } from '@codejam/ui';
import { ROLE_BADGE_STYLES } from '@/widgets/participants/lib/types';

interface RoleBadgeProps {
  role?: PtRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  if (!role) return null;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center gap-2 rounded-full px-2.5 py-2',
        ROLE_BADGE_STYLES[role],
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current leading-0" />
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current leading-0 opacity-75" />
      </span>
      <span className="z-10 text-[10px] leading-0 font-bold uppercase select-none">
        {role.toUpperCase()}
      </span>
    </div>
  );
}
