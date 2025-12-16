import { createContext, useContext } from "react";
import type { Participant } from "@/entities/participant";

export const ParticipantContext = createContext<Participant | null>(null);

export function useParticipant() {
  const context = useContext(ParticipantContext);

  const message = "useParticipant must be used within a Participant component";
  if (!context) throw new Error(message);

  return context;
}
