import { useState, memo, useEffect } from 'react';
import { Rnd, type ResizeEnable } from 'react-rnd';
import { useChatStore, type Position, type Size } from '@/stores/chat';
import { Button } from '@codejam/ui';
import { X } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { ChatInput } from './ChatInput';

const MIN_WIDTH = 280;
const MIN_HEIGHT = 200;
const DEFAULT_WIDTH = 340;
const DEFAULT_HEIGHT = 380;
const MARGIN_RIGHT = 0;
const MARGIN_BOTTOM = 72;
const VIEWPORT_PADDING = 20;

const DRAG_HANDLE_CLASSNAME = 'chat-drag-handle';
const ENABLE_RESIZING: ResizeEnable = {
  top: true,
  right: true,
  bottom: true,
  left: true,
  topRight: true,
  bottomRight: true,
  bottomLeft: true,
  topLeft: true,
};

/**
 * 채팅 패널 컴포넌트
 * - 드래그 및 리사이즈 가능
 * - 헤더 + 메시지 목록 + 입력창
 */
export function ChatPanel() {
  const { position, size, setPosition, setSize } = useChatPanelState();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <>
      <ChatBoundary />
      <DragOverlay isActive={isDragging} />

      <Rnd
        size={size}
        position={position}
        className="z-50"
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        bounds=".chat-boundary"
        dragHandleClassName={DRAG_HANDLE_CLASSNAME}
        cancel=".no-drag"
        enableResizing={ENABLE_RESIZING}
        onDragStart={() => {
          setIsDragging(true);
        }}
        onDragStop={(_e, d) => {
          setPosition({ x: d.x, y: d.y });
          setIsDragging(false);
        }}
        onResizeStop={(_e, _dir, ref, _delta, pos) => {
          setPosition(pos);
          setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
        }}
      >
        <div className="border-border bg-background ring-foreground/10 flex h-full w-full flex-col overflow-hidden rounded-lg shadow-lg ring-1">
          <ChatHeader />
          <ChatMessages />
          <ChatInput />
        </div>
      </Rnd>
    </>
  );
}

const ChatHeader = memo(function ChatHeader() {
  const setChatOpen = useChatStore((state) => state.setChatOpen);

  return (
    <div
      className={`${DRAG_HANDLE_CLASSNAME} border-border flex shrink-0 cursor-move items-center justify-between border-b px-3 py-2`}
    >
      <span className="text-foreground text-sm font-medium select-none">
        채팅
      </span>

      <Button
        variant="ghost"
        size="icon-xs"
        className="no-drag"
        onClick={() => setChatOpen(false)}
        aria-label="채팅 닫기"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
});

const ChatMessages = memo(function ChatMessages() {
  const messages = useChatStore((state) => state.messages);

  return (
    <div className="min-h-0 flex-1">
      <ChatWindow messages={messages} />
    </div>
  );
});

/**
 * 채팅 패널의 드래그/리사이즈 경계를 정의하는 컴포넌트
 * 레이아웃 시프트 방지를 위해 윈도우 뷰포트보다 작은 영역 제공
 */
function ChatBoundary() {
  return (
    <div
      className="chat-boundary pointer-events-none fixed z-40"
      style={{ inset: VIEWPORT_PADDING }}
    />
  );
}

/**
 * 드래그 중 이벤트를 차단하는 오버레이
 * Rnd 컴포넌트보다 뒤에 위치 (z-index)
 * 채팅 패널은 보이지만 하위 요소와의 상호작용을 차단
 */
function DragOverlay({ isActive }: { isActive: boolean }) {
  // Disable window drag while dragging
  useEffect(() => {
    if (!isActive) return;

    const originalUserSelect = document.body.style.userSelect;
    const originalPointerEvents = document.body.style.pointerEvents;

    const disableWindowDrag = () => {
      document.body.style.userSelect = 'none';
      document.body.style.pointerEvents = 'none';
    };

    const enableWindowDrag = () => {
      document.body.style.userSelect = originalUserSelect;
      document.body.style.pointerEvents = originalPointerEvents;
    };

    disableWindowDrag();
    return () => enableWindowDrag();
  }, [isActive]);

  if (!isActive) return null;

  // Block event propagation

  const handleEvent = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-40"
      onPointerDown={handleEvent}
      onPointerMove={handleEvent}
      onPointerUp={handleEvent}
      onClick={handleEvent}
      onDragStart={handleEvent}
      onDrag={handleEvent}
    />
  );
}

/**
 * 채팅 패널의 위치와 크기 상태 관리 훅
 * - 초기 위치/크기 계산
 * - 윈도우 리사이즈 시 경계 안으로 클램프
 */
function useChatPanelState() {
  const panelPosition = useChatStore((state) => state.panelPosition);
  const setPanelPosition = useChatStore((state) => state.setPanelPosition);
  const panelSize = useChatStore((state) => state.panelSize);
  const setPanelSize = useChatStore((state) => state.setPanelSize);

  // 초기 위치 및 크기 계산
  const position = panelPosition ?? getDefaultPosition();
  const size = panelSize ?? getDefaultSize();

  // 윈도우 리사이즈 시 패널을 경계 안으로 클램프
  useEffect(() => {
    const handleResize = () => {
      const clampedSize = clampSize(size);
      const clampedPosition = clampPosition(position, clampedSize);

      const sizeChanged =
        clampedSize.width !== size.width || clampedSize.height !== size.height;

      const posChanged =
        clampedPosition.x !== position.x || clampedPosition.y !== position.y;

      if (sizeChanged) setPanelSize(clampedSize);
      if (posChanged) setPanelPosition(clampedPosition);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, size, setPanelPosition, setPanelSize]);

  return {
    position,
    size,
    setPosition: setPanelPosition,
    setSize: setPanelSize,
  };
}

/**
 * 경계값 처리 로직
 */

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(value, max));
};

const clampPosition = (position: Position, size: Size) => {
  const maxX = window.innerWidth - VIEWPORT_PADDING - size.width;
  const maxY = window.innerHeight - VIEWPORT_PADDING - size.height;

  const clampedX = clamp(position.x, VIEWPORT_PADDING, maxX);
  const clampedY = clamp(position.y, VIEWPORT_PADDING, maxY);

  return { x: clampedX, y: clampedY };
};

const clampSize = (size: Size) => {
  const maxWidth = window.innerWidth - 2 * VIEWPORT_PADDING;
  const maxHeight = window.innerHeight - 2 * VIEWPORT_PADDING;

  const clampedWidth = clamp(size.width, MIN_WIDTH, maxWidth);
  const clampedHeight = clamp(size.height, MIN_HEIGHT, maxHeight);

  return { width: clampedWidth, height: clampedHeight };
};

/**
 * 채팅 패널의 기본 위치 계산
 */
function getDefaultPosition() {
  const size = getDefaultSize();
  const { innerWidth, innerHeight } = window;

  const x = innerWidth - size.width - VIEWPORT_PADDING - MARGIN_RIGHT;
  const y = innerHeight - size.height - VIEWPORT_PADDING - MARGIN_BOTTOM;
  const position = { x, y };

  return clampPosition(position, size);
}

/**
 * 채팅 패널의 기본 크기 계산
 */
function getDefaultSize() {
  return clampSize({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
}
