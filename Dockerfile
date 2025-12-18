# 1단계: 빌드 스테이지
FROM node:20-slim AS builder
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate

WORKDIR /app

# 전체 소스 복사 (monorepo 구조 유지)
COPY . .

# 빌드 시점에 환경 변수를 주입받음 (Vite 빌드용)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# 의존성 설치 및 전체 빌드
RUN pnpm install --frozen-lockfile
RUN pnpm build

# 2단계: 실행 스테이지
FROM node:20-slim
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# 1. 프론트엔드 빌드 결과물 복사
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

# 2. 백엔드 실행을 위해 프로젝트 구조 전체를 유지하며 복사 (pnpm 심볼릭 링크 보존용)
# 루트 node_modules(.pnpm 포함)와 서버 앱, 공통 패키지를 모두 가져옵니다.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/apps/server ./apps/server

# 3. 설정 파일 복사
COPY nginx.conf /etc/nginx/nginx.conf
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# 80(Nginx), 3000(NestJS) 포트 개방
EXPOSE 80 3000

# 4. 백엔드 앱 폴더에서 실행해야 상대 경로로 패키지들을 찾을 수 있습니다.
WORKDIR /app/apps/server
CMD ["/app/start.sh"]