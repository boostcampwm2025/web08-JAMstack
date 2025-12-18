import {
  type FileUpdatePayload,
  type JoinRoomPayload,
  SOCKET_EVENTS,
  Pt,
  type PtLeftPayload,
  type RoomPtsPayload,
} from '@codejam/common';
import { Logger, Inject, OnModuleInit } from '@nestjs/common';
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
import { RoomService } from '../room/room.service';
import { FileService, RoomFile } from '../file/file.service';
import { encodeStateAsUpdate } from 'yjs';
import { Redis } from 'ioredis';
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
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  private readonly logger = new Logger(CollaborationGateway.name);

  // socketId → { roomId, ptId } 매핑
  private socketMap = new Map<
    string,
    { roomId: string; ptId: string; fileId: string }
  >();

  constructor(
    private readonly roomService: RoomService,
    private readonly fileService: FileService,
    @Inject('REDIS_SUBSCRIBER') private readonly redisSubscriber: Redis,
  ) {}

  @WebSocketServer()
  server: Server;

  // ==================================================================
  // Lifecycle Hooks
  // ==================================================================

  onModuleInit() {
    this.subscribeToRedisExpiration();
  }

  /**
   * Redis TTL 만료 이벤트 구독
   * 키 형식: room:{roomId}:pt:{ptId}
   */
  private subscribeToRedisExpiration() {
    // __keyevent@0__:expired 채널 구독 (DB 0번의 만료 이벤트)
    this.redisSubscriber.subscribe('__keyevent@0__:expired');

    this.redisSubscriber.on('message', (channel, expiredKey) => {
      if (channel !== '__keyevent@0__:expired') return;

      // 키 형식: room:{roomId}:pt:{ptId}
      const match = expiredKey.match(/^room:(.+):pt:(.+)$/);
      if (!match) return;

      const [, roomId, ptId] = match;
      this.processPtLeftByTTL(roomId, ptId);
    });

    this.logger.log('🔔 Subscribed to Redis keyspace expiration events');
  }

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

  private async processDisconnect(client: Socket) {
    this.logger.log(`❌ Client Disconnected: ${client.id}`);

    const info = this.socketMap.get(client.id);
    if (!info) return;

    const { roomId, ptId, fileId } = info;

    // 사용자 커서 삭제
    const file = this.fileService.getSafeFile(fileId);
    removeAwarenessStates(file.awareness, [client.data.clientId!], client);

    // Redis에서 offline + TTL 5분 설정
    await this.roomService.disconnectPt(roomId, ptId);

    // socketMap에서 제거
    this.socketMap.delete(client.id);

    // 다른 사람들에게 알림
    this.server.to(roomId).emit(SOCKET_EVENTS.PT_DISCONNECT, { ptId });
    this.logger.log(`👋 [DISCONNECT] PtId ${ptId} left room: ${roomId}`);
  }

  private async processJoinRoom(client: Socket, payload: JoinRoomPayload) {
    const { roomId, clientId, ptId: requestedPtId } = payload;

    // Socket room 입장
    client.join(roomId);
    client.data.clientId = clientId;

    // redis에 참가자 생성 또는 redis에서 복원
    let pt: Pt | null = null;
    if (requestedPtId) {
      pt = await this.roomService.restorePt(roomId, requestedPtId);
    }
    if (!pt) {
      pt = await this.roomService.createPt(roomId);
    }

    // socketMap에 매핑 저장
    // TODO: fileId 를 payload 에 넣거나 자동적으로 생성해주는 함수를 만들어야함.
    this.socketMap.set(client.id, {
      roomId,
      ptId: pt.ptId,
      fileId: 'prototype',
    });

    // 현재 참가자 목록 및 코드 조회
    // const allPts = await this.roomService.getAllPts(roomId);

    this.logger.log(
      `📩 [JOIN] ${pt.nickname} (ptId: ${pt.ptId}) joined room: ${roomId}`,
    );

    // 이벤트 전송
    client.to(roomId).emit(SOCKET_EVENTS.PT_JOINED, { pt }); // 다른 사람들에게 지금 들어온 사람 알리기client.emit(SOCKET_EVENTS.ROOM_PTS, { pts: allPts }); // 본인에게 참가자 목록

    // 파일이 없으면 새로 생성 및 Doc, Awareness 이벤트 브로드케스트
    // TODO: 별도의 파일을 요청하는 SubscribeMessage 추가
    const file = this.fileService.createFile(
      this.server,
      'javascript',
      'prototype',
    );

    this.startSyncDoc(file, client); // SOCKET_EVENTS.ROOM_FILE
    this.startSyncPt(file, client); // SOCKET_EVENTS.ROOM_PTS
  }

  private processCodeUpdate(client: CollabSocket, payload: FileUpdatePayload) {
    const { roomId, code } = payload;
    this.logger.debug(`📝 [UPDATE] Room: ${roomId}, Length: ${code.length}`);

    const info = this.socketMap.get(client.id);
    if (!info) return;

    const { fileId } = info;

    const file = this.fileService.getSafeFile(fileId);
    const decoder = createDecoder(code);
    const encoder = createEncoder();

    readSyncMessage(decoder, encoder, file.doc, client);
    const reply = toUint8Array(encoder);

    if (reply.byteLength > 0) {
      client.emit(SOCKET_EVENTS.UPDATE_FILE, { roomId, code: reply });
    }
  }

  private processPtsUpdate(client: CollabSocket, payload: RoomPtsPayload) {
    const { message } = payload;
    const info = this.socketMap.get(client.id);
    if (!info) {
      return;
    }

    const { fileId } = info;
    const file = this.fileService.getSafeFile(fileId);

    applyAwarenessUpdate(file.awareness, message, client);
  }

  private startSyncDoc(room: RoomFile, client: CollabSocket) {
    const update = encodeStateAsUpdate(room.doc);
    const encoder = createEncoder();
    writeUpdate(encoder, update);
    const code = toUint8Array(encoder);
    client.emit(SOCKET_EVENTS.ROOM_FILES, {
      roomId: room.roomId,
      code,
    });
  }

  private startSyncPt(room: RoomFile, client: CollabSocket) {
    const ids = Array.from(room.awareness.getStates().keys());
    const message = encodeAwarenessUpdate(room.awareness, ids);
    client.emit(SOCKET_EVENTS.ROOM_PTS, {
      roomId: room.roomId,
      message,
    });
  }

  // TODO: 주기적으로 변화가 일어났을 때 저장할 수 있도록 수정
  // private async processCodeUpdate(client: Socket, payload: FileUpdatePayload) {
  //   const { roomId, code } = payload;
  //   this.logger.debug(`📝 [UPDATE] Room: ${roomId}, Length: ${code.length}`);

  //   // Redis에 코드 저장
  //   await this.roomService.saveCode(roomId, code);

  //   // 다른 사람들에게 브로드캐스트
  //   client.to(roomId).emit(SOCKET_EVENTS.UPDATE_FILE, payload);
  // }

  /**
   * Redis TTL 만료로 사용자가 삭제되었을 때 처리하는 로직
   * Redis keyspace notification에서 자동 호출됨
   */
  private processPtLeftByTTL(roomId: string, ptId: string) {
    this.logger.log(
      `⏰ [PT_LEFT] PtId ${ptId} removed by TTL in room: ${roomId}`,
    );

    const payload: PtLeftPayload = { ptId };
    this.server.to(roomId).emit(SOCKET_EVENTS.PT_LEFT, payload);
  }
}
