// import { useSocket } from "@/shared/lib/hooks/useSocket";
import { CodeEditor } from "@/widgets/code-editor";
import { Header } from "@/widgets/header";
import { Participants } from "@/widgets/participants";
import { useRoomStore } from "@/stores/room";
import { usePt } from "@/stores/pts";

function RoomPage() {
  // 프로토타입: roomId 고정
  // const { isConnected } = useSocket("prototype");

  const myPtId = useRoomStore((state) => state.myPtId);
  const myPt = usePt(myPtId || "");
  const isViewer = myPt?.role === "viewer";

  // if (!isConnected) {
  //   return (
  //     <div className="flex items-center justify-center h-screen bg-gray-100">
  //       <p className="text-gray-600">연결 중...</p>
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-hidden flex">
        <div className="border-r h-full overflow-y-auto scrollbar-thin">
          <Participants />
        </div>
        <div className="flex-1 h-full">
          <CodeEditor language="javascript" readOnly={isViewer} />
        </div>
      </main>
    </div>
  );
}

export default RoomPage;
