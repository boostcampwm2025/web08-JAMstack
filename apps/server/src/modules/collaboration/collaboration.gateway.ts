import {
  type CodeUpdatePayload,
  type JoinRoomPayload,
  SOCKET_EVENTS,
  Pt,
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
    this.processJoinRoom(client, payload.roomId);
  }

  @SubscribeMessage(SOCKET_EVENTS.UPDATE_CODE)
  handleCodeUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CodeUpdatePayload,
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
    if (roomId) {
      this.server.to(roomId).emit(SOCKET_EVENTS.PT_LEFT, {
        socketId: client.id,
      });
      this.logger.log(`👋 [LEAVE] Client ${client.id} left room: ${roomId}`);
    }
  }

  private processJoinRoom(client: Socket, roomId: string) {
    // Socket Join
    client.join(roomId);

    // 데이터 가져오기
    const pt = this.createMockPt(client);
    const initialCode = this.getMockInitialCode(roomId);

    this.logger.log(
      `📩 [JOIN] ${pt.nickname} (${pt.socketId}) joined room: ${roomId}`,
    );

    // 이벤트 브로드케스트
    client.to(roomId).emit(SOCKET_EVENTS.PT_JOINED, { pt });
    client.emit(SOCKET_EVENTS.ROOM_PTS, { pts: [pt] });
    client.emit(SOCKET_EVENTS.SYNC_CODE, { roomId, code: initialCode });
  }

  private processCodeUpdate(client: Socket, payload: CodeUpdatePayload) {
    const { roomId, code } = payload;
    this.logger.debug(`📝 [UPDATE] Room: ${roomId}, Length: ${code.length}`);

    // 다른 사람들에게 브로드케스트
    client.to(roomId).emit(SOCKET_EVENTS.UPDATE_CODE, payload);
  }

  // ==================================================================
  // Helpers & Mocks
  // TODO: 실제 로직으로 교체 필요
  // ==================================================================

  private getMockRoomIdBySocket(socketId: string): string {
    return 'prototype';
  }

  private createMockPt(client: Socket): Pt {
    return {
      socketId: client.id,
      nickname: `Guest-${client.id.slice(0, 4)}`,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
    };
  }

  private getMockInitialCode(roomId: string): string {
    return `// Initial code for room: ${roomId}\n// Waiting for synchronization...`;
  }
}
