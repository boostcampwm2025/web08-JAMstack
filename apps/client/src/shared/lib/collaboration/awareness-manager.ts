import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
} from 'y-protocols/awareness';
import type { AwarenessUpdate } from '@codejam/common';

export class AwarenessManager {
  private awareness: Awareness;
  private pendingUpdates: Uint8Array[] = [];
  private isBuffering: boolean = false;

  constructor(awareness: Awareness) {
    this.awareness = awareness;
  }

  /**
   * Get the Awareness instance
   */
  getAwareness(): Awareness {
    return this.awareness;
  }

  /**
   * Register a callback to be called when Awareness is updated
   * Callback receives encoded update and origin
   *
   * Note: Developer should check origin to prevent echo loops when sending to server.
   * Example: if (origin === 'remote') return;
   */
  onUpdate(
    callback: (encodedUpdate: Uint8Array, origin: unknown) => void,
  ): void {
    this.awareness.on('update', (changes: AwarenessUpdate, origin: unknown) => {
      const { added, updated, removed } = changes;

      const changed = added.concat(updated, removed);
      if (changed.length === 0) return;

      // Encode update for transmission
      const message = encodeAwarenessUpdate(this.awareness, changed);
      callback(message, origin);
    });
  }

  /**
   * Apply awareness update from network
   */
  applyUpdate(message: Uint8Array, origin: unknown): void {
    const update =
      message instanceof Uint8Array ? message : new Uint8Array(message);

    applyAwarenessUpdate(this.awareness, update, origin);
  }

  /**
   * Apply remote awareness update
   */
  applyRemoteUpdate(message: Uint8Array): void {
    // Buffer updates during composition to prevent cursor position inconsistencies
    if (this.isBuffering) {
      this.pendingUpdates.push(message);
      return;
    }

    this.applyUpdate(message, 'remote');
  }

  /**
   * Enable or disable buffering of remote updates
   * When disabled, automatically flushes any pending updates
   */
  setBuffering(enabled: boolean): void {
    const wasBuffering = this.isBuffering;
    const isBuffering = enabled;
    this.isBuffering = isBuffering;
    if (isBuffering === wasBuffering) return;

    // Flush pending updates when buffering is disabled
    if (wasBuffering && !isBuffering && this.pendingUpdates.length > 0) {
      this.flushPendingUpdates();
    }
  }

  /**
   * Flush all pending buffered updates
   */
  private flushPendingUpdates(): void {
    // Snapshot current buffer and clear it
    // (handles re-entrancy if user starts composing during flush)
    const updates = [...this.pendingUpdates];
    this.pendingUpdates = [];

    // Apply all buffered updates sequentially
    for (const update of updates) {
      this.applyUpdate(update, 'remote');
    }
  }

  /**
   * Get local awareness state
   */
  getLocalState(): Record<string, unknown> | null {
    return this.awareness.getLocalState();
  }

  /**
   * Get local awareness state field
   */
  getLocalStateField(key: string): unknown {
    const state = this.awareness.getLocalState();
    return state?.[key];
  }

  /**
   * Set local awareness state field
   */
  setLocalStateField(key: string, value: unknown): void {
    this.awareness.setLocalStateField(key, value);
  }

  /**
   * Encode local awareness update
   */
  encodeLocalUpdate(): Uint8Array {
    return encodeAwarenessUpdate(this.awareness, [this.awareness.clientID]);
  }

  /**
   * Update current file in awareness
   */
  setCurrentFileId(fileId: string): void {
    const state = this.awareness.getLocalState();

    this.awareness.setLocalStateField('user', {
      ...state?.user,
      currentFileId: fileId,
    });
  }

  /**
   * Destroy awareness
   */
  destroy(): void {
    this.awareness.destroy();
  }
}
