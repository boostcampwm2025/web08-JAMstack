import { Button } from '@codejam/ui';
import { useSidebarStore } from '@/stores/sidebar';
import PolyPin from '@/assets/poly_pin.svg?react';
import PinOutline from '@/assets/pin-outline.svg?react';

export function PinButton() {
  const isPinned = useSidebarStore((state) => state.isPinned);
  const togglePin = useSidebarStore((state) => state.togglePin);

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={togglePin}
      title={isPinned ? '고정 해제' : '고정'}
    >
      {isPinned ? (
        <PolyPin className="size-5" />
      ) : (
        <PinOutline className="size-5" />
      )}
    </Button>
  );
}
