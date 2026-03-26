# Server

CodeJam 백엔드 서버 애플리케이션입니다.

## 기술 스택

- **NestJS** - Node.js 프레임워크
- **TypeScript** - 타입 안전성
- **Socket.io** - 실시간 양방향 통신
- **Redis (ioredis)** - 인메모리 데이터베이스 및 캐싱
- **Joi** - 환경 변수 검증

## 아키텍처

모듈 기반 아키텍처:

```
src/
├── main.ts                   # 애플리케이션 엔트리 포인트
├── app.module.ts             # 루트 모듈
├── config/                   # 설정 모듈 (Redis 등)
├── modules/
│   ├── auth/                 # 인증 모듈
│   ├── collaboration/        # 실시간 협업 게이트웨이
│   ├── room/                 # 방 관리 모듈
│   └── file/                 # 파일 관리 모듈
└── common/                   # 공통 유틸리티
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

### 프로덕션 모드 실행

```bash
pnpm start:prod
```

## 환경 변수

루트 디렉토리의 `.env` 파일에서 설정:

```env
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 테스트

```bash
# 단위 테스트
pnpm test

# E2E 테스트
pnpm test:e2e
```
