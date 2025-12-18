import {
  type FileUpdatePayload,
  type JoinRoomPayload,
  SOCKET_EVENTS,
  Pt,
  type PtLeftPayload,
  type RoomPtsPayload,
} from '@codejam/common';
import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { DefaultEventsMap, Server, Socket } from 'socket.io';
import { createEncoder, toUint8Array } from 'lib0/encoding';
import { createDecoder } from 'lib0/decoding';
import { readSyncMessage, writeUpdate } from 'y-protocols/sync';
import {
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from 'y-protocols/awareness';
import { RoomService, RoomState } from '../room/room.service';
import { encodeStateAsUpdate } from 'yjs';

type CollabSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  {
    clientId?: number;
    roomId?: string;
  }
>;

@WebSocketGateway({
  cors: {
    origin: '*', // 개발용: 모든 출처 허용 (배포 시 프론트 주소로 변경)
  },
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(CollaborationGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly roomService: RoomService) {}

  // ==================================================================
  // Entry Points
  // ==================================================================

  handleConnection(client: CollabSocket) {
    this.processConnection(client);
  }

  handleDisconnect(client: CollabSocket) {
    this.processDisconnect(client);
  }

  @SubscribeMessage(SOCKET_EVENTS.JOIN_ROOM)
  handleJoinRoom(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    this.processJoinRoom(client, payload);
  }

  @SubscribeMessage(SOCKET_EVENTS.UPDATE_FILE)
  handleCodeUpdate(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: FileUpdatePayload,
  ) {
    this.processCodeUpdate(client, payload);
  }

  @SubscribeMessage(SOCKET_EVENTS.ROOM_PTS)
  handlePtUpdate(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: RoomPtsPayload,
  ) {
    this.processPtsUpdate(client, payload);
  }

  // ==================================================================
  // Business Logics
  // ==================================================================

  private processConnection(client: CollabSocket) {
    this.logger.log(`✅ Client Connected: ${client.id}`);
  }

  private processDisconnect(client: CollabSocket) {
    this.logger.log(`❌ Client Disconnected: ${client.id}`);

    const roomId = this.getMockRoomIdBySocket(client.id);
    const ptId = this.getMockPtIdBySocket(client.id);
    const room = this.roomService.safeRoom(roomId);
    if (roomId && ptId) {
      this.roomService.leave(roomId, client.id);
      removeAwarenessStates(room.awareness, [client.data.clientId!], client);
      this.server.to(roomId).emit(SOCKET_EVENTS.PT_DISCONNECT, {
        ptId,
      });
      this.logger.log(`👋 [DISCONNECT] PtId ${ptId} left room: ${roomId}`);
    }
  }

  private processJoinRoom(client: CollabSocket, payload: JoinRoomPayload) {
    const { roomId, clientId, ptId: requestedPtId } = payload;

    client.data.clientId = clientId;

    // Socket Join
    client.join(roomId);

    // 데이터 가져오기 - ptId가 있으면 재사용, 없으면 생성
    const pt = this.createMockPt(client, requestedPtId);
    // const initialCode = this.getMockInitialCode(roomId);

    this.logger.log(
      `📩 [JOIN] ${pt.nickname} (ptId: ${pt.ptId}) joined room: ${roomId}`,
    );

    // 방이 없으면 새로 생성 및 Doc, Awareness 이벤트 브로드케스트
    // 방이 있으면 입장
    if (!this.roomService.room(roomId)) {
      this.roomService.createRoom(roomId, 'prototype', clientId, pt, client);
    } else {
      this.roomService.join(roomId, clientId, pt, client);
    }

    // 이벤트 브로드케스트
    // client.to(roomId).emit(SOCKET_EVENTS.PT_JOINED, { pt });
    // client.emit(SOCKET_EVENTS.ROOM_PTS, { pts: [pt] });
    // client.emit(SOCKET_EVENTS.ROOM_FILES, { roomId, code: initialCode });

    // 초기 동기화 (코드 및 사용자들)
    const room = this.roomService.safeRoom(roomId);
    this.startSyncDoc(room, client);
    this.startSyncPt(room, client);
  }

  private processCodeUpdate(client: CollabSocket, payload: FileUpdatePayload) {
    const { roomId, code } = payload;
    this.logger.debug(`📝 [UPDATE] Room: ${roomId}, Length: ${code.length}`);

    const room = this.roomService.safeRoom(roomId);

    const decoder = createDecoder(code);
    const encoder = createEncoder();

    readSyncMessage(decoder, encoder, room.doc, client);
    const reply = toUint8Array(encoder);

    if (reply.byteLength > 0) {
      client.emit(SOCKET_EVENTS.UPDATE_FILE, { roomId, code: reply });
    }

    // 다른 사람들에게 브로드케스트
    // client.to(roomId).emit(SOCKET_EVENTS.UPDATE_FILE, payload);
  }

  private processPtsUpdate(client: CollabSocket, payload: RoomPtsPayload) {
    const { message, roomId } = payload;

    const room = this.roomService.safeRoom(roomId);
    applyAwarenessUpdate(room.awareness, message, client);
  }

  private startSyncDoc(room: RoomState, client: CollabSocket) {
    const update = encodeStateAsUpdate(room.doc);
    const encoder = createEncoder();
    writeUpdate(encoder, update);
    const code = toUint8Array(encoder);
    client.emit(SOCKET_EVENTS.ROOM_FILES, {
      roomId: room.roomId,
      code,
    });
  }

  private startSyncPt(room: RoomState, client: CollabSocket) {
    const ids = Array.from(room.awareness.getStates().keys());
    const message = encodeAwarenessUpdate(room.awareness, ids);
    client.emit(SOCKET_EVENTS.ROOM_PTS, {
      roomId: room.roomId,
      pts: this.roomService.extractPts(room.roomId, ids),
      message,
    });
  }

  /**
   * Mock: Redis TTL 만료로 사용자가 삭제되었을 때 처리하는 로직
   * 실제로는 Redis의 keyspace notification 또는 별도 스케줄러로 처리
   */
  private processPtLeftByTTL(roomId: string, ptId: string) {
    this.logger.log(
      `⏰ [PT_LEFT] PtId ${ptId} removed by TTL in room: ${roomId}`,
    );

    const payload: PtLeftPayload = { ptId };
    this.server.to(roomId).emit(SOCKET_EVENTS.PT_LEFT, payload);
  }

  // ==================================================================
  // Helpers & Mocks
  // TODO: 실제 로직으로 교체 필요
  // ==================================================================

  private getMockRoomIdBySocket(socketId: string): string {
    return 'prototype';
  }

  private getMockPtIdBySocket(socketId: string): string | null {
    // Mock: socketId를 기반으로 ptId 생성/조회
    // 실제로는 DB나 메모리 저장소에서 조회해야 함
    return `pt-${socketId.slice(0, 8)}`;
  }

  private createMockPt(client: Socket, requestedPtId?: string): Pt {
    const ptId = requestedPtId || `pt-${client.id.slice(0, 8)}`;

    return {
      ptId,
      nickname: `Guest-${ptId.slice(3, 7)}`,
      role: 'editor', // Mock: 기본값으로 editor 설정
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      presence: 'online',
      joinedAt: new Date().toISOString(),
    };
  }

  private getMockInitialCode(roomId: string): string {
    return `// Initial code for room: ${roomId}\n// Waiting for synchronization...`;
  }
}
