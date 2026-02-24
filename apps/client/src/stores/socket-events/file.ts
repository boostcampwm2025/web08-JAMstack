import { socket } from '@/shared/api/socket';
import {
  SOCKET_EVENTS,
  type RoomDocPayload,
  type RoomAwarenessPayload,
  type FileUpdatePayload,
  type AwarenessUpdatePayload,
} from '@codejam/common';
import { useFileStore } from '../file';
import { toUint8Array } from '@/shared/lib/collaboration/buffer';

export const setupFileEventHandlers = () => {
  const onRoomDoc = (data: RoomDocPayload) => {
    const { snapshot: rawSnapshot, updates: rawUpdates } = data;
    const snapshot = toUint8Array(rawSnapshot);
    const updates = rawUpdates.map((rawUpdate) => toUint8Array(rawUpdate));

    const { applyRemoteDocSnapshot } = useFileStore.getState();
    applyRemoteDocSnapshot(snapshot, updates);
  };

  const onRoomAwareness = (data: RoomAwarenessPayload) => {
    const { message: rawMessage } = data;
    const message = toUint8Array(rawMessage);

    const { applyRemoteAwarenessUpdate } = useFileStore.getState();
    applyRemoteAwarenessUpdate(message);
  };

  const onUpdateFile = (data: FileUpdatePayload) => {
    const { message: rawMessage } = data;
    const message = toUint8Array(rawMessage);

    const { applyRemoteDocUpdate } = useFileStore.getState();
    applyRemoteDocUpdate(message);
  };

  const onUpdateAwareness = (data: AwarenessUpdatePayload) => {
    const { message: rawMessage } = data;
    const message = toUint8Array(rawMessage);

    const { applyRemoteAwarenessUpdate } = useFileStore.getState();
    applyRemoteAwarenessUpdate(message);
  };

  socket.on(SOCKET_EVENTS.ROOM_DOC, onRoomDoc);
  socket.on(SOCKET_EVENTS.ROOM_AWARENESS, onRoomAwareness);
  socket.on(SOCKET_EVENTS.UPDATE_FILE, onUpdateFile);
  socket.on(SOCKET_EVENTS.UPDATE_AWARENESS, onUpdateAwareness);

  return () => {
    socket.off(SOCKET_EVENTS.ROOM_DOC, onRoomDoc);
    socket.off(SOCKET_EVENTS.ROOM_AWARENESS, onRoomAwareness);
    socket.off(SOCKET_EVENTS.UPDATE_FILE, onUpdateFile);
    socket.off(SOCKET_EVENTS.UPDATE_AWARENESS, onUpdateAwareness);
  };
};

export const emitFileUpdate = (roomCode: string, message: Uint8Array) => {
  if (!socket.connected) return;

  socket.emit(SOCKET_EVENTS.UPDATE_FILE, {
    roomCode,
    message,
  });
};

export const emitAwarenessUpdate = (roomCode: string, message: Uint8Array) => {
  if (!socket.connected) return;

  socket.emit(SOCKET_EVENTS.UPDATE_AWARENESS, {
    roomCode,
    message,
  });
};
