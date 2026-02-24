import { socket } from '@/shared/api/socket';
import { SOCKET_EVENTS, type WelcomePayload } from '@codejam/common';
import { useRoomStore } from '../room';
import { useFileStore } from '../file';

import { toast } from '@codejam/ui';

const redirectToHome = () => {
  window.location.href = '/';
};

export const setupRoomEventHandlers = () => {
  const onWelcome = (data: WelcomePayload) => {
    const { myPtId, roomType, whoCanDestroyRoom, hasHostPassword } = data;
    const {
      roomCode,
      setMyPtId,
      setRoomType,
      setWhoCanDestroyRoom,
      setHasHostPassword,
    } = useRoomStore.getState();
    if (!roomCode) return;

    setMyPtId(myPtId);
    setRoomType(roomType);
    setWhoCanDestroyRoom(whoCanDestroyRoom);
    setHasHostPassword(hasHostPassword);

    const { sync } = useFileStore.getState();
    sync(roomCode);
  };

  const onGoodbye = () => {
    redirectToHome();
  };

  const onRoomDestroyed = () => {
    let countdown = 3;
    const toastId = toast.error('방이 폭파되었습니다.', {
      description: `${countdown}초 후 홈으로 이동합니다.`,
      duration: Infinity, // 자동으로 사라지지 않음
    });

    const interval = setInterval(() => {
      countdown -= 1;
      if (countdown > 0) {
        toast.error('방이 폭파되었습니다.', {
          id: toastId,
          description: `${countdown}초 후 홈으로 이동합니다.`,
          duration: Infinity,
        });
      } else {
        clearInterval(interval);
        toast.dismiss(toastId);
        window.location.href = '/';
      }
    }, 1000);
  };

  socket.on(SOCKET_EVENTS.WELCOME, onWelcome);
  socket.on(SOCKET_EVENTS.GOODBYE, onGoodbye);
  socket.on(SOCKET_EVENTS.ROOM_DESTROYED, onRoomDestroyed);

  return () => {
    socket.off(SOCKET_EVENTS.WELCOME, onWelcome);
    socket.off(SOCKET_EVENTS.GOODBYE, onGoodbye);
    socket.off(SOCKET_EVENTS.ROOM_DESTROYED, onRoomDestroyed);
  };
};

export const emitJoinRoom = (roomCode: string, token: string | null) => {
  socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
    roomCode,
    token,
  });
};

export const emitLeftRoom = () => {
  socket.emit(SOCKET_EVENTS.LEFT_ROOM);
};
