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
  JOIN_ROOM: 'room:join',

  /**
   * 클라이언트가 방을 떠나거나 연결이 끊어졌을 때 발생.
   * 서버 -> 클라이언트 (브로드캐스트)
   * - Payload: {@link UserLeftPayload}
   */
  USER_LEFT: 'room:user_left',

  /**
   * 방에 새로운 유저가 입장했음을 알림.
   * 서버 -> 클라이언트 (브로드캐스트)
   * - Payload: {@link UserJoinedPayload}
   */
  USER_JOINED: 'room:user_joined',

  /**
   * 방에 현재 접속 중인 유저 목록을 전송.
   * 서버 -> 클라이언트 (단일 전송)
   * - Payload: {@link RoomUsersPayload}
   */
  ROOM_USERS: 'room:users',

  /**
   * 코드 에디터의 내용이 변경되었을 때 발생.
   * 현재는 변경된 전체 코드를 전송.
   * - Payload: {@link CodeUpdatePayload}
   */
  UPDATE_CODE: 'code:update',

  /**
   * 새로운 사용자가 입장했을 때, 기존의 최신 코드 상태를 동기화하기 위해 발생.
   */
  SYNC_CODE: 'code:sync',
} as const;
