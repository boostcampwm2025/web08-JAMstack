# Client

CodeJam 프론트엔드 애플리케이션입니다.

## 기술 스택

- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **Zustand** - 상태 관리
- **CodeMirror 6** - 코드 에디터
- **Socket.io Client** - 실시간 통신
- **React Router** - 라우팅

## 아키텍처

Feature-Sliced Design 기반의 모듈 구조:

```
src/
├── app/          # 애플리케이션 설정
├── pages/        # 페이지 컴포넌트
├── widgets/      # 독립적인 UI 블록 (Header, CodeEditor, Participants)
├── features/     # 비즈니스 로직 기능
├── entities/     # 비즈니스 엔티티 (Participant, Awareness, Interaction)
├── shared/       # 공유 유틸리티 (API, Hooks, UI 컴포넌트)
└── stores/       # 전역 상태 관리
```

## 실행 방법

### 개발 서버 실행

```bash
pnpm dev
```

### 프로덕션 빌드

```bash
pnpm build
```

### 빌드 결과 미리보기

```bash
pnpm preview
```

## 환경 변수

루트 디렉토리의 `.env` 파일에서 설정:

```env
VITE_API_URL=http://localhost:3000
```
