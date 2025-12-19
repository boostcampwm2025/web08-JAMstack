# Common

Client와 Server 간 공유되는 타입 및 상수 정의 패키지입니다.

## 기술 스택

- **TypeScript** - 타입 정의

## 아키텍처

```
src/
├── index.ts           # 패키지 진입점
├── types/             # 공유 타입 정의
│   └── index.ts
└── constants/         # 공유 상수
    └── index.ts
```

## 주요 내용

- **타입 정의**: Client와 Server에서 사용하는 공통 타입 (Room, Participant, Message 등)
- **상수**: 공통으로 사용되는 상수 값

## 빌드

```bash
pnpm build
```

빌드된 결과물은 `dist/` 디렉토리에 생성되며, Client와 Server에서 `@codejam/common`으로 import하여 사용합니다.

## 사용 예시

```typescript
import { ParticipantRole, RoomStatus } from '@codejam/common';
```
