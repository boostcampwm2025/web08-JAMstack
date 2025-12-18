import { create } from "zustand";
import type { Pt } from "@codejam/common";

interface PtsState {
  pts: Record<string, Pt>;

  setPts: (pts: Record<string, Pt>) => void;
  setPt: (ptId: string, pt: Pt) => void;
  removePt: (ptId: string) => void;

  updatePtPresence: (ptId: string, presence: Pt["presence"]) => void;
}

export const usePtsStore = create<PtsState>((set) => ({
  pts: {},

  setPts: (newPts) => set({ pts: newPts }),
  setPt: (ptId, pt) => set((state) => ({ pts: { ...state.pts, [ptId]: pt } })),

  removePt: (ptId) =>
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [ptId]: _, ...rest } = state.pts;
      return { pts: rest };
    }),

  updatePtPresence: (ptId, presence) =>
    set((state) => {
      const pt = state.pts[ptId];
      if (!pt) return state;
      return { pts: { ...state.pts, [ptId]: { ...pt, presence } } };
    }),
}));

export const usePts = () => {
  return usePtsStore((state) => state.pts);
};

export const usePt = (ptId: string) => {
  return usePtsStore((state) => state.pts[ptId]);
};
