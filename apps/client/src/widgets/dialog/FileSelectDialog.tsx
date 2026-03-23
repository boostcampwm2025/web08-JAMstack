import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@codejam/ui';
import { useFileStore } from '@/stores/file';
import type { FileMetadata } from '@/shared/lib/collaboration';
import { FileIcon } from 'lucide-react';
import { extname } from '@/shared/lib/file';

import CIcon from '@/assets/exts/c.svg?react';
import CppIcon from '@/assets/exts/cpp.svg?react';
import JavaIcon from '@/assets/exts/java.svg?react';
import JavaScriptIcon from '@/assets/exts/javascript.svg?react';
import TypeScriptIcon from '@/assets/exts/typescript.svg?react';
import PythonIcon from '@/assets/exts/python.svg?react';

type FileSelectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFile: (fileId: string) => void;
};

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

export function FileSelectDialog({
  open,
  onOpenChange,
  onSelectFile,
}: FileSelectDialogProps) {
  const files = useFileStore((state) => state.files);

  const handleSelect = (fileId: string) => {
    onSelectFile(fileId);
    onOpenChange(false);
  };

  const getFileIcon = (fileName: string) => {
    const extension = extname(fileName);
    if (!extension) return <FileIcon />;

    const Icon = iconMap[extension.toLowerCase()];
    return Icon ? <Icon /> : <FileIcon />;
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput placeholder="파일 검색..." />
        <CommandList>
          <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
          <CommandGroup heading="파일">
            {files.map((file: FileMetadata) => (
              <CommandItem
                key={file.id}
                onSelect={() => handleSelect(file.id)}
                className="hover:data-[selected=false]:bg-muted/50 data-[selected=false]:bg-transparent"
              >
                {getFileIcon(file.name)}
                <span>{file.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
