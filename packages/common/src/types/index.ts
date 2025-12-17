/**
 * 소켓에 연결된 개별 사용자 정보.
 */
export interface Pt {
  /**
   * 소켓 연결 시 생성되는 고유 식별자 (Socket ID)
   */
  socketId: string;

  /**
   * 사용자의 표시 이름 (닉네임)
   */
  nickname: string;

  /**
   * 사용자 커서 색상
   * @desc 추후 동시 편집 시 커서 구분을 위해 사용.
   */
  color?: string;
}

/**
 * 방 입장 이벤트(`room:join`) 시 전송되는 데이터 페이로드.
 */
export interface JoinRoomPayload {
  /**
   * 입장하려는 방의 고유 ID
   */
  roomId: string;
}

/**
 * 코드 변경 이벤트(`code:update`) 시 전송되는 데이터 페이로드.
 */
export interface CodeUpdatePayload {
  /**
   * 변경사항이 발생한 방의 ID
   */
  roomId: string;

  /**
   * 변경된 코드 내용 (전체 문자열)
   * * @todo 추후 Yjs를 도입하여 CRDT 바이너리(Uint8Array) 형태로 변경해야 함.
   * 현재 단계에서는 단순 string으로 처리.
   */
  code: string;
}

/**
 * 다른 사용자가 방에 입장했을 때(`room:pt_joined`) 브로드캐스트되는 데이터 페이로드.
 */
export interface PtJoinedPayload {
  /**
   * 새로 입장한 사용자 객체
   */
  pt: Pt;
}

/**
 * 사용자가 방을 나갔을 때(`room:pt_left`) 브로드캐스트되는 데이터 페이로드.
 */
export interface PtLeftPayload {
  /**
   * 퇴장한 사용자의 소켓 ID
   * @desc 클라이언트 목록에서 해당 사용자를 제거하기 위해 식별자로 사용.
   */
  socketId: string;
}

/**
 * 방에 접속 중인 전체 사용자 목록을 갱신할 때(`room:pts`) 전송되는 데이터 페이로드.
 * @desc 주로 방에 처음 입장했을 때 현재 접속자 리스트를 받기 위해 사용.
 */
export interface RoomPtsPayload {
  /**
   * 현재 방에 있는 모든 사용자(Pt)의 배열
   */
  pts: Pt[];
}
