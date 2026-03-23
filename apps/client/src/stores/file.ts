import { create } from 'zustand';
import { Doc, Map as YMap } from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import { SOCKET_EVENTS, LIMITS, type FileType } from '@codejam/common';
import { useSocketStore } from './socket';
import { emitAwarenessUpdate, emitFileUpdate } from './socket-events';
import {
  createCollaborationContext,
  YDocManager,
  AwarenessManager,
  FileManager,
  type FileMetadata,
  type DocMetadata,
} from '@/shared/lib/collaboration';

/**
 * Throttle function to limit execution frequency
 * @param func - Function to throttle
 * @param wait - Wait time in milliseconds
 * @returns Throttled function
 */
export function throttle<TArgs extends unknown[], TReturn = void>(
  func: (...args: TArgs) => TReturn,
  wait: number,
): (...args: TArgs) => void {
  let timeout: number | null = null;
  let previous = 0;

  return function (...args: TArgs) {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  };
}

interface FileState {
  yDoc: Doc | null;
  awareness: Awareness | null;

  yDocManager: YDocManager | null;
  awarenessManager: AwarenessManager | null;
  fileManager: FileManager | null;

  activeFileId: string | null;
  viewerFileId: string | null;
  isInitialized: boolean;
  isInitialDocLoaded: boolean;

  // Document metadata
  docMeta: DocMetadata | null;

  // File metadata
  files: FileMetadata[];

  // 업로드 파일
  tempFiles: File[];

  // Capacity State (용량 측정)
  capacityBytes: number;
  capacityPercentage: number;
  isOverLimit: boolean;

  // Actions
  initialize: (roomCode: string) => number;
  sync: (roomCode: string) => void;
  destroy: () => void;
  setActiveFile: (fileId: string | null) => void;
  setViewerFile: (fileId: string) => void;
  initializeDefaultFile: () => void;
  initializeActiveFile: () => void;
  applyRemoteDocSnapshot: (snapshot: Uint8Array, updates: Uint8Array[]) => void;
  applyRemoteDocUpdate: (message: Uint8Array) => void;
  applyRemoteAwarenessUpdate: (message: Uint8Array) => void;
  measureCapacity: () => number;

  // CRUD Actions
  addTempFile: (file: File) => void;
  shiftTempFile: () => void;
  clearTempFile: () => void;
  createFile: (name: string, content?: string, type?: FileType) => string;
  deleteFile: (fileId: string) => void;
  renameFile: (fileId: string, newName: string) => void;
  overwriteFile: (fileId: string, content: string, type?: FileType) => void;
  getFileId: (name: string) => string | null;
  getTempFiles: () => File[];
  getFilesMap: () => YMap<YMap<unknown>> | null;
  getFileNamesMap: () => YMap<string> | null;

  getFileName: (fileId: string | null) => string | null;
  getFileContent: (fileId: string) => string | null;
  getFileType: (fileId: string) => FileType | null;
  getActiveFileContent: () => string | null;
}

export const useFileStore = create<FileState>((set, get) => ({
  yDoc: null,
  awareness: null,

  yDocManager: null,
  awarenessManager: null,
  fileManager: null,

  activeFileId: null,
  viewerFileId: null,
  isInitialized: false,
  isInitialDocLoaded: false,

  docMeta: null,
  files: [],
  tempFiles: [],

  // Capacity State 초기값
  capacityBytes: 0,
  capacityPercentage: 0,
  isOverLimit: false,

  initialize: (roomCode: string) => {
    const state = get();
    if (state.isInitialized) {
      return state.yDoc!.clientID;
    }

    // Create collaboration context
    const { yDoc, awareness, yDocManager, awarenessManager, fileManager } =
      createCollaborationContext();

    // Setup YDoc update listener
    yDocManager.onUpdate((update, origin) => {
      // Skip remote updates
      if (origin === 'remote') return;

      const { isConnected } = useSocketStore.getState();
      if (!isConnected || !roomCode) return;

      emitFileUpdate(roomCode, update);
    });

    // Setup awareness update listener with 100ms throttle
    awarenessManager.onUpdate((update, origin) => {
      // Skip remote updates
      if (origin === 'remote') return;

      const { isConnected, roomCode } = useSocketStore.getState();
      if (!isConnected || !roomCode) return;

      emitAwarenessUpdate(roomCode, update);
    });

    // Measure capacity on files updates
    fileManager.onFilesChange(() => {
      get().measureCapacity();
    });

    // Setup file changes listener
    fileManager.onFilesMetadataChange(() => {
      const { activeFileId } = get();
      if (!activeFileId) return;

      // Check if active file still exists
      if (!fileManager.getFileNode(activeFileId)) {
        set({ activeFileId: null });
      }
    });

    // Setup document metadata listener
    fileManager.onDocMetadataChange(() => {
      const docMeta = fileManager.getDocMetadata();
      set({ docMeta });
    });

    // Setup file metadata listener
    fileManager.onFilesMetadataChange(() => {
      const metadata = fileManager.getFileTree();

      set({ files: metadata });
    });

    // Save managers and instances
    set({
      yDoc,
      yDocManager,
      awareness,
      awarenessManager,
      fileManager,
      isInitialized: true,
    });

    return yDoc.clientID;
  },

  sync: (roomCode: string) => {
    const { awarenessManager, isInitialized } = get();
    if (!isInitialized) return;

    const { send, isConnected } = useSocketStore.getState();
    if (!isConnected) return;

    send(SOCKET_EVENTS.REQUEST_DOC);
    send(SOCKET_EVENTS.REQUEST_AWARENESS);

    if (!awarenessManager) return;
    const message = awarenessManager.encodeLocalUpdate();
    emitAwarenessUpdate(roomCode, message);
  },

  setActiveFile: (fileId: string | null) => {
    set({ activeFileId: fileId });

    // Update awareness with current file
    const { awarenessManager } = get();
    if (!awarenessManager) return;
    if (fileId) awarenessManager.setCurrentFileId(fileId);
  },

  setViewerFile: (fileId: string | null) => {
    set({ viewerFileId: fileId });
  },

  applyRemoteDocSnapshot: (snapshot: Uint8Array, updates: Uint8Array[]) => {
    const { yDocManager } = get();
    if (!yDocManager) return;

    // Construct a temporary Y.Doc from the server snapshot + updates to compute diff
    // This doc is used to compute deltas and is destroyed afterwards
    const remoteDoc = YDocManager.createDoc(snapshot, updates);
    const clientDiff = yDocManager.encodeDiffAgainst(remoteDoc);
    const serverDiff = yDocManager.encodeDiffFrom(remoteDoc);

    // Update local state with server diff
    if (serverDiff.byteLength > 0) {
      const serverMessage = yDocManager.encodeSyncUpdate(serverDiff);
      yDocManager.applyRemoteUpdate(serverMessage);
    }

    // Propagate local diff to server
    if (clientDiff.byteLength > 0) {
      const { roomCode, isConnected } = useSocketStore.getState();
      if (roomCode && isConnected) {
        const clientMessage = yDocManager.encodeSyncUpdate(clientDiff);
        emitFileUpdate(roomCode, clientMessage);
      }
    }

    // Destroy temporary Y.Doc used for diff computation
    remoteDoc.destroy();

    // Flag Y.Doc as initialized
    if (!get().isInitialDocLoaded) {
      set({ isInitialDocLoaded: true });
    }
  },

  applyRemoteDocUpdate: (message: Uint8Array) => {
    const { yDocManager } = get();
    if (!yDocManager) return;

    const reply = yDocManager.applyRemoteUpdate(message);

    // Send reply if needed (sync protocol)
    if (reply) {
      const { roomCode } = useSocketStore.getState();
      if (roomCode) emitFileUpdate(roomCode, reply);
    }

    // Flag Y.Doc as initialized
    if (yDocManager.isInitialDocLoaded() && !get().isInitialDocLoaded) {
      set({ isInitialDocLoaded: true });
    }
  },

  initializeDefaultFile() {
    const { fileManager, setActiveFile } = get();
    if (!fileManager) return;

    const fileId = fileManager.initializeDefaultFile();
    if (!fileId) return;

    setActiveFile(fileId);
  },

  initializeActiveFile: () => {
    const { fileManager, activeFileId, setActiveFile } = get();
    if (!fileManager || activeFileId) return;

    const filesMap = fileManager.getFilesMap();
    const firstFileId = Array.from(filesMap.keys())[0];
    if (!firstFileId) return;

    setActiveFile(firstFileId);
  },

  applyRemoteAwarenessUpdate: (message: Uint8Array) => {
    const { awarenessManager } = get();
    if (!awarenessManager) return;

    awarenessManager.applyRemoteUpdate(message);
  },

  destroy: () => {
    const { yDocManager, awarenessManager } = get();
    yDocManager?.destroy();
    awarenessManager?.destroy();

    set({
      yDoc: null,
      awareness: null,

      yDocManager: null,
      awarenessManager: null,
      fileManager: null,

      activeFileId: null,
      viewerFileId: null,
      isInitialized: false,
      isInitialDocLoaded: false,

      docMeta: null,
      files: [],
      tempFiles: [],

      // Capacity State 초기값
      capacityBytes: 0,
      capacityPercentage: 0,
      isOverLimit: false,
    });
  },

  // CRUD: 파일 생성
  createFile: (name: string, content?: string, type: FileType = 'text') => {
    const { fileManager, setActiveFile } = get();
    if (!fileManager) return '';

    const fileId = fileManager.createFile(name, content, type);

    // Set as active file if created successfully
    if (fileId) setActiveFile(fileId);

    return fileId;
  },

  // CRUD: 파일 삭제
  deleteFile: (fileId: string) => {
    const { fileManager, activeFileId } = get();
    if (!fileManager) return;

    fileManager.deleteFile(fileId);

    // Clear active file if the deleted file was active
    if (activeFileId === fileId) set({ activeFileId: null });
  },

  // CRUD: 파일 이름 변경
  renameFile: (fileId: string, newName: string) => {
    const { fileManager } = get();
    if (!fileManager) return;

    fileManager.renameFile(fileId, newName);
  },

  // CRUD: fileId 얻어오기
  getFileId: (name: string): string | null => {
    const { fileManager } = get();
    if (!fileManager) return null;

    return fileManager.getFileId(name);
  },

  getTempFiles: () => {
    return get().tempFiles;
  },

  // CRUD: 파일 덮어쓰기
  overwriteFile(fileId: string, content: string, type?: FileType) {
    const { fileManager } = get();
    if (!fileManager) return;

    fileManager.overwriteFile(fileId, content, type);
  },

  // CRUD: filesMap 반환 (Observer 등록용)
  getFilesMap: () => {
    const { fileManager } = get();
    if (!fileManager) return null;

    return fileManager.getFilesMap();
  },

  // CRUD: 파일 목록
  getFileNamesMap: (): YMap<string> | null => {
    const { fileManager } = get();
    if (!fileManager) return null;

    return fileManager.getFileNamesMap();
  },

  // 용량 측정: 전체 파일의 텍스트 길이 합산
  measureCapacity: () => {
    const { fileManager } = get();
    if (!fileManager) return 0;

    const total = fileManager.getTotalCapacity();

    const ratio = total / LIMITS.MAX_DOC_SIZE_CLIENT;
    const percentage = Math.min(ratio * 100, 100);

    set({
      capacityBytes: total,
      capacityPercentage: percentage,
      isOverLimit: total >= LIMITS.MAX_DOC_SIZE_CLIENT,
    });

    return total;
  },

  addTempFile: (file) => {
    const target = get().tempFiles;
    target.push(file);

    set({ tempFiles: target });
  },

  shiftTempFile: () => {
    const target = get().tempFiles;
    target.shift();

    set({ tempFiles: target });
  },

  clearTempFile: () => {
    set({ tempFiles: [] });
  },

  // 파일 이름 가져오기
  getFileName: (fileId: string | null) => {
    if (!fileId) return null;

    const { fileManager } = get();
    if (!fileManager) return null;

    return fileManager.getFileName(fileId);
  },

  // 파일 내용 가져오기
  getFileContent: (fileId: string) => {
    const { fileManager } = get();
    if (!fileManager) return null;
    return fileManager.getFileContent(fileId);
  },

  // 파일 타입 가져오기
  getFileType: (fileId: string) => {
    const { fileManager } = get();
    if (!fileManager) return null;
    return fileManager.getFileType(fileId);
  },

  // 현재 활성 파일 내용 가져오기
  getActiveFileContent: () => {
    const { activeFileId, getFileContent } = get();
    if (!activeFileId) return null;

    return getFileContent(activeFileId);
  },
}));
