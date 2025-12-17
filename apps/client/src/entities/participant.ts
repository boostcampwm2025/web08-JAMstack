export interface Pt {
  /** 참가자 고유 ID */
  ptId: string;

  /** 화면에 표시될 닉네임 */
  nickname: string;

  /** 참가자의 권한 */
  role: "host" | "editor" | "viewer";

  /** 사용자 식별용 색상 코드 (HEX 등) */
  color: string;

  /** 현재 접속 상태 */
  presence: "online" | "offline";

  /** 방 입장 시간 (ISO) */
  joinedAt: string;
}
