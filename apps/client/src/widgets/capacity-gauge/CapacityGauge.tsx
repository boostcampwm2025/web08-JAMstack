import { Progress, ProgressLabel, ProgressValue, cn } from '@codejam/ui';
import { useFileStore } from '@/stores/file';

function formatBytes(bytes: number): string {
  if (bytes < 1000) return `${bytes} bytes`;
  if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(1)} KB`;
  return `${(bytes / 1_000_000).toFixed(2)} MB`;
}

export function CapacityGauge() {
  const capacityPercentage = useFileStore((state) => state.capacityPercentage);
  const capacityBytes = useFileStore((state) => state.capacityBytes);
  const isOverLimit = useFileStore((state) => state.isOverLimit);

  const getIndicatorColor = () => {
    if (isOverLimit) return 'bg-brand-red';
    if (capacityPercentage >= 70) return 'bg-brand-orange';
    return 'bg-brand-blue';
  };

  return (
    <div className="group mt-1 select-none">
      <Progress
        value={capacityPercentage}
        className="flex flex-col gap-2"
        trackClassName="h-1.5 border-none"
        indicatorClassName={cn(
          'transition-all duration-500',
          getIndicatorColor(),
        )}
      >
        <div className="flex w-full items-center justify-between font-medium">
          <div className="flex items-center gap-1">
            <ProgressLabel className="text-muted-foreground text-xs">
              저장 용량
            </ProgressLabel>
            <ProgressValue
              className={cn(
                'ml-0 text-xs font-semibold',
                isOverLimit ? 'text-brand-red' : 'text-brand-blue',
              )}
            />
          </div>
          <span className="text-muted-foreground text-xs tabular-nums opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {formatBytes(capacityBytes)} / 1 MB
          </span>
        </div>
      </Progress>
    </div>
  );
}
