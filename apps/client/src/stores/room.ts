import { create } from 'zustand';
import type {
  RoomType,
  WhoCanDestroyRoom,
  RoomCode,
  PtId,
} from '@codejam/common';
import { getAuthStatus } from '@/shared/api/room';
import { emitJoinRoom } from '@/stores/socket-events';
import { socket } from '@/shared/api/socket';

interface RoomState {
  roomCode: RoomCode | null;
  myPtId: PtId | null;
  roomType: RoomType | null;
  whoCanDestroyRoom: WhoCanDestroyRoom | null;
  hasHostPassword: boolean | null;

  setRoomCode: (roomCode: RoomCode | null) => void;
  setMyPtId: (myPtId: PtId | null) => void;
  setRoomType: (roomType: RoomType | null) => void;
  setWhoCanDestroyRoom: (whoCanDestroyRoom: WhoCanDestroyRoom | null) => void;
  setHasHostPassword: (hasHostPassword: boolean | null) => void;
  joinSocketRoom: (roomCode: RoomCode, token?: string) => Promise<void>;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomCode: null,
  myPtId: null,
  roomType: null,
  whoCanDestroyRoom: null,
  hasHostPassword: null,

  setRoomCode: (roomCode) => set({ roomCode }),
  setMyPtId: (myPtId) => set({ myPtId }),
  setRoomType: (roomType) => set({ roomType }),
  setWhoCanDestroyRoom: (whoCanDestroyRoom) => set({ whoCanDestroyRoom }),
  setHasHostPassword: (hasHostPassword) => set({ hasHostPassword }),
  joinSocketRoom: async (roomCode, token) => {
    if (!socket.connected) return;

    try {
      const status = await getAuthStatus(roomCode);
      emitJoinRoom(roomCode, token ?? status.token);
    } catch {
      return;
    }
  },
}));
