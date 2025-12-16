import { useEffect, useState } from "react";
import { SessionResponseDto } from "@codejam/common";
import { createSession } from "@/shared/api/room";

export function useSession() {
  const [session, setSession] = useState<SessionResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. localStorage에서 기존 세션 확인
    const savedSession = localStorage.getItem("session");
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession) as SessionResponseDto;
        setSession(session);
        setIsLoading(false);
        return; // 기존 세션 사용
      } catch (error) {
        console.error("세션 파싱 실패:", error);
        localStorage.removeItem("session");
      }
    }

    // 2. 세션이 없으면 새로 생성
    createSession()
      .then((sessionData) => {
        setSession(sessionData);
        localStorage.setItem("session", JSON.stringify(sessionData));
      })
      .catch((error) => {
        console.error("세션 생성 실패:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { session, isLoading };
}
