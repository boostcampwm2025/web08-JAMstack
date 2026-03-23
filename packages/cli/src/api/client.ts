import {
  API_ENDPOINTS,
  type CreateQuickRoomResponse,
  type CreateCustomRoomResponse,
  type CreateCustomRoomRequest,
  type RoomJoinStatus,
} from '@codejam/common';

export class ApiClient {
  constructor(private baseUrl: string) {}

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      const message =
        errorData?.error?.message ||
        errorData?.message ||
        `Request failed: ${response.statusText}`;

      throw new Error(message);
    }

    return response.json();
  }

  async createQuickRoom(): Promise<CreateQuickRoomResponse> {
    return this.request<CreateQuickRoomResponse>(
      API_ENDPOINTS.ROOM.CREATE_QUICK,
      {
        method: 'POST',
      },
    );
  }

  async createCustomRoom(
    request: CreateCustomRoomRequest,
  ): Promise<CreateCustomRoomResponse> {
    const response = await fetch(
      `${this.baseUrl}${API_ENDPOINTS.ROOM.CREATE_CUSTOM}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      const message =
        errorData?.error?.message ||
        errorData?.message ||
        `Request failed: ${response.statusText}`;

      throw new Error(message);
    }

    const data = await response.json();

    // Extract token from Set-Cookie header
    const setCookie = response.headers.get('set-cookie');
    let token: string | undefined;

    if (setCookie) {
      // Parse: auth_ROOMCODE=TOKEN; ...
      const match = setCookie.match(/auth_[^=]+=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    return { ...data, token };
  }

  async checkJoinable(roomCode: string): Promise<RoomJoinStatus> {
    const response = await fetch(
      `${this.baseUrl}${API_ENDPOINTS.ROOM.JOINABLE(roomCode)}`,
      {
        method: 'GET',
      },
    );

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    const text = await response.text();
    // Remove quotes if the response is a quoted string like "JOINABLE"
    return text.replace(/^"|"$/g, '') as RoomJoinStatus;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${API_ENDPOINTS.HEALTH}`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
