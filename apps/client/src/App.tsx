import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RoomPage from "@/pages/room/RoomPage";
import NotFoundPage from "@/pages/not-found/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route errorElement={<NotFoundPage />}>
          <Route path="/" element={<Navigate to="/room/prototype" replace />} />
          <Route path="/room/prototype" element={<RoomPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
