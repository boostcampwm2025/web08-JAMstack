import { cn } from '@/lib/utils';
import { Button } from '../base/button';
import type { ReactNode } from 'react';

interface SidebarHeaderProps {
  title: string;
  count?: number;
  action?: ReactNode;
  className?: string;
}

export function SidebarHeader({
  title,
  count,
  action,
  className,
}: SidebarHeaderProps) {
  return (
    <div className={cn('flex h-6 items-center justify-between', className)}>
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
        <h2 className="text-sm font-bold tracking-wide uppercase">{title}</h2>
        {count !== undefined && (
          <Button
            size="xs"
            variant="secondary"
            className="rounded-full text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          >
            {count}
          </Button>
        )}
      </div>
      {action && <div className="flex items-center">{action}</div>}
    </div>
  );
}
