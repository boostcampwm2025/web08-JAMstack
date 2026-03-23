import { cn } from '@codejam/ui';
import { useFileStore } from '@/stores/file';
import { memo, useState, type DragEvent, type MouseEvent } from 'react';
import { DeleteDialog } from '@/widgets/dialog/DeleteDialog';
import { DuplicateDialog } from '@/widgets/dialog/DuplicateDialog';
import { FileMoreMenu } from './FileMoreMenu';
import { InlineFileInput } from './InlineFileInput';
import { FileIcon } from 'lucide-react';
import { extname } from '@/shared/lib/file';

import CIcon from '@/assets/exts/c.svg?react';
import CppIcon from '@/assets/exts/cpp.svg?react';
import JavaIcon from '@/assets/exts/java.svg?react';
import JavaScriptIcon from '@/assets/exts/javascript.svg?react';
import TypeScriptIcon from '@/assets/exts/typescript.svg?react';
import PythonIcon from '@/assets/exts/python.svg?react';

type DialogType = 'RENAME' | 'DELETE' | undefined;
type FileProps = {
  fileId: string;
  fileName: string;
  hasPermission: boolean;
};

const ACTIVE_FILE_BG = 'bg-accent/80 text-primary rounded-sm';
const INACTIVE_FILE_HOVER =
  'hover:bg-muted/60 text-muted-foreground hover:text-foreground rounded-lg';

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

export const File = memo(({ fileId, fileName, hasPermission }: FileProps) => {
  const setActiveFile = useFileStore((state) => state.setActiveFile);
  const activeFileId = useFileStore((state) => state.activeFileId);
  const renameFile = useFileStore((state) => state.renameFile);
  const getFileId = useFileStore((state) => state.getFileId);
  const overwriteFile = useFileStore((state) => state.overwriteFile);
  const deleteFile = useFileStore((state) => state.deleteFile);
  const getFileContent = useFileStore((state) => state.getFileContent);
  const getFileType = useFileStore((state) => state.getFileType);

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const [open, setOpen] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType>(undefined);
  const [isRenaming, setIsRenaming] = useState(false);
  const [duplicateTarget, setDuplicateTarget] = useState<string | null>(null);

  const isActive = activeFileId === fileId;

  const handleClick = () => {
    setActiveFile(fileId);
  };

  const handleActionClick = (type: DialogType) => {
    if (type === 'RENAME') {
      setIsRenaming(true);
      return;
    }
    setDialogType(type);
    setOpen(true);
  };

  const handleRenameSubmit = (newFileName: string) => {
    if (fileName === newFileName) {
      setIsRenaming(false);
      return;
    }

    if (getFileId(newFileName)) {
      setDuplicateTarget(newFileName);
      setIsRenaming(false);
      return;
    }

    renameFile(fileId, newFileName);
  };

  // 중복 모달에서 "덮어쓰기" 선택: 충돌 파일의 내용을 현재 파일 내용으로 덮어쓰고 현재 파일 삭제
  const handleOverwrite = () => {
    if (!duplicateTarget) return;
    const targetId = getFileId(duplicateTarget);
    if (!targetId) return;

    const content = getFileContent(fileId) ?? '';
    const type = getFileType(fileId);
    overwriteFile(targetId, content, type ?? undefined);
    deleteFile(fileId);
    setDuplicateTarget(null);
  };

  // 중복 모달에서 "사본으로 저장" 선택: 자동 생성된 이름으로 현재 파일 rename
  const handleAutoRename = (newName: string) => {
    renameFile(fileId, newName);
    setDuplicateTarget(null);
  };

  const handleDragStart = (ev: DragEvent) => {
    ev.dataTransfer.setData(
      'application/json',
      JSON.stringify({ fileName, fileId }),
    );
  };

  const onMouseDown = (ev: MouseEvent) => {
    setX(ev.clientX);
    setY(ev.clientY);
  };

  const onMouseUp = (ev: MouseEvent) => {
    const dx = Math.abs(ev.clientX - x);
    const dy = Math.abs(ev.clientY - y);

    if (dx < 5 && dy < 5) {
      handleClick();
    }
  };

  if (isRenaming) {
    return (
      <InlineFileInput
        initialValue={fileName}
        onSubmit={handleRenameSubmit}
        onCancel={() => setIsRenaming(false)}
      />
    );
  }

  return (
    <>
      <div
        draggable
        className={cn(
          'group relative mt-1 flex h-10 cursor-pointer items-center justify-between px-2 transition-all duration-200 select-none',
          isActive ? ACTIVE_FILE_BG : INACTIVE_FILE_HOVER,
        )}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onDragStart={handleDragStart}
      >
        <div className="flex w-full items-center gap-1.5 overflow-hidden">
          {getFileIcon(fileName)}
          <span className="truncate text-sm" title={fileName}>
            {fileName}
          </span>
        </div>

        {/* 더보기 액션 버튼 */}
        {hasPermission && (
          <FileMoreMenu
            fileId={fileId}
            fileName={fileName}
            isActive={isActive}
            onActionClick={handleActionClick}
          />
        )}
      </div>

      <DeleteDialog
        fileId={fileId}
        fileName={fileName}
        open={open && dialogType === 'DELETE'}
        onOpenChange={setOpen}
      />

      {duplicateTarget && (
        <DuplicateDialog
          open={!!duplicateTarget}
          onOpenChange={(isOpen) => !isOpen && setDuplicateTarget(null)}
          filename={duplicateTarget}
          onClick={() => {}}
          onOverwrite={handleOverwrite}
          onAutoRename={handleAutoRename}
        />
      )}
    </>
  );
});

File.displayName = 'FileList';
