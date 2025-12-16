import { useEffect, useState } from 'react';
import { socket } from '@/shared/api/socket';
import {
  SOCKET_EVENTS,
  type CodeUpdatePayload,
  type RoomUsersPayload,
  type UserJoinedPayload,
  type UserLeftPayload,
} from '@codejam/common';

export const useSocket = (roomId: string) => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    // ==================================================================
    // 이벤트 핸들러
    // TODO: 여기서 상태를 업데이트하거나, 외부에서 socket.on으로 처리.
    // ==================================================================

    const onConnect = () => {
      console.log('🟢 Connected to Socket Server');
      setIsConnected(true);

      socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
        roomId,
      });
    };

    const onDisconnect = () => {
      console.log('🔴 Disconnected');
      setIsConnected(false);
    };

    const onUserJoined = (data: UserJoinedPayload) => {
      console.log(`👋 [USER_JOINED] ${data.user.nickname}`);
    };

    const onUserLeft = (data: UserLeftPayload) => {
      console.log(`👋 [USER_LEFT] SocketId: ${data.socketId}`);
    };

    const onRoomUsers = (data: RoomUsersPayload) => {
      console.log(`👥 [ROOM_USERS] Count: ${data.users.length}`, data.users);
    };

    const onSyncCode = (data: CodeUpdatePayload) => {
      console.log(`🔄 [SYNC_CODE] Length: ${data.code.length}`);
    };

    const onUpdateCode = (data: CodeUpdatePayload) => {
      console.log(`📝 [UPDATE_CODE] From Server (Length: ${data.code.length})`);
    };

    // ==================================================================
    // 리스너 등록
    // ==================================================================

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(SOCKET_EVENTS.USER_JOINED, onUserJoined);
    socket.on(SOCKET_EVENTS.USER_LEFT, onUserLeft);
    socket.on(SOCKET_EVENTS.ROOM_USERS, onRoomUsers);
    socket.on(SOCKET_EVENTS.SYNC_CODE, onSyncCode);
    socket.on(SOCKET_EVENTS.UPDATE_CODE, onUpdateCode);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(SOCKET_EVENTS.USER_JOINED, onUserJoined);
      socket.off(SOCKET_EVENTS.USER_LEFT, onUserLeft);
      socket.off(SOCKET_EVENTS.ROOM_USERS, onRoomUsers);
      socket.off(SOCKET_EVENTS.SYNC_CODE, onSyncCode);
      socket.off(SOCKET_EVENTS.UPDATE_CODE, onUpdateCode);
      socket.disconnect();
    };
  }, [roomId]);

  return { socket, isConnected };
};
