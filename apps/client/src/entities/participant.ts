export interface Participant {
  id: string;
  nickname: string;
  role: "host" | "editor" | "viewer";

  avatar?: string;
  color: string;

  clientId: string;
  presence: "online" | "offline";

  type: "authenticated" | "anonymous";
}
