import { useEffect, useRef } from 'react';
import { FileIcon } from 'lucide-react';
import { extname } from '@/shared/lib/file';

import CIcon from '@/assets/exts/c.svg?react';
import CppIcon from '@/assets/exts/cpp.svg?react';
import JavaIcon from '@/assets/exts/java.svg?react';
import JavaScriptIcon from '@/assets/exts/javascript.svg?react';
import TypeScriptIcon from '@/assets/exts/typescript.svg?react';
import PythonIcon from '@/assets/exts/python.svg?react';

const iconMap: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  c: CIcon,
  cpp: CppIcon,
  java: JavaIcon,
  js: JavaScriptIcon,
  ts: TypeScriptIcon,
  py: PythonIcon,
};

const getFileIcon = (fileName: string) => {
  const extension = extname(fileName);
  if (!extension) return <FileIcon className="h-4 w-4 shrink-0" />;

  const Icon = iconMap[extension.toLowerCase()];
  return Icon ? (
    <Icon className="h-4 w-4 shrink-0" />
  ) : (
    <FileIcon className="h-4 w-4 shrink-0" />
  );
};

interface ChatMentionPopoverProps {
  isOpen: boolean;
  files: Array<{ name: string }>;
  selectedIndex: number;
  onSelectFile: (fileName: string) => void;
}

/**
 * 파일 멘션 자동완성 Popover
 * - @ 입력 시 파일 목록 표시
 * - 키보드 네비게이션 지원 (↑↓, Enter, Esc)
 */
export function ChatMentionPopover({
  isOpen,
  files,
  selectedIndex,
  onSelectFile,
}: ChatMentionPopoverProps) {
  const selectedRef = useRef<HTMLButtonElement>(null);

  // 선택된 항목으로 스크롤
  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [selectedIndex]);

  if (!isOpen || files.length === 0) return null;

  return (
    <div className="bg-popover text-popover-foreground absolute bottom-full left-0 z-50 mb-2 w-full rounded-lg border p-2.5 shadow-md">
      {/* 헤더 */}
      <div className="text-primary mb-2 text-xs font-medium">파일 선택</div>

      {/* 파일 목록 */}
      <div className="max-h-48 space-y-1 overflow-y-auto">
        {files.map(({ name: fileName }, index) => (
          <button
            key={fileName}
            ref={index === selectedIndex ? selectedRef : null}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelectFile(fileName)}
            className={`flex h-10 w-full cursor-pointer items-center gap-1.5 overflow-hidden px-2 text-left transition-all duration-200 ${
              index === selectedIndex
                ? 'bg-accent/80 text-primary rounded-sm'
                : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            {getFileIcon(fileName)}
            <span className="truncate text-sm" title={fileName}>
              {fileName}
            </span>
          </button>
        ))}
      </div>

      {/* 힌트 */}
      <div className="text-muted-foreground border-t pt-1 text-[11px] tracking-tight">
        ↑↓ 이동 · Enter 선택 · Esc 닫기
      </div>
    </div>
  );
}
