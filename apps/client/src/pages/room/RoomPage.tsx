import { CodeEditor } from "@/widgets/code-editor";
import { Header } from "@/widgets/header";

function RoomPage() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-hidden flex">
        <div className="flex-1 border-r h-full">
          <CodeEditor language="javascript" />
        </div>
        <div className="flex-1 border-r h-full">
          <CodeEditor language="html" />
        </div>
        <div className="flex-1 h-full">
          <CodeEditor language="css" />
        </div>
      </main>
    </div>
  );
}

export default RoomPage;
