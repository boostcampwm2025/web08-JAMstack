import { CodeEditor } from "@/widgets/code-editor";
import { Header } from "@/widgets/header";

function RoomPage() {
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
