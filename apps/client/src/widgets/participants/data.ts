import type { Participant } from "@/entities/participant";

export const participantId = "E";

const Alice: Participant = {
  id: "A",
  nickname: "Alice",
  role: "host",
  avatar: "https://i.pravatar.cc/48?img=1",
  color: "#FF6B6B",
  clientId: "socket-id-alice",
  presence: "online",
  type: "authenticated",
};

const Bob: Participant = {
  id: "B",
  nickname: "Bob",
  role: "editor",
  avatar: "https://i.pravatar.cc/48?img=2",
  color: "#4ECDC4",
  clientId: "socket-id-bob",
  presence: "online",
  type: "authenticated",
};

const Charlie: Participant = {
  id: "C",
  nickname: "Charlie",
  role: "editor",
  color: "#45B7D1",
  clientId: "socket-id-charlie",
  presence: "online",
  type: "anonymous",
};

const David: Participant = {
  id: "D",
  nickname: "David",
  role: "viewer",
  avatar: "https://i.pravatar.cc/48?img=4",
  color: "#FED766",
  clientId: "socket-id-david",
  presence: "offline",
  type: "authenticated",
};

const Eve: Participant = {
  id: "E",
  nickname: "Eve",
  role: "editor",
  color: "#2AB7CA",
  clientId: "socket-id-eve",
  presence: "online",
  type: "anonymous",
};

const Frank: Participant = {
  id: "F",
  nickname: "Frank",
  role: "viewer",
  avatar: "https://i.pravatar.cc/48?img=6",
  color: "#F0A6CA",
  clientId: "socket-id-frank",
  presence: "offline",
  type: "authenticated",
};

const Grace: Participant = {
  id: "G",
  nickname: "Grace",
  role: "editor",
  color: "#A2D5F2",
  clientId: "socket-id-grace",
  presence: "online",
  type: "anonymous",
};

const Heidi: Participant = {
  id: "H",
  nickname: "Heidi",
  role: "editor",
  avatar: "https://i.pravatar.cc/48?img=8",
  color: "#F4A261",
  clientId: "socket-id-heidi",
  presence: "online",
  type: "authenticated",
};

export const data: Record<string, Participant> = {
  [Alice.id]: Alice,
  [Bob.id]: Bob,
  [Charlie.id]: Charlie,
  [David.id]: David,
  [Eve.id]: Eve,
  [Frank.id]: Frank,
  [Grace.id]: Grace,
  [Heidi.id]: Heidi,
};
