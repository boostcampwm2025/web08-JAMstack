import { useSession } from "@/shared/lib/hooks/useSession";
import { CodeEditor } from "@/widgets/code-editor";
import { Header } from "@/widgets/header";

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
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-hidden">
        <CodeEditor />
      </main>
    </div>
  );
}

export default RoomPage;
