import { create } from "zustand";
import { roomId, myPtId } from "@/widgets/participants/data";

interface RoomState {
  roomId: string | null;
  myPtId: string | null;

  setRoomId: (roomId: string | null) => void;
  setMyPtId: (myPtId: string | null) => void;
}

// TODO: Mock 데이터 제거
// roomId 와 myPtId 를 null 로 초기화

export const useRoomStore = create<RoomState>((set) => ({
  roomId: roomId,
  myPtId: myPtId,

  setRoomId: (roomId) => set({ roomId }),
  setMyPtId: (myPtId) => set({ myPtId }),
}));
