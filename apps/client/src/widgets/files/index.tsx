import { ROLE } from '@codejam/common';
import { useFileStore } from '@/stores/file';
import { File } from './components/File';
import { useRoomStore } from '@/stores/room';
import { usePt } from '@/stores/pts';
import { useMemo, useState } from 'react';
import { SidebarHeader, toast } from '@codejam/ui';
import { CapacityGauge } from '../capacity-gauge';
import { FileHeaderActions } from './components/FileHeaderActions';
import { FileSortControls } from './components/FileSortControls';
import type { FileSortKey } from './lib/types';
import { filterFiles, sortFiles } from './lib/file-logic';
import { FileFilterBar } from './components/FileFilterBar';
import type { FileMetadata } from '@/shared/lib/collaboration';
import { InlineFileInput } from './components/InlineFileInput';
import { useFileRename } from '@/shared/lib/hooks/useFileRename';
import { DuplicateDialog } from '@/widgets/dialog/DuplicateDialog';
import { PinButton } from '@/widgets/room-sidebar/components/PinButton';

export function FileList() {
  const files = useFileStore((state) => state.files);
  const roomCode = useRoomStore((state) => state.roomCode);
  const getFileId = useFileStore((state) => state.getFileId);
  const createFile = useFileStore((state) => state.createFile);
  const setActiveFile = useFileStore((state) => state.setActiveFile);
  const overwriteFile = useFileStore((state) => state.overwriteFile);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<FileSortKey>('name-asc');
  const [isCreatingNewFile, setIsCreatingNewFile] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{ name: string } | null>(
    null,
  );

  const { handleCheckRename } = useFileRename(roomCode);

  const myPtId = useRoomStore((state) => state.myPtId);
  const me = usePt(myPtId);
  const hasPermission = me?.role === ROLE.HOST || me?.role === ROLE.EDITOR;

  const processedFiles = useMemo(() => {
    const filtered = filterFiles(files, searchQuery);
    return sortFiles(filtered, sortKey);
  }, [files, searchQuery, sortKey]);

  const handleStartCreate = () => setIsCreatingNewFile(true);
  const handleCancelCreate = () => setIsCreatingNewFile(false);

  const handleSubmitCreate = (filename: string) => {
    if (!filename.trim()) {
      toast.error('파일명을 입력하세요');
      return;
    }

    if (getFileId(filename)) {
      setDuplicateInfo({ name: filename });
      setIsCreatingNewFile(false);
      return;
    }

    const isValid = handleCheckRename(filename);
    if (!isValid) return;

    const fileId = createFile(filename, '');
    setActiveFile(fileId);
    setIsCreatingNewFile(false);
  };

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <HeaderSection
        count={processedFiles.length}
        roomCode={roomCode}
        hasPermission={hasPermission}
        onCreateClick={handleStartCreate}
      />
      <FilterSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortKey={sortKey}
        onSortChange={setSortKey}
      />
      <Divider />
      <div className="scrollbar-hide -mt-1 flex-1 overflow-y-auto">
        {isCreatingNewFile && (
          <InlineFileInput
            onSubmit={handleSubmitCreate}
            onCancel={handleCancelCreate}
          />
        )}
        <FileItems
          files={processedFiles}
          hasPermission={hasPermission}
          searchQuery={searchQuery}
        />
      </div>
      <Divider />
      <GaugeSection />

      {duplicateInfo && (
        <DuplicateDialog
          open={!!duplicateInfo}
          onOpenChange={(open) => !open && setDuplicateInfo(null)}
          filename={duplicateInfo.name}
          onClick={() => {}}
          onOverwrite={() => {
            const existingId = getFileId(duplicateInfo.name);
            if (existingId) {
              overwriteFile(existingId, '');
              setActiveFile(existingId);
            }
            setDuplicateInfo(null);
          }}
          onAutoRename={(newName) => {
            const fileId = createFile(newName, '');
            setActiveFile(fileId);
            setDuplicateInfo(null);
          }}
        />
      )}
    </div>
  );
}

function Divider() {
  return <div className="border-b border-gray-200 dark:border-gray-700" />;
}

function HeaderSection({
  count,
  roomCode,
  hasPermission,
  onCreateClick,
}: {
  count: number;
  roomCode: string | null;
  hasPermission: boolean;
  onCreateClick: () => void;
}) {
  return (
    <SidebarHeader
      title="파일"
      count={count}
      action={
        <>
          {roomCode && hasPermission && (
            <FileHeaderActions onCreateClick={onCreateClick} />
          )}
          <PinButton />
        </>
      }
    />
  );
}

function FilterSection({
  searchQuery,
  onSearchChange,
  sortKey,
  onSortChange,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortKey: FileSortKey;
  onSortChange: (key: FileSortKey) => void;
}) {
  return (
    <FileFilterBar
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      sortControls={
        <FileSortControls sortKey={sortKey} onSortChange={onSortChange} />
      }
    />
  );
}

function FileItems({
  files,
  hasPermission,
  searchQuery,
}: {
  files: FileMetadata[];
  hasPermission: boolean;
  searchQuery: string;
}) {
  return (
    <>
      {files.length > 0 ? (
        <div className="flex flex-col gap-0.5">
          {files.map((file) => (
            <File
              key={file.id}
              fileId={file.id}
              fileName={file.name}
              hasPermission={hasPermission}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-40 flex-col items-center justify-center text-center">
          <p className="text-muted-foreground text-sm">
            {searchQuery ? '검색 결과가 없습니다.' : '파일이 없습니다.'}
          </p>
        </div>
      )}
    </>
  );
}

function GaugeSection() {
  return <CapacityGauge />;
}
