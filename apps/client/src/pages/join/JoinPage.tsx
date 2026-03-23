import { useEffect } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { ROUTES, ROOM_CONFIG } from '@codejam/common';
import { Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';

export default function JoinPage() {
  const { roomCode, token } = useLoaderData() as {
    roomCode: string;
    token: string;
  };
  const navigate = useNavigate();

  useEffect(() => {
    // Save token to cookie
    const cookieName = `auth_${roomCode.toUpperCase()}`;
    const isProduction = import.meta.env.PROD;

    Cookies.set(cookieName, token, {
      expires: ROOM_CONFIG.COOKIE_MAX_AGE / (1000 * 60 * 60 * 24), // Convert ms to days
      path: '/',
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });

    // Navigate to room
    const url = ROUTES.ROOM(roomCode);
    navigate(url, { replace: true });
  }, [roomCode, token, navigate]);

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <section className="flex flex-col items-center text-center">
        <Loader2 className="text-primary mb-4 h-16 w-16 animate-spin" />
        <h1 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">
          방 참가 중
        </h1>
        <p className="mb-8 text-gray-500 dark:text-gray-400">
          잠시만 기다려 주세요...
        </p>
      </section>
    </main>
  );
}
