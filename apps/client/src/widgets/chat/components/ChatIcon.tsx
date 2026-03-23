import { MessageCircle } from 'lucide-react';
import { Button } from '@codejam/ui';

type ChatIconProps = {
  unreadCount: number;
  onClick: () => void;
};

/**
 * 플로팅 채팅 아이콘 버튼
 * - 우측 하단 고정 위치
 * - 읽지 않은 메시지 배지 표시
 */
export function ChatIcon({ unreadCount, onClick }: ChatIconProps) {
  return (
    <div className="fixed right-5 bottom-5 z-50">
      <Button
        onClick={onClick}
        className="relative h-16 w-16 rounded-full shadow-lg transition-transform duration-150 ease-out hover:scale-[1.08] active:scale-[0.96]"
        aria-label="채팅 열기"
      >
        <MessageCircle className="size-6" />
        {unreadCount > 0 && (
          <span className="bg-destructive absolute top-1 -right-1.5 flex h-5 min-w-5 items-center rounded-full px-1.5 text-xs font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>
    </div>
  );
}
