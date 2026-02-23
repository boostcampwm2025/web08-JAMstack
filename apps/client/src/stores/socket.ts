import { create } from 'zustand';
import type { RoomCode } from '@codejam/common';
import { socket } from '@/shared/api/socket';
import { setupDomainEventHandlers } from './socket-events';
import { useRoomStore } from './room';

interface SocketState {
  socket: typeof socket;
  isConnected: boolean;
  roomCode: RoomCode | null;

  cleanup: () => void;

  // Actions
  connect: (roomCode: string) => void;
  disconnect: () => void;
  send: (event: string, ...args: unknown[]) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket,
  isConnected: socket.connected,
  roomCode: null,

  cleanup: () => {},

  connect: (roomCode: string) => {
    const state = get();

    // Guard: Already connected to this room
    if (state.roomCode === roomCode && socket.connected) {
      const { joinSocketRoom } = useRoomStore.getState();
      void joinSocketRoom(roomCode);
      return;
    }

    // Cleanup previous connection if switching rooms
    if (state.roomCode && state.roomCode !== roomCode) {
      state.cleanup();
    }

    const onConnect = () => {
      set({ isConnected: true });
      if (!roomCode) return;

      const { joinSocketRoom } = useRoomStore.getState();
      void joinSocketRoom(roomCode);
    };

    const onDisconnect = () => {
      set({ isConnected: false });
    };

    // Setup connection event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Setup domain-specific event handlers
    const cleanupDomainEventHandlers = setupDomainEventHandlers();

    // Store cleanup function
    const cleanupListeners = () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      cleanupDomainEventHandlers();
    };

    set({ roomCode, cleanup: cleanupListeners });

    // Connect socket if not connected
    if (!socket.connected) {
      socket.connect();
    }
  },

  disconnect: () => {
    const state = get();
    state.cleanup();
    socket.disconnect();

    set({ isConnected: false, roomCode: null });
  },

  send: (event: string, ...args: unknown[]) => {
    if (!socket.connected) return;
    socket.emit(event, ...args);
  },
}));
