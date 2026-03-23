# codejam-cli

터미널에서 CodeJam 협업 코딩 룸을 빠르게 생성하고 관리하는 CLI 도구입니다.

## 설치

```bash
npm install -g codejam-cli
```

## 명령어

### `codejam start` - 퀵 룸 생성

빠른 시작 (참여자 6명, 비밀번호 없음):

```bash
codejam start
```

출력 결과:

```
✔ Quick room created!

┌───────────┐
│ Room Code │
├───────────┤
│ ABCDEF    │
└───────────┘

⠹ Opening https://lets-codejam.vercel.app/room/ABCDEF...
✔ Browser opened!
```

**옵션:**

- `--no-browser` - 브라우저 자동 열기 비활성화

**예시:**

```bash
# 브라우저 열지 않고 URL만 출력
codejam start --no-browser
```

### `codejam start --custom` - 커스텀 룸 생성

참여자 수, 비밀번호 등을 설정한 커스텀 룸 생성:

```bash
codejam start --custom --max 30 --password secret123
```

출력 결과:

```
✔ Custom room created!

┌───────────┬──────────────────┬───────────────┐
│ Room Code │ Max Participants │ Room Password │
├───────────┼──────────────────┼───────────────┤
│ ABCDEF    │ 30               │ secret123     │
└───────────┴──────────────────┴───────────────┘

⠹ Opening https://lets-codejam.vercel.app/room/ABCDEF...
✔ Browser opened!
```

**옵션:**

- `-m, --max <숫자>` - 최대 참여자 수 (1-150, 기본값: 6)
- `-p, --password <비밀번호>` - 참여자용 룸 비밀번호
- `--host-password <비밀번호>` - 호스트 권한용 비밀번호
- `--no-browser` - 브라우저 자동 열기 비활성화

**예시:**

```bash
# 최대 30명, 룸 비밀번호 설정
codejam start --custom --max 30 --password secret123

# 대규모 강의용 (최대 150명, 호스트 비밀번호)
codejam start --custom --max 150 --host-password teacher2026

# 모든 옵션 사용
codejam start --custom --max 50 --password room123 --host-password host456 --no-browser
```

### `codejam enter` - 기존 룸 입장

룸 코드로 기존 룸에 입장:

```bash
codejam enter ABCDEF
```

출력 결과:

```
⠹ Checking room status...
✔ Room is available!

Room Code: ABCDEF

⠹ Opening https://lets-codejam.vercel.app/room/ABCDEF...
✔ Browser opened!
```

**옵션:**

- `--no-browser` - 브라우저 자동 열기 비활성화

**예시:**

```bash
# 브라우저 열지 않고 URL만 출력
codejam enter ABCDEF --no-browser
```

### `codejam health` - 서버 상태 확인

서버 상태 확인:

```bash
codejam health
```

출력 결과:

```
⠹ Checking server health...
✔ All Systems Operational
We're fully operational and ready to code together!
```

### `codejam update` - CLI 업데이트

최신 버전으로 업데이트:

```bash
codejam update
```

출력 결과:

```
⠹ Checking for updates...
⠹ Updating from 1.0.0 to 1.0.1...
✔ Successfully updated to version 1.0.1!

Update complete. If the command does not work, try opening a new terminal tab.
```

## 문제 해결

### 명령어를 찾을 수 없음: codejam

설치 후 터미널을 재시작해주세요. 그래도 문제가 지속되면:

```bash
# 설치 확인
which codejam

# npm 전역 경로 확인
npm config get prefix
```

### 연결 오류

서버에 연결할 수 없는 경우 `codejam health` 명령어로 서버 상태를 확인하세요.

### 권한 오류

설치 시 권한 오류가 발생하면:

```bash
# npm 전역 디렉토리를 사용자 소유로 변경 (권장)
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# 다시 설치
npm install -g codejam-cli
```

---

## 개발자를 위한 문서

CLI 개발, 로컬 테스트, 배포에 대한 자세한 정보는 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참고하세요.

## 라이선스

ISC

## 제작

JAMstack
