import { LinearTabApiContext } from '@/contexts/ProviderAPI';
import { useFileStore } from '@/stores/file';
import { lazy, Suspense, useContext, useEffect, type MouseEvent } from 'react';
import { EmptyView } from './EmptyView';
import {
  ScrollArea,
  ScrollBar,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
  cn,
} from '@codejam/ui';
import { X, Play, FileIcon } from 'lucide-react';
import { ActiveTabContext } from '@/contexts/TabProvider';
import { useCodeExecutionStore } from '@/stores/code-execution';
import { emitExecuteCode } from '@/stores/socket-events';
import { extname, getPistonLanguage } from '@/shared/lib/file';
import { useSettings } from '@/shared/lib/hooks/useSettings';

import CIcon from '@/assets/exts/c.svg?react';
import CppIcon from '@/assets/exts/cpp.svg?react';
import JavaIcon from '@/assets/exts/java.svg?react';
import JavaScriptIcon from '@/assets/exts/javascript.svg?react';
import TypeScriptIcon from '@/assets/exts/typescript.svg?react';
import PythonIcon from '@/assets/exts/python.svg?react';

type TabViewerProps = {
  tabKey: number;
  readOnly: boolean;
};

type FileViewerTab = {
  [fileId: string]: {
    fileName: string;
  };
};

const FileContentViewer = lazy(() => import('./FileContentViewer'));

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

const getFileIcon = (fileName: string | null) => {
  if (!fileName) return <FileIcon className="h-3.5 w-3.5 shrink-0" />;

  const extension = extname(fileName);
  if (!extension) return <FileIcon className="h-3.5 w-3.5 shrink-0" />;

  const Icon = iconMap[extension.toLowerCase()];
  return Icon ? (
    <Icon className="h-3.5 w-3.5 shrink-0" />
  ) : (
    <FileIcon className="h-3.5 w-3.5 shrink-0" />
  );
};

export default function TabViewer({ tabKey, readOnly }: TabViewerProps) {
  const { takeTab, removeLinear, deleteLinearTab, tabKeys } =
    useContext(LinearTabApiContext);
  const { activeTab, setActiveTab } = useContext(ActiveTabContext);
  const setActiveFileId = useFileStore((state) => state.setActiveFile);
  const getFileName = useFileStore((state) => state.getFileName);
  const isExecuting = useCodeExecutionStore((state) => state.isExecuting);
  const { streamCodeExecutionOutput } = useSettings();

  useFileStore((state) => state.files);

  const fileTab = takeTab(tabKey) as FileViewerTab;

  useEffect(() => {
    const updated = takeTab(tabKey) as FileViewerTab;
    const keys = Object.keys(updated);
    if (keys.length > 0) {
      setActiveFileId(activeTab[activeTab.active]);
    }
  }, [activeTab]);

  const handleDeleteTab = (fileId: string) => {
    removeLinear(tabKey, fileId);
    const deleted = takeTab(tabKey) as FileViewerTab;
    const keys = Object.keys(deleted);

    if (keys.length === 1 && tabKeys().length > 1) {
      deleteLinearTab(tabKey);
      return;
    }

    if (keys.length === 1 && tabKeys().length === 1) {
      setActiveFileId(null);
      return;
    }
  };

  const handleExecuteCode = (fileId: string) => {
    const fileName = getFileName(fileId);

    if (!fileName) {
      toast.error('파일 이름을 가져올 수 없습니다.');
      return;
    }

    const extension = extname(fileName);
    if (!extension) {
      toast.error('파일 확장자를 찾을 수 없습니다.');
      return;
    }

    const language = getPistonLanguage(extension);
    if (!language) {
      toast.error('코드 실행을 지원하지 않는 파일입니다.');
      return;
    }

    if (isExecuting) {
      toast.warning('코드가 이미 실행 중입니다.');
      return;
    }

    emitExecuteCode(fileId, language, streamCodeExecutionOutput);
  };

  const handleValueChange = (fileId: string) => {
    setActiveTab(tabKey, fileId);
  };

  const isFileExecutable = (fileId: string): boolean => {
    const fileName = getFileName(fileId);
    if (!fileName) return false;

    const extension = extname(fileName);
    if (!extension) return false;

    const language = getPistonLanguage(extension);
    return !!language;
  };

  const myTabs = Object.keys(fileTab);

  const isSplitActive = activeTab.active === tabKey;

  return (
    <Tabs
      value={activeTab[tabKey]}
      onValueChange={handleValueChange}
      data-active={isSplitActive}
      className="flex min-h-0 w-full flex-1 overflow-y-hidden"
    >
      <ScrollArea>
        <TabsList variant="line">
          {myTabs.map((fileId) => (
            <TabsTrigger
              key={fileId}
              value={fileId}
              className="group flex gap-1.5 p-1 pb-0"
            >
              {getFileIcon(getFileName(fileId) || fileTab[fileId].fileName)}
              <span className="inline-block flex-1">
                {getFileName(fileId) ? (
                  getFileName(fileId)
                ) : (
                  <span className="text-red-400 italic line-through">
                    {fileTab[fileId].fileName}
                  </span>
                )}
              </span>
              <div className="flex items-center">
                {isFileExecutable(fileId) && (
                  <span
                    role="button"
                    tabIndex={0}
                    className={cn(
                      'hover:bg-accent inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm opacity-60 transition-colors hover:opacity-100',
                    )}
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation();
                      handleExecuteCode(fileId);
                    }}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleExecuteCode(fileId);
                      }
                    }}
                  >
                    <Play className="h-3 w-3" />
                  </span>
                )}
                <span
                  role="button"
                  tabIndex={0}
                  className={cn(
                    'hover:bg-accent inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm opacity-60 transition-colors hover:opacity-100',
                  )}
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    handleDeleteTab(fileId);
                  }}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteTab(fileId);
                    }
                  }}
                >
                  <X className="h-3 w-3" />
                </span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {myTabs.length > 0 ? (
        myTabs.map((fileId) => (
          <TabsContent
            key={fileId}
            value={fileId}
            className="flex min-h-0 flex-1 flex-col"
          >
            {activeTab[tabKey] == fileId ? (
              getFileName(fileId) ? (
                <Suspense fallback={null}>
                  <FileContentViewer fileId={fileId} readOnly={readOnly} />
                </Suspense>
              ) : (
                <EmptyView deleted />
              )
            ) : null}
          </TabsContent>
        ))
      ) : (
        <EmptyView />
      )}
    </Tabs>
  );
}
