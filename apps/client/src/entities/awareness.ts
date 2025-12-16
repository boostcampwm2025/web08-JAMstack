import type { EditorCursor } from "./interaction";

/** Base Awareness */

interface Awareness {
  participantId: string;
  fileId: string;
  type: string;
}

/** Editor Awareness */

export interface EditorAwareness extends Awareness {
  type: "editor.cursor";
  cursor?: EditorCursor;
}
