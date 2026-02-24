import { Injectable, Logger } from '@nestjs/common';
import { YRedisService } from '../y-redis/y-redis.service';
import { DocumentService } from '../document/document.service';
import {
  Awareness,
  encodeAwarenessUpdate,
  applyAwarenessUpdate,
  removeAwarenessStates,
} from 'y-protocols/awareness';
import { writeUpdate, readSyncMessage } from 'y-protocols/sync';
import { Doc, encodeStateAsUpdate, Map as YMap, Text as YText } from 'yjs';
import { createEncoder, toUint8Array } from 'lib0/encoding';
import { createDecoder } from 'lib0/decoding';
import {
  AwarenessUpdatePayload,
  FileUpdatePayload,
  SOCKET_EVENTS,
  type AwarenessUpdate,
  LIMITS,
  type FileId,
} from '@codejam/common';
import { Server, Socket } from 'socket.io';
import type { CollabSocket } from '../collaboration/collaboration.types';
import type { FileInfo } from './file.types';

export type RoomDoc = {
  docId: string;
  doc: Doc;
  awareness: Awareness;
  files: Set<FileId>;

  docListener: (update: Uint8Array, origin: unknown) => void;
  awarenessListener: (changes: AwarenessUpdate, origin: unknown) => void;
};

export type OriginServer = {
  type: 'server';
  client: CollabSocket;
  server: Server;
};

export type OriginType = 'server' | 'client' | undefined;

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  // Doc size limit
  private readonly MAX_DOC_SIZE = LIMITS.MAX_DOC_SIZE_SERVER;

  // One Y.Doc per room and document
  private docs: Map<string, RoomDoc> = new Map();

  constructor(
    private readonly yRedis: YRedisService,
    private readonly documentService: DocumentService,
  ) {}

  // ==================================================================
  // Y.Doc Management Methods
  // ==================================================================

  /**
   * Create Y.Doc for a document
   * Should be called when room is initialized (before files are created)
   * Hydrates from Redis if data exists, otherwise restores from DB
   */
  async createDoc(docId: string): Promise<RoomDoc> {
    // Check if already exists
    if (this.docs.has(docId)) {
      return this.docs.get(docId)!;
    }

    // Create Y.Doc
    const doc = new Doc();
    const awareness = new Awareness(doc);

    // Hydrate Y.Doc (Redis + DB fallback)
    // Bind to Redis for persistence
    await this.hydrateDoc(docId, doc);

    // Create listener instances
    const docListener = this.docListener();
    const awarenessListener = this.awarenessListener(awareness);

    // Set up listeners
    // Do after hydration to avoid pushing existing data
    doc.on('update', docListener);
    awareness.on('update', awarenessListener);

    const roomDoc: RoomDoc = {
      docId,
      doc,
      awareness,
      files: new Set<string>(),
      docListener,
      awarenessListener,
    };

    this.docs.set(docId, roomDoc);
    this.logger.log(`📄 Created Y.Doc for document: ${docId}`);

    return roomDoc;
  }

  /**
   * Ensure Y.Doc exists for document (creates if not exists)
   * Idempotent - safe to call multiple times
   */
  async ensureDoc(docId: string): Promise<RoomDoc> {
    const existing = this.docs.get(docId);
    if (existing) return existing;

    return this.createDoc(docId);
  }

  /**
   * Get Y.Doc for a document (throws if not found)
   * Use this for hot paths after room join
   */
  getDoc(docId: string): RoomDoc {
    const roomDoc = this.docs.get(docId);

    if (!roomDoc) {
      throw new Error(`Y.Doc not found for document: ${docId}`);
    }

    return roomDoc;
  }

  /**
   * Close Y.Doc for a document
   * Unloads Y.Doc from memory but keeps Redis data intact
   * Use this when all participants are offline to save memory
   * Redis keys remain so the doc can be restored when participants rejoin
   */
  async closeDoc(docId: string): Promise<boolean> {
    const roomDoc = this.docs.get(docId);
    if (!roomDoc) return false;

    const { doc, awareness, docListener, awarenessListener } = roomDoc;

    // Close Y.Doc in Redis
    // Unload from memory, keep Redis keys
    await this.yRedis.closeDoc(docId);

    // Clean up listeners
    doc.off('update', docListener);
    awareness.off('update', awarenessListener);

    // Remove from map
    this.docs.delete(docId);
    this.logger.log(`💤 Closed Y.Doc for document: ${docId}`);

    return true;
  }

  /**
   * Remove Y.Doc for a document
   * Permanently removes Y.Doc from memory and clears Redis keys
   * Use this when room is closed or expired and data is no longer needed
   */
  async removeDoc(docId: string): Promise<boolean> {
    const roomDoc = this.docs.get(docId);
    if (!roomDoc) return false;

    const { doc, awareness, docListener, awarenessListener } = roomDoc;

    // Clear Y.Doc from Redis
    // Remove from memory and delete Redis keys
    await this.yRedis.clearDoc(docId);

    // Clean up listeners using stored references
    doc.off('update', docListener);
    awareness.off('update', awarenessListener);

    // Remove from map
    this.docs.delete(docId);
    this.logger.log(`🗑️ Removed Y.Doc for document: ${docId}`);

    return true;
  }

  /**
   * Cleanup Y.Docs by docIds
   */
  async cleanupDocs(docIds: string[]): Promise<void> {
    if (docIds.length === 0) return;

    this.logger.log(`🧹 Cleaning up ${docIds.length} Y.Docs`);

    await Promise.all(docIds.map((docId) => this.removeDoc(docId)));
  }

  // ==================================================================
  // File Management Methods
  // ==================================================================

  /**
   * 파일 정보 가져오기
   * Used for code execution - retrieves file name and content from Y.Doc
   */
  getFileInfo(docId: string, fileId: string): FileInfo | null {
    const roomDoc = this.getDoc(docId);
    const { doc } = roomDoc;

    const files = doc.getMap('files');
    if (!files) return null;

    const file = files.get(fileId) as YMap<unknown>;
    if (!file) return null;

    const name = file.get('name') as string;
    const text = file.get('content') as YText;
    if (!name || !text) return null;

    const content = text.toJSON();
    return { name, content };
  }

  // ==================================================================
  // Handle Methods
  // ==================================================================

  /**
   * Prepare room document for a joining client
   * - Ensures Y.Doc exists (creates or hydrates from Redis)
   * - Creates default file if this is a new room (no existing doc in Redis)
   */
  async prepareDoc(client: CollabSocket, _server: Server): Promise<void> {
    const { docId } = client.data;
    const roomDoc = this.docs.get(docId);
    if (roomDoc) return;

    // Ensure doc exists
    // Creates if not (Hydrates from Redis)
    await this.ensureDoc(docId);
  }

  /**
   * Handle document request - send initial Y.Doc state to client
   */
  handleRequestDoc(client: CollabSocket, _server: Server) {
    const { docId } = client.data;
    const roomDoc = this.getDoc(docId);
    const { doc } = roomDoc;

    // Encode and send entire Y.Doc state
    const snapshot = encodeStateAsUpdate(doc);

    const payload = { snapshot, updates: [] };
    client.emit(SOCKET_EVENTS.ROOM_DOC, payload);
  }

  /**
   * Handle awareness request - send initial awareness states to client
   */
  handleRequestAwareness(client: CollabSocket, _server: Server) {
    const { docId } = client.data;
    const { awareness } = this.getDoc(docId);

    // Send awareness states for this document
    const ids = Array.from(awareness.getStates().keys());
    const message = encodeAwarenessUpdate(awareness, ids);

    client.emit(SOCKET_EVENTS.ROOM_AWARENESS, { docId, message });
  }

  /**
   * Handle file update - process Y.js sync messages
   */
  handleFileUpdate(
    client: CollabSocket,
    server: Server,
    payload: FileUpdatePayload,
  ) {
    const { docId } = client.data;
    const { message } = payload;
    const { doc } = this.getDoc(docId);

    // Size limit guard

    const expectedSize = this.getExpectedDocSize(docId, message);

    if (expectedSize > this.MAX_DOC_SIZE) {
      const logMessage = `DOC_SIZE_EXCEEDED: ${expectedSize} > ${this.MAX_DOC_SIZE}`;

      throw new Error(logMessage);
    }

    // Process Y.js sync message
    const decoder = createDecoder(message);
    const encoder = createEncoder();

    readSyncMessage(decoder, encoder, doc, client);
    const reply = toUint8Array(encoder);

    if (reply.byteLength > 0) {
      client.emit(SOCKET_EVENTS.UPDATE_FILE, { message: reply });
    }
  }

  /**
   * Handle awareness update - apply awareness changes
   */
  handleAwarenessUpdate(
    client: CollabSocket,
    server: Server,
    payload: AwarenessUpdatePayload,
  ) {
    const { docId } = client.data;
    const { message } = payload;
    const { awareness } = this.getDoc(docId);

    applyAwarenessUpdate(awareness, message, client);
  }

  /**
   * Handle remove awareness - clean up awareness states
   */
  handleRemoveAwareness(
    client: CollabSocket,
    server: Server,
    payload: { clientId: number },
  ) {
    const { docId } = client.data;
    const { clientId } = payload;
    const { awareness } = this.getDoc(docId);

    removeAwarenessStates(awareness, [clientId], client);
  }

  // ==================================================================
  // Private Helper Methods
  // ==================================================================

  /**
   * Calculate expected document size after applying update
   * @returns expected total byte length, or 0 if doc not found
   */
  private getExpectedDocSize(docId: string, message: Uint8Array): number {
    const pdoc = this.yRedis.getDoc(docId);
    if (!pdoc) return 0;

    const docByteLength = pdoc.snapshotByteLength + pdoc.updatesByteLength;
    return docByteLength + message.byteLength;
  }

  /**
   * Hydrate Y.Doc
   *
   * Load snapshot and clock from DB
   * Bind to Redis for persistence with initial snapshot and clock
   * Wait for synchronization with Redis
   */
  private async hydrateDoc(docId: string, doc: Doc): Promise<void> {
    // Load snapshot from DB

    const document = await this.documentService.getLatestDocState(docId);
    if (!document) throw new Error(`DOCUMENT_NOT_FOUND: ${docId}`);

    const snapshot = document.content;
    const clock = document.clock;

    // Define getSnapshot callback for resilience

    const getLatestDocState = async () => {
      const document = await this.documentService.getLatestDocState(docId);
      if (!document) throw new Error(`DOCUMENT_NOT_FOUND: ${docId}`);

      const { content, clock } = document;
      return { snapshot: content, clock };
    };

    // Define updateDocState callback for compaction

    const updateDocState = async (snapshot: Uint8Array, clock: number) => {
      await this.documentService.updateDocState(
        docId,
        Buffer.from(snapshot),
        clock,
      );
    };

    // Bind to Redis

    const pdoc = this.yRedis.bind(
      docId,
      doc,
      snapshot,
      clock,
      getLatestDocState,
      updateDocState,
    );

    await pdoc.synced; // Wait for hydration from DB + Redis
  }

  /**
   * Generate initial Y.Doc snapshot
   * Creates empty Y.Doc structure - client will create initial files
   */
  generateInitialSnapshot(): Buffer {
    const doc = new Doc();
    const snapshot = encodeStateAsUpdate(doc);
    return Buffer.from(snapshot);
  }

  private docListener() {
    return (update: Uint8Array, origin: unknown) => {
      const originType = this.getOriginType(origin);
      if (!originType) return;
      const encoder = createEncoder();
      writeUpdate(encoder, update);
      const message = toUint8Array(encoder);

      if (originType === 'client') {
        const client = origin as CollabSocket;
        const { roomCode } = client.data;

        client.to(roomCode).emit(SOCKET_EVENTS.UPDATE_FILE, { message });
        client.to(roomCode).emit('update');
      } else {
        const originServer = origin as OriginServer;
        const client = originServer.client;
        const server = originServer.server;
        const { roomCode } = client.data;

        server.to(roomCode).emit(SOCKET_EVENTS.UPDATE_FILE, { message });
        server.to(roomCode).emit('update');
      }
    };
  }

  private awarenessListener(awareness: Awareness) {
    return ({ added, updated, removed }: AwarenessUpdate, origin: unknown) => {
      if (!origin || !(origin instanceof Socket)) return;

      const client = origin as CollabSocket;
      const { roomCode } = client.data;

      const changed = added.concat(updated, removed);
      const message = encodeAwarenessUpdate(awareness, changed);

      client.to(roomCode).emit(SOCKET_EVENTS.UPDATE_AWARENESS, { message });
    };
  }

  private getOriginType(origin: unknown): OriginType {
    if (!origin) {
      return undefined;
    }

    if (origin instanceof Socket) {
      return 'client';
    }

    if (typeof origin === 'object') {
      return 'server';
    }
  }
}
