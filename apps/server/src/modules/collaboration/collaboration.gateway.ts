import {
  SOCKET_EVENTS,
  type FileUpdatePayload,
  type AwarenessUpdatePayload,
  type JoinRoomPayload,
  type PtUpdateRolePayload,
  type PtUpdateNamePayload,
  type ClaimHostPayload,
  type ExecuteCodePayload,
  type ChatMessageSendPayload,
} from '@codejam/common';
import { UseFilters, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PrometheusSocketIo } from 'socket.io-prometheus-v3';
import * as http from 'http';
import { CollaborationService } from './collaboration.service';
import type { CollabSocket } from './collaboration.types';
import { PermissionGuard } from './guards/permission.guard';
import { HostGuard } from './guards/host.guard';
import { DestroyRoomGuard } from './guards/destroy-room.guard';
import { CustomRoomGuard } from './guards/custom-room.guard';
import { NotHostGuard } from './guards/not-host.guard';
import { Throttle } from '@nestjs/throttler';
import { WsThrottlerGuard } from '../../common/guards/ws-throttler.guard';
import { WsExceptionFilter } from '../../common/filters/ws-exception.filter';

/**
 * Throttle Limit (환경변수로 조절 가능)
 * - 운영 서버: 기본값 적용
 * - 스테이징/테스트: .env에서 상향 설정하여 부하테스트 가능
 */
const EXECUTE_CODE_LIMIT = parseInt(
  process.env.EXECUTE_CODE_THROTTLE_LIMIT || '6',
  10,
);
const CHAT_MESSAGE_LIMIT = parseInt(
  process.env.CHAT_MESSAGE_THROTTLE_LIMIT || '10',
  10,
);

@UseFilters(new WsExceptionFilter())
@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class CollaborationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private prometheus: ReturnType<typeof PrometheusSocketIo.init>;

  constructor(private readonly collaborationService: CollaborationService) {}

  @WebSocketServer()
  server: Server;

  /** Socket.io 서버 초기화 시 메트릭 수집 시작 (9091 포트) */
  afterInit(server: Server) {
    this.prometheus = PrometheusSocketIo.init({
      io: server as any,
      collectDefaultMetrics: true,
    });

    // 메트릭 HTTP 서버 (9091 포트)
    const metricsServer = http.createServer((req, res) => {
      void (async () => {
        if (req.url === '/metrics') {
          res.setHeader('Content-Type', 'text/plain');
          res.end(await this.prometheus.getMetrics());
        } else {
          res.statusCode = 404;
          res.end('Not Found');
        }
      })();
    });
    metricsServer.listen(9091);
  }

  /** 클라이언트 연결 시 초기화 */
  handleConnection(client: CollabSocket) {
    this.collaborationService.handleConnection(client);
  }

  /** 클라이언트 연결 종료 시 정리 및 참가자 상태 업데이트 */
  async handleDisconnect(client: CollabSocket) {
    await this.collaborationService.handleDisconnect(client, this.server);
  }

  /** C -> S: 방 입장 요청 */
  @SubscribeMessage(SOCKET_EVENTS.JOIN_ROOM)
  async handleJoinRoom(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    try {
      await this.collaborationService.handleJoinRoom(
        client,
        this.server,
        payload,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'UNKNOWN_ERROR';
      client.emit('error', {
        type: errorMessage,
        message: errorMessage,
      });
    }
  }

  /** C -> S: 방 나가기 요청 */
  @SubscribeMessage(SOCKET_EVENTS.LEFT_ROOM)
  async handleLeftRoom(@ConnectedSocket() client: CollabSocket) {
    await this.collaborationService.handleLeftRoom(client, this.server);
  }

  /** C -> S: 문서 동기화 요청 */
  @SubscribeMessage(SOCKET_EVENTS.REQUEST_DOC)
  handleRequestDoc(@ConnectedSocket() client: CollabSocket) {
    this.collaborationService.handleRequestDoc(client, this.server);
  }

  /** C -> S: Awareness 동기화 요청 */
  @SubscribeMessage(SOCKET_EVENTS.REQUEST_AWARENESS)
  handleRequestAwareness(@ConnectedSocket() client: CollabSocket) {
    this.collaborationService.handleRequestAwareness(client, this.server);
  }

  /** C -> S: 파일 변경사항 브로드캐스트 */
  @UseGuards(PermissionGuard)
  @SubscribeMessage(SOCKET_EVENTS.UPDATE_FILE)
  handleFileUpdate(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: FileUpdatePayload,
  ) {
    this.collaborationService.handleFileUpdate(client, this.server, payload);
  }

  /** C -> S: Awareness 변경사항 브로드캐스트 */
  @UseGuards(PermissionGuard)
  @SubscribeMessage(SOCKET_EVENTS.UPDATE_AWARENESS)
  handleAwarenessUpdate(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: AwarenessUpdatePayload,
  ) {
    this.collaborationService.handleAwarenessUpdate(
      client,
      this.server,
      payload,
    );
  }

  /** C -> S PtRole 업데이트 */
  @UseGuards(HostGuard)
  @SubscribeMessage(SOCKET_EVENTS.UPDATE_ROLE_PT)
  async handlePtRoleUpdate(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: PtUpdateRolePayload,
  ) {
    await this.collaborationService.handleUpdatePtRole(
      client,
      this.server,
      payload,
    );
  }

  /** C -> S Pt 이름 업데이트 */
  @SubscribeMessage(SOCKET_EVENTS.UPDATE_NICKNAME_PT)
  async handlePtNameUpdate(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: PtUpdateNamePayload,
  ) {
    await this.collaborationService.handleUpdatePtName(
      client,
      this.server,
      payload,
    );
  }

  /** C -> S 방 폭파 요청 */
  @UseGuards(DestroyRoomGuard)
  @SubscribeMessage(SOCKET_EVENTS.DESTROY_ROOM)
  async handleDestroyRoom(@ConnectedSocket() client: CollabSocket) {
    await this.collaborationService.handleDestroyRoom(client, this.server);
  }

  /** C -> S 호스트 권한 요청 */
  @UseGuards(CustomRoomGuard, NotHostGuard)
  @SubscribeMessage(SOCKET_EVENTS.CLAIM_HOST)
  async handleClaimHost(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: ClaimHostPayload,
  ) {
    await this.collaborationService.handleClaimHost(
      client,
      this.server,
      payload,
    );
  }

  /** C -> S 호스트 권한 요청 수락 */
  @UseGuards(HostGuard)
  @SubscribeMessage(SOCKET_EVENTS.ACCEPT_HOST_CLAIM)
  async handleAcceptHostClaim(@ConnectedSocket() client: CollabSocket) {
    await this.collaborationService.handleAcceptHostClaim(client, this.server);
  }

  /** C -> S 호스트 권한 요청 거절 */
  @UseGuards(HostGuard)
  @SubscribeMessage(SOCKET_EVENTS.REJECT_HOST_CLAIM)
  handleRejectHostClaim(@ConnectedSocket() client: CollabSocket) {
    this.collaborationService.handleRejectHostClaim(client, this.server);
  }

  /** C -> S 채팅 메시지 전송 */
  @SubscribeMessage(SOCKET_EVENTS.CHAT_MESSAGE)
  @UseGuards(WsThrottlerGuard)
  @Throttle({ default: { limit: CHAT_MESSAGE_LIMIT, ttl: 1000 } })
  async handleChatMessage(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: ChatMessageSendPayload,
  ): Promise<{ success: boolean }> {
    await this.collaborationService.handleChatMessage(
      client,
      this.server,
      payload,
    );
    return { success: true };
  }

  /** C -> S 코드 실행 요청 */
  @UseGuards(WsThrottlerGuard)
  @Throttle({ default: { limit: EXECUTE_CODE_LIMIT, ttl: 60000 } })
  @SubscribeMessage(SOCKET_EVENTS.EXECUTE_CODE)
  async handleExecuteCode(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: ExecuteCodePayload,
  ) {
    await this.collaborationService.handleExecuteCode(
      client,
      this.server,
      payload,
    );
  }

  /**
   * [Scheduler용]
   */
  notifyAndDisconnectRoom(roomCode: string) {
    this.collaborationService.handleRoomExpired(this.server, roomCode);
  }
}
