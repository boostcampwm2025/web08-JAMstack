import { useCallback, useEffect, useState } from 'react';
import { socket } from '@/shared/api/socket';
import {
  SOCKET_EVENTS,
  type CodeUpdatePayload,
  type RoomPtsPayload,
  type PtJoinedPayload,
  type PtLeftPayload,
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

    const onPtJoined = (data: PtJoinedPayload) => {
      console.log(`👋 [PT_JOINED] ${data.pt.nickname}`);
    };

    const onPtLeft = (data: PtLeftPayload) => {
      console.log(`👋 [PT_LEFT] SocketId: ${data.socketId}`);
    };

    const onRoomPts = (data: RoomPtsPayload) => {
      console.log(`👥 [ROOM_PTS] Count: ${data.pts.length}`, data.pts);
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
    socket.on(SOCKET_EVENTS.PT_JOINED, onPtJoined);
    socket.on(SOCKET_EVENTS.PT_LEFT, onPtLeft);
    socket.on(SOCKET_EVENTS.ROOM_PTS, onRoomPts);
    socket.on(SOCKET_EVENTS.SYNC_CODE, onSyncCode);
    socket.on(SOCKET_EVENTS.UPDATE_CODE, onUpdateCode);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(SOCKET_EVENTS.PT_JOINED, onPtJoined);
      socket.off(SOCKET_EVENTS.PT_LEFT, onPtLeft);
      socket.off(SOCKET_EVENTS.ROOM_PTS, onRoomPts);
      socket.off(SOCKET_EVENTS.SYNC_CODE, onSyncCode);
      socket.off(SOCKET_EVENTS.UPDATE_CODE, onUpdateCode);
    };
  }, [roomId]);

  // ==================================================================
  // Emitting Methods (Public)
  // 컴포넌트에서 비즈니스 로직을 수행할 때 호출하는 함수들
  // ==================================================================

  /**
   * 코드 변경 사항 전송
   * @param code 변경된 전체 코드 문자열
   */
  const sendCode = useCallback(
    (code: string) => {
      if (socket.connected) {
        socket.emit(SOCKET_EVENTS.UPDATE_CODE, { roomId, code });
      }
    },
    [roomId]
  );

  return {
    socket, // 필요 시 외부에서 직접 리스너 등록 가능 (Zustand 등에서 사용)
    isConnected, // 연결 상태 표시 UI용
    sendCode, // 코드 전송 함수
  };
};
