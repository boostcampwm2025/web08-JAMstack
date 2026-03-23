import type {
  RoomJoinStatus,
  CreateQuickRoomResponse,
  CreateCustomRoomResponse,
  CreateCustomRoomRequest,
} from '@codejam/common';
import { API_ENDPOINTS, ROOM_JOIN_STATUS, MESSAGE } from '@codejam/common';

const API_BASE_URL = import.meta.env.PROD
  ? ''
  : import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function checkRoomJoinable(
  roomCode: string,
): Promise<RoomJoinStatus> {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.ROOM.JOINABLE(roomCode)}`,
  );
  const status = (await response.text()) as RoomJoinStatus;

  switch (status) {
    case ROOM_JOIN_STATUS.NOT_FOUND:
      throw new Error(MESSAGE.ERROR.ROOM_NOT_FOUND);
    case ROOM_JOIN_STATUS.FULL:
      return status;
    case ROOM_JOIN_STATUS.JOINABLE:
      return status;
    default:
      throw new Error(MESSAGE.ERROR.SERVER_ERROR);
  }
}

export async function createQuickRoom(): Promise<CreateQuickRoomResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.ROOM.CREATE_QUICK}`,
      {
        method: 'POST',
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      const message =
        errorData?.error?.message ||
        errorData?.message ||
        'Failed to create quick room';

      throw new Error(message);
    }

    return await response.json();
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

export const createCustomRoom = async (
  data: CreateCustomRoomRequest,
): Promise<CreateCustomRoomResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.ROOM.CREATE_CUSTOM}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      const message =
        errorData?.error?.message ||
        errorData?.message ||
        'Failed to create custom room';

      throw new Error(message);
    }

    return response.json();
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export const registerRoomParticipant = async (
  roomCode: string,
  nickname: string,
  password: string | null,
) => {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.ROOM.JOIN(roomCode)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, password }),
      credentials: 'include',
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data.error?.message || data.message || 'Failed to join room';
    throw new Error(message);
  }

  return data;
};

export async function verifyPassword(roomCode: string, password: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.ROOM.VERIFY(roomCode)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      const message =
        errorData?.error?.message ||
        errorData?.message ||
        'Failed to verify password';

      throw new Error(message);
    }

    return await response.json();
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

export async function getAuthStatus(
  roomCode: string,
): Promise<{ authenticated: boolean; token: string }> {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.ROOM.AUTH_STATUS(roomCode)}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const serverError = data.error;
    const error = new Error(
      serverError?.message || '인증 확인 실패',
    ) as Error & { code?: string };
    error.code = serverError?.code;
    throw error;
  }

  return data;
}
