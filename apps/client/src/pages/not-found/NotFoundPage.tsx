import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { HTTP_STATUS } from '@codejam/common';
import { Button } from '@codejam/ui';

function NotFoundPage() {
  const error = useRouteError();

  let icon = '🔍';
  let title = '페이지를 찾을 수 없습니다';
  let message = '요청하신 페이지가 존재하지 않습니다.';

  if (isRouteErrorResponse(error)) {
    if (error.status === HTTP_STATUS.BAD_REQUEST) {
      icon = '⚠️';
      title = '접속할 수 없습니다';
      message = error.data || '요청 정보가 올바르지 않습니다.';
    } else if (error.status === HTTP_STATUS.NOT_FOUND) {
      icon = '🔍';
      title = '페이지를 찾을 수 없습니다';
      message = error.data || '요청하신 페이지가 존재하지 않습니다.';
    } else {
      icon = '😢';
      title = '문제가 발생했습니다';
      message = error.data || '잠시 후 다시 시도해주세요.';
    }
  }

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <section className="flex flex-col items-center text-center">
        <span className="mb-4 text-6xl" role="img" aria-label="에러 아이콘">
          {icon}
        </span>
        <h1 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">
          {title}
        </h1>
        <p className="mb-8 text-gray-500 dark:text-gray-400">{message}</p>
        <nav>
          <Button size="lg" render={<Link to="/" />}>
            메인 페이지로 이동
          </Button>
        </nav>
      </section>
    </main>
  );
}

export default NotFoundPage;
