import { Doc } from "yjs";
import { writeUpdate } from "y-protocols/sync";
import { Awareness, encodeAwarenessUpdate } from "y-protocols/awareness";
import { useEffect, useMemo } from "react";
import { useSocket } from "./useSocket";
import type { Socket } from "socket.io-client";
import { createEncoder, toUint8Array } from "lib0/encoding";
import { SOCKET_EVENTS } from "@codejam/common";

const ROOM_ID = "prototype";

type AwarenessUpdate = {
  added: number[];
  updated: number[];
  removed: number[];
};

export const useYDoc = (key: string) => {
  const yDoc = useMemo(() => new Doc(), []);
  const yText = useMemo(() => yDoc.getText(key), [yDoc, key]);
  const awareness = useMemo(() => new Awareness(yDoc), [yDoc]);

  const { socket, isConnected } = useSocket(ROOM_ID, yDoc, awareness);

  useEffect(() => {
    const yDocUpdate = (update: Uint8Array, origin: "remote" | Socket) => {
      if (!isConnected || origin === "remote") {
        return;
      }

      const encoder = createEncoder();
      writeUpdate(encoder, update);
      const code = toUint8Array(encoder);

      socket.emit(SOCKET_EVENTS.UPDATE_FILE, {
        roomId: ROOM_ID,
        code,
      });
    };

    const awarenessUpdate = (
      { added, removed, updated }: AwarenessUpdate,
      origin: "remote" | Socket
    ) => {
      if (!isConnected || origin === "remote") {
        return;
      }

      const changed = added.concat(updated, removed);
      if (changed.length === 0) {
        return;
      }

      const message = encodeAwarenessUpdate(awareness, changed);

      socket.emit(SOCKET_EVENTS.UPDATE_AWARENESS, { message });
    };

    yDoc.on("update", yDocUpdate);
    awareness.on("update", awarenessUpdate);

    const handleUnload = () => {
      awareness.setLocalState(null);
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      yDoc.off("update", yDocUpdate);
      awareness.off("update", awarenessUpdate);
    };
  }, [key, isConnected, socket]);

  return { yDoc, yText, awareness };
};
