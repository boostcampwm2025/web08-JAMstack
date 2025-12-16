import { useEffect, useState } from "react";
import { SessionResponseDto } from "@codejam/common";
import { createSession } from "@/shared/api/room";

function RoomPage() {
  const [session, setSession] = useState<SessionResponseDto | null>(null);

  useEffect(() => {
    // 1. localStorage에서 기존 세션 확인
    const savedSession = localStorage.getItem("session");
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession) as SessionResponseDto;
        setSession(session);
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
      });
  }, []);

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-600">로딩중...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div>
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Room: prototype
        </h1>
        <p className="text-gray-600">안녕하세요, {session.nickname}님!</p>
        <p className="mt-2">
          {session.nickname}님의 색상은{" "}
          <span className="font-bold" style={{ color: session.color }}>
            {session.color}
          </span>
          입니다.
        </p>
      </div>
    </div>
  );
}

export default RoomPage;
