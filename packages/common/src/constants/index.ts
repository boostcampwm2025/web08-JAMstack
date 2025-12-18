/**
 * 클라이언트와 서버 간 실시간 통신에 사용되는 소켓 이벤트.
 * @readonly
 */
export const SOCKET_EVENTS = {
  /**
   * 클라이언트가 특정 방에 입장을 요청할 때 발생.
   * 닉네임은 서버에서 소켓 연결 시 자동으로(랜덤) 생성하거나 Socket ID를 사용.
   * - Payload: {@link JoinRoomPayload}
   */
  JOIN_ROOM: "room:join",

  /**
   * 서버에서 클라이언트로 초기 설정 및 환영 메시지를 보낼 때 사용.
   * */
  WELCOME: "room:welcome",

  /**
   * 클라이언트가 방을 떠나거나 연결이 끊어졌을 때 발생.
   * 서버 -> 클라이언트 (브로드캐스트)
   * - Payload: {@link PtDisconnectPayload}
   */
  PT_DISCONNECT: "room:pt_disconnect",

  /**
   * 클라이언트가 방을 떠났을 때 발생.
   * Redis에서 TTL 만료로 삭제되었을 때.
   * 서버 -> 클라이언트 (브로드캐스트)
   * - Payload: {@link PtLeftPayload}
   */
  PT_LEFT: "room:pt_left",

  /**
   * 방에 새로운 유저가 입장했음을 알림.
   * 서버 -> 클라이언트 (브로드캐스트)
   * - Payload: {@link PtJoinedPayload}
   */
  PT_JOINED: "room:pt_joined",

  /**
   * 방에 현재 접속 중인 유저 목록을 전송.
   * 서버 -> 클라이언트 (단일 전송)
   * - Payload: {@link RoomPtsPayload}
   */
  ROOM_PTS: "room:pts",

  /**
   * 새로운 사용자가 입장했을 때, 기존의 최신 파일 목록을 동기화하기 위해 발생.
   */
  ROOM_FILES: "room:files",

  /**
   * 새로운 사용자가 입장했을 때, 기존의 최신 Awareness 목록을 동기화하기 위해 발생.
   */
  ROOM_AWARENESSES: "room:awarenesses",

  /** 참가자 정보가 변경되었을 때 발생 *
   * (예: 닉네임, 역할, 상태 등)
   * - Direction: Server -> Client
   */
  UPDATE_PT: "pt:update",

  /**
   * 코드 에디터의 내용이 변경되었을 때 발생.
   * 현재는 변경된 전체 코드를 전송.
   * - Payload: {@link FileUpdatePayload}
   */
  UPDATE_FILE: "file:update",

  /**
   * Awareness 정보(커서 위치 등)가 변경되었을 때 발생.
   * - Direction: Client -> Server -> Client (양방향, 브로드캐스트)
   * - Payload: {@link UpdateAwarenessPayload}
   */
  UPDATE_AWARENESS: "awareness:update",
} as const;
