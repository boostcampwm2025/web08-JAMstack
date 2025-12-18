import { Pt } from '@codejam/common';
import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RoomService {
  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}

  /**
   * 새 참가자 생성 + Redis 저장
   */
  async createPt(roomId: string): Promise<Pt> {
    const ptId = uuidv4();
    const pt: Pt = {
      ptId,
      nickname: this.generateRandomNickname(),
      color: this.generateRandomColor(),
      role: 'editor',
      presence: 'online',
      joinedAt: new Date().toISOString(),
    };

    await this.redis.set(`room:${roomId}:pt:${ptId}`, JSON.stringify(pt));

    return pt;
  }

  /**
   * Redis에서 특정 roomId와 ptId를 가진 pt 조회
   */
  async getPt(roomId: string, ptId: string): Promise<Pt | null> {
    const data = await this.redis.get(`room:${roomId}:pt:${ptId}`);
    return data ? (JSON.parse(data) as Pt) : null;
  }

  /**
   * 재접속 시 복원: TTL 제거 + presence를 online으로 변경
   */
  async restorePt(roomId: string, ptId: string): Promise<Pt | null> {
    const pt = await this.getPt(roomId, ptId);
    if (!pt) return null;

    pt.presence = 'online';
    const key = `room:${roomId}:pt:${ptId}`;

    await this.redis.set(key, JSON.stringify(pt));
    await this.redis.persist(key); // TTL 제거

    return pt;
  }

  /**
   * disconnect 처리: presence를 offline으로 변경 + TTL 5분 설정
   */
  async disconnectPt(roomId: string, ptId: string): Promise<void> {
    const pt = await this.getPt(roomId, ptId);
    if (!pt) return;

    pt.presence = 'offline';
    const key = `room:${roomId}:pt:${ptId}`;
    await this.redis.set(key, JSON.stringify(pt), 'EX', 300); // 5분 TTL
  }

  /**
   * 방의 모든 참가자 조회
   */
  async getAllPts(roomId: string): Promise<Pt[]> {
    const keys = await this.redis.keys(`room:${roomId}:pt:*`);
    if (!keys.length) return [];

    const values = await this.redis.mget(keys);
    return values.filter(Boolean).map((v) => JSON.parse(v!));
  }

  /**
   * 방의 현재 코드 조회
   */
  async getCode(roomId: string): Promise<string> {
    const data = await this.redis.get(`room:${roomId}:code`);
    return data ? JSON.parse(data).code : '';
  }

  /**
   * 코드 저장
   */
  async saveCode(roomId: string, code: string): Promise<void> {
    await this.redis.set(`room:${roomId}:code`, JSON.stringify({ code }));
  }

  /**
   * 방 존재 여부 확인 (GET /api/room/:roomId/exists 용)
   */
  async roomExists(roomId: string): Promise<boolean> {
    const keys = await this.redis.keys(`room:${roomId}:*`);
    return keys.length > 0;
  }

  // ================================
  // 랜덤 닉네임과 색상 생성
  // ================================
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
