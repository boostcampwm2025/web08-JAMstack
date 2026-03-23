import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@codejam/ui';
import { AlertCircle } from 'lucide-react';
import { useFileStore } from '@/stores/file';
import { extname, purename } from '@/shared/lib/file';
import { uploadFile } from '@/shared/lib/file';

interface DuplicateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filename: string;
  onClick: () => void;
  file?: File;
  onOverwrite?: () => void;
  onAutoRename?: (newName: string) => void;
}

export function DuplicateDialog({
  open,
  onOpenChange,
  filename,
  onClick,
  file,
  onOverwrite,
  onAutoRename,
}: DuplicateDialogProps) {
  const overwriteFile = useFileStore((state) => state.overwriteFile);
  const createFile = useFileStore((state) => state.createFile);
  const getFileId = useFileStore((state) => state.getFileId);
  const getFileNamesMap = useFileStore((state) => state.getFileNamesMap);

  const generateAutoName = (): string => {
    const fileNamesMap = getFileNamesMap();
    if (!fileNamesMap) {
      return filename;
    }

    const ext = extname(filename);
    const baseName = purename(filename).replace(/ \(\d+\)$/, '');

    let maxNum = 0;
    for (const name of Object.keys(fileNamesMap.toJSON())) {
      if (extname(name) !== ext) continue;

      const pure = purename(name);
      if (pure === baseName) {
        // baseName 자체가 존재 → 최소 (1)이 필요
        maxNum = Math.max(maxNum, 0);
        continue;
      }

      const escaped = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const match = pure.match(new RegExp(`^${escaped} \\((\\d+)\\)$`));
      if (match) {
        maxNum = Math.max(maxNum, parseInt(match[1]));
      }
    }

    return `${baseName} (${maxNum + 1}).${ext}`;
  };

  const handleOverwrite = async () => {
    if (onOverwrite) {
      onOverwrite();
      onOpenChange(false);
      onClick();
      return;
    }

    const fileId = getFileId(filename);
    if (!fileId || !file) return;

    try {
      const { content, type } = await uploadFile(file);
      overwriteFile(fileId, content, type);
      onOpenChange(false);
      onClick();
    } catch (error) {
      console.error('Failed to overwrite file:', error);
    }
  };

  const handleRename = async () => {
    const name = generateAutoName();

    if (onAutoRename) {
      onAutoRename(name);
      onOpenChange(false);
      onClick();
      return;
    }

    const fileId = getFileId(filename);
    if (!fileId) return;

    if (!file) return;

    try {
      const { content, type } = await uploadFile(file);
      createFile(name, content, type);
      onOpenChange(false);
      onClick();
    } catch (error) {
      console.error('Failed to create file with new name:', error);
    }
  };

  const expectedName = generateAutoName();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
            <AlertCircle className="size-6" />
          </AlertDialogMedia>
          <AlertDialogTitle>파일 이름 중복</AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-1">
            <span>
              <strong className="text-primary">{filename}</strong> 파일이 이미
              존재해요.
            </span>
            <span className="text-muted-foreground">
              기존 파일을 덮어쓸까요, 아니면 이름을 바꿔서 사본으로 저장할까요?
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">취소</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleOverwrite}>
            덮어쓰기
          </AlertDialogAction>
          <Tooltip>
            <TooltipTrigger
              render={(props) => (
                <AlertDialogAction {...props} onClick={handleRename}>
                  사본으로 저장
                </AlertDialogAction>
              )}
            />
            <TooltipContent side="top">
              <p>
                새로운 파일명:{' '}
                <span className="font-semibold">{expectedName}</span>
              </p>
            </TooltipContent>
          </Tooltip>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
