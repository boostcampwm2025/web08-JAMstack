import { useMemo } from "react";
import { Participant } from "./Participant";
import { sorter } from "./sorter";
import { useParticipantStore } from "@/stores/participants";

export function Participants() {
  const participants = useParticipantStore((state) => state.participants);
  const sorted = useMemo(
    () => Object.values(participants).sort(sorter),
    [participants]
  );

  const count = sorted.length;

  return (
    <div className="w-full max-w-xs bg-white dark:bg-gray-800 p-4 font-sans">
      <h2 className="text-sm font-bold uppercase text-gray-700 dark:text-gray-200 border-b pb-2 mb-2">
        PARTICIPANTS ({count})
      </h2>

      <div className="space-y-1 mt-4">
        {sorted.map((p) => (
          <Participant key={p.id} id={p.id} />
        ))}
      </div>
    </div>
  );
}
