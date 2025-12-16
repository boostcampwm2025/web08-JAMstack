/** Base Interaction state */

export interface InteractionState {
  type: string;
}

/** Editor cursor */

export interface EditorCursor {
  state: EditorFocusState | EditorSelectionState;
}

export interface EditorCursorPosition {
  line: number;
  column: number;
}

/** Editor interaction state
 * - Focus
 * - Selection
 */

export interface EditorInteractionState extends InteractionState {
  type: `editor.${string}`;
}

export interface EditorFocusState extends EditorInteractionState {
  type: "editor.focus";
  position: EditorCursorPosition;
}

export interface EditorSelectionState extends EditorInteractionState {
  type: "editor.selection";
  from: EditorCursorPosition;
  to: EditorCursorPosition;
}
