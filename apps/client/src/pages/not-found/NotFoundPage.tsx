import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mb-4">
        페이지를 찾을 수 없습니다
      </h2>
      <p className="text-gray-500 mb-8">요청하신 페이지가 존재하지 않습니다.</p>
      <Link
        to="/room/prototype"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        방으로 이동
      </Link>
    </div>
  );
}

export default NotFoundPage;
