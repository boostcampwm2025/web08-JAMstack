import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { SessionResponseDto } from '@codejam/common';

@Injectable()
export class RoomService {
  // TODO: 현재 닉네임과 색깔 중복 가능 랜덤입니다. 고유성 보장을 위한 수정 필요.(UserStory2, Task4)

  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}

  async createSession(): Promise<SessionResponseDto> {
    // 1. 세션 정보 생성
    const sessionId = uuidv4();
    const nickname = this.generateRandomNickname();
    const color = this.generateRandomColor();
    const joinedAt = Date.now();

    const session: SessionResponseDto = {
      sessionId,
      nickname,
      color,
      joinedAt,
    };

    // 2. Redis에 저장
    await this.redis.set(
      `room:prototype:session:${sessionId}`,
      JSON.stringify(session),
    );

    // 3. 프론트엔드에 반환(response)
    return session;
  }

  private generateRandomNickname(): string {
    const names = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private generateRandomColor(): string {
    const colors = [
      '#ef4444',
      '#22c55e',
      '#3b82f6',
      '#eab308',
      '#a855f7',
      '#ec4899',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
