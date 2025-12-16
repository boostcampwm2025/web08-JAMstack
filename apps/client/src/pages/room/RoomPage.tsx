import { useSession } from "@/shared/lib/hooks/useSession";

function RoomPage() {
  const { session, isLoading } = useSession();

  if (isLoading || !session) {
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
