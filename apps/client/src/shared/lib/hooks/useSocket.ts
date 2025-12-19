import { useState, useEffect } from "react";
import { socket } from "@/shared/api/socket";
import {
  SOCKET_EVENTS,
  type Pt,
  type PtUpdatePayload,
  type FileUpdatePayload,
  type AwarenessUpdatePayload,
  type RoomPtsPayload,
  type RoomFilesPayload,
  type RoomAwarenessesPayload,
  type WelcomePayload,
  type PtJoinedPayload,
  type PtDisconnectPayload,
  type PtLeftPayload,
} from "@codejam/common";
import { usePtsStore } from "@/stores/pts";
import { useRoomStore } from "@/stores/room";
import { createDecoder } from "lib0/decoding";
import { createEncoder, toUint8Array } from "lib0/encoding";
import { readSyncMessage } from "y-protocols/sync.js";
import { type Doc } from "yjs";
import { applyAwarenessUpdate, type Awareness } from "y-protocols/awareness.js";

// TODO: Socket 을 YDoc 이 생성하고 있음
// useYDoc 은 useSocket 을 사용하며 useSocket 은 awareness 에 의존하고 있음
// Socket 을 Y.Doc.ClientID 없이 생성하면 문제를 해결할 수 있음

export const useSocket = (roomId: string, yDoc: Doc, awareness: Awareness) => {
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
      console.log("🟢 Connected to Socket Server");
      setIsConnected(true);

      // localStorage에서 기존 ptId 조회 (재접속용)
      const savedPtId = localStorage.getItem(`ptId:${roomId}`);
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
        roomId,
        clientId: yDoc.clientID,
        ptId: savedPtId || undefined,
      });
    };

    const convertU8 = (code: Uint8Array | ArrayBuffer): Uint8Array => {
      if (code instanceof ArrayBuffer) return new Uint8Array(code);
      return code;
    };

    const handleSync = (code: Uint8Array | ArrayBuffer) => {
      const u8 = convertU8(code);

      const decoder = createDecoder(u8);
      const encoder = createEncoder();

      readSyncMessage(decoder, encoder, yDoc, "remote");

      const reply = toUint8Array(encoder);
      if (reply.byteLength > 0) {
        socket.emit(SOCKET_EVENTS.UPDATE_FILE, { roomId, code: reply });
      }
    };

    const onDisconnect = () => {
      console.log("🔴 Disconnected");
      setIsConnected(false);
    };

    const onWelcome = (data: WelcomePayload) => {
      console.log(`🎉 [WELCOME] My PtId: ${data.myPtId}`);

      localStorage.setItem(`ptId:${roomId}`, data.myPtId);

      const { setMyPtId } = useRoomStore.getState();
      setMyPtId(data.myPtId);
    };

    const onPtJoined = (data: PtJoinedPayload) => {
      console.log(`👋 [PT_JOINED] ${data.pt.nickname}`);

      const { setPt } = usePtsStore.getState();
      setPt(data.pt.ptId, data.pt);
    };

    const onPtDisconnect = (data: PtDisconnectPayload) => {
      console.log(`👋 [PT_DISCONNECT] PtId: ${data.ptId}`);
      const pt = usePtsStore.getState().pts[data.ptId];
      if (!pt) return;
      const { setPt } = usePtsStore.getState();
      setPt(pt.ptId, { ...pt, presence: "offline" });
    };

    const onPtLeft = (data: PtLeftPayload) => {
      console.log(`⏰ [PT_LEFT] PtId: ${data.ptId} removed by TTL expiration`);

      const { removePt } = usePtsStore.getState();
      removePt(data.ptId);
    };

    const onRoomPts = (data: RoomPtsPayload) => {
      console.log(`👥 [ROOM_PTS]`, data.pts);

      const pts: Pt[] = data.pts;

      const newPts: Record<string, Pt> = pts.reduce((acc, pt) => {
        acc[pt.ptId] = pt;
        return acc;
      }, {} as Record<string, Pt>);

      const { setPts } = usePtsStore.getState();
      setPts(newPts);
    };

    const onRoomFiles = (data: RoomFilesPayload) => {
      console.log(`📁 [ROOM_FILES]`);
      const { code } = data;
      handleSync(code);
    };

    const onRoomAwarenesses = (data: RoomAwarenessesPayload) => {
      console.log(`🧍 [ROOM_AWARENESSES]`);
      const { message } = data;
      const u8 = convertU8(message);
      applyAwarenessUpdate(awareness, u8, "remote");
    };

    const onUpdatePt = (data: PtUpdatePayload) => {
      console.log(
        `🔄 [UPDATE_PT] PtId: ${data.pt.ptId} Nickname: ${data.pt.nickname}`
      );

      const pt = usePtsStore.getState().pts[data.pt.ptId];
      if (!pt) return;

      const newPt = { ...pt, ...data.pt };
      const { setPt } = usePtsStore.getState();

      setPt(data.pt.ptId, newPt);
    };

    const onUpdateFile = (data: FileUpdatePayload) => {
      console.log(`📝 [UPDATE_FILE] From Server`);
      const { code } = data;
      handleSync(code);
    };

    const onUpdateAwareness = (data: AwarenessUpdatePayload) => {
      console.log(`🧍 [UPDATE_AWARENESS] From Server`);

      const { message } = data;
      const u8 = convertU8(message);
      applyAwarenessUpdate(awareness, u8, "remote");
    };

    // ==================================================================
    // 리스너 등록
    // ==================================================================

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on(SOCKET_EVENTS.WELCOME, onWelcome);
    socket.on(SOCKET_EVENTS.PT_JOINED, onPtJoined);
    socket.on(SOCKET_EVENTS.PT_DISCONNECT, onPtDisconnect);
    socket.on(SOCKET_EVENTS.PT_LEFT, onPtLeft);
    socket.on(SOCKET_EVENTS.ROOM_PTS, onRoomPts);
    socket.on(SOCKET_EVENTS.ROOM_FILES, onRoomFiles);
    socket.on(SOCKET_EVENTS.ROOM_AWARENESSES, onRoomAwarenesses);
    socket.on(SOCKET_EVENTS.UPDATE_PT, onUpdatePt);
    socket.on(SOCKET_EVENTS.UPDATE_FILE, onUpdateFile);
    socket.on(SOCKET_EVENTS.UPDATE_AWARENESS, onUpdateAwareness);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off(SOCKET_EVENTS.WELCOME, onWelcome);
      socket.off(SOCKET_EVENTS.PT_JOINED, onPtJoined);
      socket.off(SOCKET_EVENTS.PT_DISCONNECT, onPtDisconnect);
      socket.off(SOCKET_EVENTS.PT_LEFT, onPtLeft);
      socket.off(SOCKET_EVENTS.ROOM_PTS, onRoomPts);
      socket.off(SOCKET_EVENTS.ROOM_FILES, onRoomFiles);
      socket.off(SOCKET_EVENTS.ROOM_AWARENESSES, onRoomAwarenesses);
      socket.off(SOCKET_EVENTS.UPDATE_PT, onUpdatePt);
      socket.off(SOCKET_EVENTS.UPDATE_FILE, onUpdateFile);
      socket.off(SOCKET_EVENTS.UPDATE_AWARENESS, onUpdateAwareness);
    };
  }, [roomId, awareness, yDoc]);

  // ==================================================================
  // 컴포넌트에서 비즈니스 로직을 수행할 때 호출하는 함수들
  // ==================================================================

  /**
   * 범용 전송 함수
   */
  const send = <T>(event: string, payload: T) => {
    if (socket.connected) {
      socket.emit(event, payload);
    }
  };

  return {
    socket, // 필요 시 외부에서 직접 리스너 등록 가능 (Zustand 등에서 사용)
    isConnected, // 연결 상태 표시 UI용
    send, // 범용 전송 함수
  };
};
