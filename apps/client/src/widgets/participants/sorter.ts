import type { Pt } from "@codejam/common";

const timeOrder = (time: Pt["joinedAt"]) => {
  return new Date(time).getTime();
};

const nicknameCompare = (x: Pt["nickname"], y: Pt["nickname"]) => {
  return x.localeCompare(y);
};

export const sorter = (a: Pt, b: Pt) => {
  // 들어온 시간 순서로 정렬
  const timeA = timeOrder(a.joinedAt);
  const timeB = timeOrder(b.joinedAt);
  if (timeA !== timeB) return timeA - timeB;

  // 닉네임 순으로 정렬
  return nicknameCompare(a.nickname, b.nickname);
};
