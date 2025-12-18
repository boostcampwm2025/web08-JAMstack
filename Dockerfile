# 1단계: 빌드 스테이지
FROM node:20-slim AS builder
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate

WORKDIR /app

# 전체 소스 복사 (monorepo 구조 유지)
COPY . .

# 의존성 설치 및 전체 빌드
RUN pnpm install --frozen-lockfile
RUN pnpm build

# 2단계: 실행 스테이지
FROM node:20-slim
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# 프론트엔드 빌드 결과물을 nginx 경로로 복사
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

# 백엔드 실행에 필요한 파일들 복사
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/node_modules ./node_modules
COPY --from=builder /app/apps/server/package.json ./package.json

# 설정 파일 복사
COPY nginx.conf /etc/nginx/nginx.conf
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# 80(Nginx), 3000(NestJS) 포트 개방
EXPOSE 80 3000

CMD ["./start.sh"]

