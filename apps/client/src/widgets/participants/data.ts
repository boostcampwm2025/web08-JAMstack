import type { Pt } from "@/entities/participant";

export const roomId = "prototype";
export const myPtId = "E";

const Alice: Pt = {
  ptId: "A",
  nickname: "Alice",
  role: "host",
  color: "#FF6B6B",
  presence: "online",
  joinedAt: "2000-01-01T01:00:00.000Z",
};

const Bob: Pt = {
  ptId: "B",
  nickname: "Bob",
  role: "viewer",
  color: "#4ECDC4",
  presence: "online",
  joinedAt: "2000-01-01T08:00:00.000Z",
};

const Charlie: Pt = {
  ptId: "C",
  nickname: "Charlie",
  role: "editor",
  color: "#45B7D1",
  presence: "online",
  joinedAt: "2000-01-01T02:00:00.000Z",
};

const David: Pt = {
  ptId: "D",
  nickname: "David",
  role: "viewer",
  color: "#FED766",
  presence: "offline",
  joinedAt: "2000-01-01T07:00:00.000Z",
};

const Eve: Pt = {
  ptId: "E",
  nickname: "Eve",
  role: "editor",
  color: "#2AB7CA",
  presence: "online",
  joinedAt: "2000-01-01T03:00:00.000Z",
};

const Frank: Pt = {
  ptId: "F",
  nickname: "Frank",
  role: "viewer",
  color: "#F0A6CA",
  presence: "offline",
  joinedAt: "2000-01-01T06:00:00.000Z",
};

const Grace: Pt = {
  ptId: "G",
  nickname: "Grace",
  role: "editor",
  color: "#A2D5F2",
  presence: "online",
  joinedAt: "2000-01-01T04:00:00.000Z",
};

const Heidi: Pt = {
  ptId: "H",
  nickname: "Heidi",
  role: "editor",
  color: "#F4A261",
  presence: "online",
  joinedAt: "2000-01-01T05:00:00.000Z",
};

export const data: Record<string, Pt> = {
  [Alice.ptId]: Alice,
  [Bob.ptId]: Bob,
  [Charlie.ptId]: Charlie,
  [David.ptId]: David,
  [Eve.ptId]: Eve,
  [Frank.ptId]: Frank,
  [Grace.ptId]: Grace,
  [Heidi.ptId]: Heidi,
};
