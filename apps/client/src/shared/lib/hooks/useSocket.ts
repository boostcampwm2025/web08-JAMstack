import { useEffect, useState } from 'react';
import { socket } from '@/shared/api/socket';

export const useSocket = (roomId: string) => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      console.log('🟢 Connected to Socket Server');
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log('🔴 Disconnected');
      setIsConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [roomId]);

  return { socket, isConnected };
};
