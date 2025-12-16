import { type JoinRoomPayload, SOCKET_EVENTS } from '@codejam/common';
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
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`✅ Client Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client Disconnected: ${client.id}`);
  }

  @SubscribeMessage(SOCKET_EVENTS.JOIN_ROOM)
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    const { roomId } = payload;
    const randomNickname = `Guest-${client.id.slice(0, 4)}`;

    client.join(roomId);

    console.log(`📩 User ${randomNickname} joined room: ${roomId}`);
  }
}
