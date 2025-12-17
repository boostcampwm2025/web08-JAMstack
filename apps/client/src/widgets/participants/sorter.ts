import type { Pt } from "@/entities/participant";

const onlineOrder = (status: Pt["presence"]) => {
  if (status === "online") return 1;
  return 2; // offline
};

const roleOrder = (role: Pt["role"]) => {
  if (role === "host") return 1;
  if (role === "editor") return 2;
  return 3; // viewer
};

const nicknameCompare = (x: Pt["nickname"], y: Pt["nickname"]) => {
  return x.localeCompare(y);
};

export const sorter = (a: Pt, b: Pt) => {
  // 온라인 상태 정렬
  const onlineA = onlineOrder(a.presence);
  const onlineB = onlineOrder(b.presence);
  if (onlineA !== onlineB) return onlineA - onlineB;

  // 역할 순서로 정렬
  const roleA = roleOrder(a.role);
  const roleB = roleOrder(b.role);
  if (roleA !== roleB) return roleA - roleB;

  // 닉네임 순으로 정렬
  return nicknameCompare(a.nickname, b.nickname);
};
