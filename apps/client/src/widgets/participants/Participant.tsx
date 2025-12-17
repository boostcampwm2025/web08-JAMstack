import { memo } from "react";
import { usePt } from "@/stores/pts";
import { useRoomStore } from "@/stores/room";

export interface ParticipantProps {
  ptId: string;
}

export const Participant = memo(({ ptId }: ParticipantProps) => {
  const pt = usePt(ptId);
  if (!pt) return null;

  const isOnline = pt.presence === "online";
  const opacity = isOnline ? "opacity-100" : "opacity-40";

  return (
    <div
      className="flex items-center justify-between p-2 transition-colors 
        select-none hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      <div className={`flex items-center space-x-3 ${opacity}`}>
        <Avatar ptId={ptId} />
        <Info ptId={ptId} />
      </div>
      <Menu />
    </div>
  );
});

Participant.displayName = "Participant"; // 디버그 시 표시되는 컴포넌트 이름

/**
 * 참가자의 아바타, 온라인 상태, 방장 여부 표시
 */

export function Avatar({ ptId }: ParticipantProps) {
  const pt = usePt(ptId);
  const { nickname, color, role } = pt;
  const initial = nickname.charAt(0);

  const avatar = (
    <div
      className="w-10 h-10 rounded-full 
        flex items-center justify-center text-white text-lg font-semibold"
      style={{ backgroundColor: color }}
    >
      {initial}
    </div>
  );

  const roleIcon =
    role === "host" ? (
      <span className="absolute -top-2 -right-1 text-yellow-500 text-s">
        👑
      </span>
    ) : null;

  return (
    <div className={`relative w-10 h-10 rounded-full`}>
      {avatar}
      {roleIcon}
    </div>
  );
}

/**
 * 참가자의 닉네임과 역할 표시
 */

const roleTextColors = {
  host: "orangered",
  editor: "royalblue",
  viewer: "gray",
};

export function Info({ ptId }: ParticipantProps) {
  const { nickname, role } = usePt(ptId);
  const myPtId = useRoomStore((state) => state.myPtId);

  const roleText = role.charAt(0).toUpperCase() + role.slice(1);
  const roleTextColor = roleTextColors[role] ?? "transparent";

  const isMe = myPtId === ptId;

  const youText = (
    <span className="ml-1.5 text-xs font-normal text-gray-500 dark:text-gray-400">
      (You)
    </span>
  );

  return (
    <div>
      <div className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-100">
        {nickname}
        {isMe && youText}
      </div>
      <div className="text-xs font-medium" style={{ color: roleTextColor }}>
        {roleText}
      </div>
    </div>
  );
}

/**
 * 추가 옵션 메뉴 버튼 UI
 */
export function Menu() {
  return (
    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
      {/* SVG for more-vertical icon */}
    </button>
  );
}
