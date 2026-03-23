import { useEffect, type DragEvent } from 'react';
import { Header } from '@/widgets/header';
import { useSocket } from '@/shared/lib/hooks/useSocket';
import { useRoomJoin } from '@/shared/lib/hooks/useRoomJoin';
import { RadixToaster as Toaster } from '@codejam/ui';
import { useFileStore } from '@/stores/file';
import { useLoaderData } from 'react-router-dom';
import { ErrorDialog } from '@/widgets/dialog/ErrorDialog';
import { HostClaimRequestDialog } from '@/widgets/dialog/HostClaimRequestDialog';
import { PERMISSION, type RoomJoinStatus } from '@codejam/common';
import { usePermission } from '@/shared/lib/hooks/usePermission';
import { PrepareStage } from './PrepareStage';
import { useAwarenessSync } from '@/shared/lib/hooks/useAwarenessSync';
import { useInitialFileSelection } from '@/shared/lib/hooks/useInitialFileSelection';
import { useFileRename } from '@/shared/lib/hooks/useFileRename';
import { ConsolePanel as Output } from '@/widgets/console';
import { useDarkMode } from '@/shared/lib/hooks/useDarkMode';
import { Chat } from '@/widgets/chat';
import { RoomSidebar } from '@/widgets/room-sidebar';
import { ProviderAPI } from '@/contexts/ProviderAPI';
import { TabProvider } from '@/contexts/TabProvider';
import TabViewer from './TabViewer';
import { TabLayout } from './TabLayout';
import { GlobalShortcutHandler, ShortcutHUD } from '@/widgets/global-shortcuts';
import FileObserver from './FileObserver';

function RoomPage() {
  const {
    paramCode,
    isNicknameDialogOpen,
    isPasswordDialogOpen,
    setIsPasswordDialogOpen,
    setIsNicknameDialogOpen,
    passwordError,
    handleNicknameConfirm,
    handlePasswordConfirm,
  } = useRoomJoin();

  const { handleFileChange } = useFileRename(paramCode!);

  useAwarenessSync();
  useInitialFileSelection();

  const initialize = useFileStore((state) => state.initialize);
  const setActiveFile = useFileStore((state) => state.setActiveFile);
  const activeFileId = useFileStore((state) => state.activeFileId);
  const getFileName = useFileStore((state) => state.getFileName);

  const loader = useLoaderData<RoomJoinStatus>();

  useEffect(() => {
    if (!paramCode) return;
    initialize(paramCode);
  }, [paramCode, initialize]);

  useSocket(paramCode!);

  const { isDark } = useDarkMode();

  const { can } = usePermission();
  const canEdit = can(PERMISSION.EDIT_DOCS);

  const handleDragPrevent = (ev: DragEvent) => {
    ev.preventDefault();
  };

  const handleFileDrop = (ev: DragEvent) => {
    ev.preventDefault();
    const files = ev.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files);
    }
  };

  const convertProcessFn = (fileId: string) => {
    return {
      fileName: getFileName(fileId),
    };
  };

  const handleOnActiveTab = (_: number, key: string) => {
    setActiveFile(key);
  };

  return (
    <div
      className={`flex h-screen overflow-hidden transition-colors duration-500`}
    >
      <TabProvider>
        <ProviderAPI>
          <FileObserver />
          <RoomSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Header roomCode={paramCode!} />
            <div className="flex min-h-0 flex-1">
              <main className="flex min-h-0 flex-1">
                <GlobalShortcutHandler />
                <div
                  className="bg-background flex h-full min-h-0 flex-1 flex-col"
                  onDragOver={handleDragPrevent}
                  onDrop={handleFileDrop}
                >
                  <TabLayout
                    min={1}
                    max={2}
                    keyName="fileId"
                    convertProcessFn={convertProcessFn}
                    onCreateLinearTab={handleOnActiveTab}
                    onAppendLinearTab={handleOnActiveTab}
                    initialTabValue={{
                      key: activeFileId,
                      value: {
                        fileName: getFileName(activeFileId),
                      },
                    }}
                  >
                    {(tabKey: number) => (
                      <TabViewer tabKey={tabKey} readOnly={!canEdit} />
                    )}
                  </TabLayout>
                </div>
                <Chat />
                <Output variant={isDark ? 'dark' : 'light'} />
              </main>
            </div>
            {loader === 'FULL' ? (
              <ErrorDialog
                title="방이 가득 찼어요"
                description="현재 방에 참여할 수 있는 최대 인원에 도달했어요."
                buttonLabel="홈으로 돌아가기"
                onSubmit={() => {
                  window.location.href = '/';
                }}
              />
            ) : (
              <PrepareStage
                isNicknameDialogOpen={isNicknameDialogOpen}
                isPasswordDialogOpen={isPasswordDialogOpen}
                setIsNicknameDialogOpen={setIsNicknameDialogOpen}
                setIsPasswordDialogOpen={setIsPasswordDialogOpen}
                passwordError={passwordError}
                handleNicknameConfirm={handleNicknameConfirm}
                handlePasswordConfirm={handlePasswordConfirm}
              />
            )}
            <Toaster richColors position="top-center" />
            <HostClaimRequestDialog />
            <ShortcutHUD />
          </div>
        </ProviderAPI>
      </TabProvider>
    </div>
  );
}

export default RoomPage;
