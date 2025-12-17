import {
  type FileUpdatePayload,
  type JoinRoomPayload,
  SOCKET_EVENTS,
  Pt,
  type PtLeftPayload,
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
import { Server, Socket } from 'socket.io';

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

  // ==================================================================
  // Entry Points
  // ==================================================================

  handleConnection(client: Socket) {
    this.processConnection(client);
  }

  handleDisconnect(client: Socket) {
    this.processDisconnect(client);
  }

  @SubscribeMessage(SOCKET_EVENTS.JOIN_ROOM)
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    this.processJoinRoom(client, payload);
  }

  @SubscribeMessage(SOCKET_EVENTS.UPDATE_FILE)
  handleCodeUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: FileUpdatePayload,
  ) {
    this.processCodeUpdate(client, payload);
  }

  // ==================================================================
  // Business Logics
  // ==================================================================

  private processConnection(client: Socket) {
    this.logger.log(`✅ Client Connected: ${client.id}`);
  }

  private processDisconnect(client: Socket) {
    this.logger.log(`❌ Client Disconnected: ${client.id}`);

    const roomId = this.getMockRoomIdBySocket(client.id);
    const ptId = this.getMockPtIdBySocket(client.id);
    if (roomId && ptId) {
      this.server.to(roomId).emit(SOCKET_EVENTS.PT_DISCONNECT, {
        ptId,
      });
      this.logger.log(`👋 [DISCONNECT] PtId ${ptId} left room: ${roomId}`);
    }
  }

  private processJoinRoom(client: Socket, payload: JoinRoomPayload) {
    const { roomId, ptId: requestedPtId } = payload;

    // Socket Join
    client.join(roomId);

    // 데이터 가져오기 - ptId가 있으면 재사용, 없으면 생성
    const pt = this.createMockPt(client, requestedPtId);
    const initialCode = this.getMockInitialCode(roomId);

    this.logger.log(
      `📩 [JOIN] ${pt.nickname} (ptId: ${pt.ptId}) joined room: ${roomId}`,
    );

    // 이벤트 브로드케스트
    client.to(roomId).emit(SOCKET_EVENTS.PT_JOINED, { pt });
    client.emit(SOCKET_EVENTS.ROOM_PTS, { pts: [pt] });
    client.emit(SOCKET_EVENTS.ROOM_FILES, { roomId, code: initialCode });
  }

  private processCodeUpdate(client: Socket, payload: FileUpdatePayload) {
    const { roomId, code } = payload;
    this.logger.debug(`📝 [UPDATE] Room: ${roomId}, Length: ${code.length}`);

    // 다른 사람들에게 브로드케스트
    client.to(roomId).emit(SOCKET_EVENTS.UPDATE_FILE, payload);
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
