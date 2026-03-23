export const LIMITS = {
  // Participant limits
  MAX_CAN_EDIT: 6,
  MAX_PTS: 150,
  MIN_PTS: 2,
  PT_HASH_LENGTH: 4,

  // Room code
  ROOM_CODE_LENGTH: 6,

  // Nickname
  NICKNAME_MIN: 1,
  NICKNAME_MAX: 6,

  // Password
  PASSWORD_MIN: 1,
  PASSWORD_MAX: 16,

  // Token
  TOKEN_MIN: 1,

  // File
  FILENAME_MIN: 1,
  FILENAME_MAX: 255, // 대부분의 파일 시스템 제한

  // File capacity limits (in bytes)
  MAX_DOC_SIZE_CLIENT: 1_000_000, // 1MB - Client-side total document size limit
  MAX_DOC_SIZE_SERVER: 5 * 1024 * 1024, // 5MB - Server-side total document size limit (Redis compression)

  // Chat
  CHAT_MESSAGE_MIN: 1,
  CHAT_MESSAGE_MAX: 2000, // 메세지 한 개당 길이 제한
  CHAT_MESSAGES_LIMIT: 300, // 클라이언트 메모리에 유지할 최대 메시지 개수
} as const;
