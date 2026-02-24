import { z } from 'zod';
import {
  passwordSchema,
  roomCodeSchema,
  roomTokenSchema,
  roomTypeSchema,
  whoCanDestroyRoomSchema,
} from '../entities/room.schema.js';
import { nicknameSchema, ptIdSchema, ptSchema } from '../entities/pt.schema.js';

// 방 입장 요청 스키마 (C -> S)
export const joinRoomPayloadSchema = z.object({
  roomCode: roomCodeSchema,
  token: roomTokenSchema.optional(),
});

// 입장 환영 메시지 스키마 (S -> C)
export const welcomePayloadSchema = z.object({
  myPtId: ptIdSchema,
  roomType: roomTypeSchema,
  whoCanDestroyRoom: whoCanDestroyRoomSchema,
  hasHostPassword: z.boolean(),
});

// 방 참가자 목록 스키마 (S -> C)
export const roomPtsPayloadSchema = z.object({
  pts: z.array(ptSchema),
});

// Y.Doc 초기 상태 스키마 (S -> C)
export const roomDocPayloadSchema = z.object({
  snapshot: z.instanceof(Uint8Array),
  updates: z.array(z.instanceof(Uint8Array)),
});

// Awareness 초기 상태 스키마 (S -> C)
export const roomAwarenessPayloadSchema = z.object({
  message: z.instanceof(Uint8Array),
});

// 방 만료 알림 스키마 (S -> C)
export const roomExpiredPayloadSchema = z.object({
  message: z.string().trim().optional(),
});
