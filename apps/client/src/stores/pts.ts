import { create } from "zustand";
import type { Pt } from "@/entities/participant";
import { data } from "@/widgets/participants/data";

interface PtsState {
  pts: Record<string, Pt>;

  setPts: (pts: Record<string, Pt>) => void;
  setPt: (ptId: string, pt: Pt) => void;
}

// TODO: Mock 데이터 제거
// pts 를 {} 로 초기화

export const usePtsStore = create<PtsState>((set) => ({
  pts: data,

  setPts: (newPts) => set({ pts: newPts }),
  setPt: (ptId, pt) => set((state) => ({ pts: { ...state.pts, [ptId]: pt } })),
}));

export const usePts = () => {
  return usePtsStore((state) => state.pts);
};

export const usePt = (ptId: string) => {
  return usePtsStore((state) => state.pts[ptId]);
};
