/**
 * 방에 참여하는 개별 참가자(Participant) 정보.
 * * @note 현재는 소켓 연결 하나를 사용자 한 명으로 간주합니다.
 * @note 추후 로컬 스토리지를 활용하여 세션 유지를 보완할 예정입니다.
 */
export interface Pt {
  /** 참가자 고유 ID (Socket ID 또는 UUID) */
  ptId: string;

  /** 화면에 표시될 닉네임 */
  nickname: string;

  /** * 참가자의 권한 역할
   * @note 'host'는 현재 사용하지 않음 (확장성 고려)
   */
  role: 'host' | 'editor' | 'viewer';

  /** 사용자 식별용 색상 코드 (HEX 등) */
  color: string;

  /** 현재 접속 상태 */
  presence: 'online' | 'offline';

  /** 방 입장 시간 (ISO 8601 String) */
  joinedAt: string;
}

/**
 * 방 입장 요청(`room:join`) 시 전송되는 페이로드.
 * * @direction Client -> Server
 * @event room:join
 */
export interface JoinRoomPayload {
  /** 입장하려는 방의 고유 ID */
  roomId: string;

  /** * 기존 세션 복원을 위한 참가자 ID.
   * - 최초 입장 시: `undefined` (서버가 새로 생성)
   * - 재접속 시: 로컬 스토리지 등에 저장된 `ptId`를 전송하여 정보 복원 요청
   */
  ptId?: string;
}

/**
 * 코드 변경 이벤트(`file:update`) 시 전송되는 페이로드.
 * @direction Client <-> Server (양방향)
 * @event file:update
 * @event room:file
 */
export interface FileUpdatePayload {
  /** 변경사항이 발생한 방의 ID */
  roomId: string;

  /** * 변경된 코드 전체 문자열.
   * * @todo 추후 Yjs 등을 도입하여 CRDT 바이너리(Uint8Array) 형태로 고도화 예정.
   * @note 현재 단계에서는 단순 string 교체 방식으로 처리.
   */
  code: string;
}

/**
 * 새로운 사용자가 방에 입장했을 때(`room:pt_joined`) 발생하는 이벤트 페이로드.
 * 기존에 방에 있던 참가자들에게 브로드캐스트 됩니다.
 * * @direction Server -> Client (Broadcast)
 * @event room:pt_joined
 */
export interface PtJoinedPayload {
  /** 새로 입장한 참가자 객체 */
  pt: Pt;
}

/**
 * 사용자가 방을 나갔을 때(`room:pt_disconnect`) 발생하는 이벤트 페이로드.
 * 방에 남아있는 다른 참가자들에게 브로드캐스트 됩니다.
 * * @direction Server -> Client (Broadcast)
 * @event room:pt_disconnect
 */
export interface PtDisconnectPayload {
  /** 연결이 끊어진 참가자의 ID */
  ptId: string;
}

/**
 * 사용자가 redis에서 TTL 만료되어 삭제됐을 때(`room:pt_left`) 브로드캐스트되는 데이터 페이로드.
 * Server -> 나머지 방에 있는 사용자들에게 보내는 payload
 * @direction Server -> Client (Broadcast)
 * @event room:pt_left
 */
export interface PtLeftPayload {
  /** Redis에서 삭제된 ptId */
  ptId: string;
}

/**
 * 방에 접속 중인 전체 참가자 목록을 갱신할 때(`room:pts`) 전송되는 페이로드.
 * 주로 방에 처음 입장하여 초기 참가자 리스트를 동기화할 때 사용됩니다.
 * @direction Server -> Client
 * @event room:pts
 */
export interface RoomPtsPayload {
  /** 현재 방에 존재하는 모든 참가자(Pt) 목록 */
  pts: Pt[];
}
