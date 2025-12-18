import { create } from "zustand";
import { roomId } from "@/widgets/participants/data";

interface RoomState {
  roomId: string | null;
  myPtId: string | null;

  setRoomId: (roomId: string | null) => void;
  setMyPtId: (myPtId: string | null) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomId: roomId,
  myPtId: null,

  setRoomId: (roomId) => set({ roomId }),
  setMyPtId: (myPtId) => set({ myPtId }),
}));
