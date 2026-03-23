# CLI 개발 가이드

codejam-cli 패키지 개발 및 배포 가이드입니다.

## 개발 환경 설정

### 로컬 개발

```bash
# 빌드
pnpm build

# 개발 모드 (Watch)
pnpm dev

# 타입 체크
pnpm check-types
```

### 로컬 테스트

전역 링크를 통해 로컬에서 CLI를 테스트할 수 있습니다:

```bash
# CLI 패키지를 전역으로 링크
pnpm link --global

# 이제 어디서든 codejam 명령어 사용 가능
codejam start --env local
codejam enter ABC123 --env local
codejam health --env local
codejam update

# 커스텀 룸 생성 테스트
codejam start --custom --env local
codejam start --custom --max 30 --env local
codejam start --custom --max 10 --password mysecret123 --env local
codejam start --custom --max 20 --host-password adminpass --env local
codejam start --custom --max 15 --password guest123 --host-password admin456 --env local
codejam start --custom --max 150 --host-password teacher2026 --env local
codejam start --custom --max 4 --password study2026 --env local
codejam start --custom --max 20 --no-browser --env local

# 링크 해제
pnpm unlink --global
```

## 프로젝트 구조

```
packages/cli/
├── src/
│   ├── api/                    # API 클라이언트
│   │   ├── client.ts          # HTTP 요청 로직
│   │   ├── types.ts           # API 타입 정의
│   │   └── index.ts
│   ├── commands/               # CLI 명령어
│   │   ├── start.ts           # start 명령어 (룸 생성)
│   │   ├── enter.ts           # enter 명령어 (룸 입장)
│   │   ├── health.ts          # health 명령어 (서버 상태 확인)
│   │   ├── update.ts          # update 명령어 (CLI 업데이트)
│   │   └── index.ts
│   ├── utils/                  # 공통 유틸리티
│   │   ├── browser.ts         # 브라우저 열기
│   │   ├── error.ts           # 에러 핸들링
│   │   └── index.ts
│   ├── config/                 # 환경 설정
│   │   ├── environments.ts    # 환경별 URL 설정
│   │   └── index.ts
│   └── index.ts                # CLI 진입점
├── dist/                       # 빌드 결과물 (tsup으로 생성)
├── package.json
├── tsconfig.json
├── README.md                   # 사용자용 문서
├── CONTRIBUTING.md             # 개발자용 문서 (이 파일)
└── PUBLISHING.md               # 배포 가이드
```

## 기술 스택

| 패키지     | 용도                 | 버전    |
| ---------- | -------------------- | ------- |
| commander  | CLI 프레임워크       | ^12.1.0 |
| chalk      | 터미널 색상 출력     | ^5.4.1  |
| ora        | 로딩 스피너          | ^8.1.1  |
| open       | 브라우저 자동 열기   | ^10.1.0 |
| cli-table3 | 테이블 출력          | ^0.6.5  |
| tsup       | TypeScript 빌드 도구 | ^8.3.5  |
| typescript | 타입 시스템          | ^5.9.3  |

## 환경 설정

### 지원 환경

| 환경       | 서버 URL                          | 클라이언트 URL                                                   | 용도           |
| ---------- | --------------------------------- | ---------------------------------------------------------------- | -------------- |
| local      | http://localhost:3000             | http://localhost:5173                                            | 로컬 개발 환경 |
| staging    | https://staging.codejam.kro.kr    | https://codejam-web08jamstack-6306-jamstacks-projects.vercel.app | 스테이징 서버  |
| production | https://production.codejam.kro.kr | https://lets-codejam.vercel.app                                  | 프로덕션 서버  |

환경 설정은 [src/config/environments.ts](src/config/environments.ts)에서 관리됩니다.

## 빌드 프로세스

### tsup 설정

[package.json](package.json)의 빌드 스크립트:

```json
{
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts --clean --shims",
    "dev": "tsup src/index.ts --format esm --watch"
  }
}
```

**옵션 설명:**

- `--format esm`: ESM 모듈로 빌드
- `--dts`: TypeScript 선언 파일(.d.ts) 생성
- `--clean`: 빌드 전 dist 폴더 정리
- `--shims`: Node.js shim 추가 (import.meta.url 등)
- `--watch`: 파일 변경 감지 및 자동 재빌드

### 빌드 결과물

```
dist/
├── index.js          # 메인 번들 (실행 파일)
├── index.d.ts        # 타입 선언 파일
└── index.js.map      # 소스맵
```

## CI/CD

### CI (Continuous Integration)

PR 생성 시 자동 실행: [.github/workflows/ci.yml](../../.github/workflows/ci.yml)

CLI는 전체 프로젝트 CI에 포함되어 검증됩니다:

- Format check
- Lint
- Type check
- Build

### CD (Continuous Deployment)

태그 푸시 시 자동 배포: [.github/workflows/cd-npmcli.yml](../../.github/workflows/cd-npmcli.yml)

```bash
# 배포 프로세스
git tag cli-v1.0.1
git push origin cli-v1.0.1
→ GitHub Actions에서 자동으로 npm에 배포
```

자세한 배포 가이드는 [PUBLISHING.md](./PUBLISHING.md)를 참고하세요.

## 새로운 명령어 추가하기

### 1. 명령어 파일 생성

```typescript
// src/commands/mycommand.ts
import { Command } from 'commander';
import chalk from 'chalk';

interface MyCommandOptions {
  option1?: string;
}

export const myCommand = new Command('mycommand')
  .description('My new command description')
  .option('-o, --option1 <value>', 'Option description')
  .action(async (options: MyCommandOptions) => {
    try {
      console.log(chalk.green('Command executed!'));
    } catch (error) {
      console.error(chalk.red('Error occurred'));
      process.exit(1);
    }
  });
```

### 2. commands/index.ts에 export 추가

```typescript
// src/commands/index.ts
export * from './start.js';
export * from './enter.js';
export * from './health.js';
export * from './update.js';
export * from './mycommand.js'; // 새 명령어 추가
```

### 3. 메인 파일에 등록

```typescript
// src/index.ts
import {
  startCommand,
  enterCommand,
  healthCommand,
  updateCommand,
  myCommand,
} from './commands/index.js';

program.addCommand(startCommand);
program.addCommand(enterCommand);
program.addCommand(healthCommand);
program.addCommand(updateCommand);
program.addCommand(myCommand); // 새 명령어 등록
```

### 4. 테스트

```bash
pnpm build
pnpm link --global
codejam mycommand --option1 value
```

## 참고 자료

- [Commander.js 공식 문서](https://github.com/tj/commander.js)
- [Chalk 공식 문서](https://github.com/chalk/chalk)
- [tsup 공식 문서](https://tsup.egoist.dev/)
- [pnpm 공식 문서](https://pnpm.io/)
