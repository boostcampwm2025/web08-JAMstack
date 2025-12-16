import { create } from "zustand";
import type { Participant } from "@/entities/participant";

import {
  data,
  participantId as currentParticipantId,
} from "@/widgets/participants/data";

interface ParticipantState {
  participants: Record<string, Participant>;
  currentParticipantId: string;
}

export const useParticipantStore = create<ParticipantState>()(() => ({
  // TODO: Mock data 제거
  participants: data,
  currentParticipantId: currentParticipantId,
}));

export const useParticipant = (id: string) => {
  return useParticipantStore((state) => state.participants[id]);
};
