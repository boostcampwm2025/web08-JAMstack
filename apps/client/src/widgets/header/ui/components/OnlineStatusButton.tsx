import { Button } from '@codejam/ui';
import { Wifi, WifiOff } from 'lucide-react';
import { socket } from '@/shared/api/socket';
import { useSocketStore } from '@/stores/socket';

export function OnlineStatusButton() {
  const connected = useSocketStore((state) => state.isConnected);
  const connect = () => socket.connect();
  const disconnect = () => socket.disconnect();

  const handleSocketToggle = () => {
    if (!connected) connect();
    else disconnect();
  };

  return (
    <Button
      size="icon-sm"
      variant="ghost"
      title={connected ? '온라인' : '오프라인'}
      onClick={handleSocketToggle}
    >
      {connected ? <Wifi /> : <WifiOff />}
    </Button>
  );
}
