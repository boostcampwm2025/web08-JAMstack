# 1단계: 빌드 스테이지
FROM node:20-slim AS builder
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate

WORKDIR /app

# 전체 소스 복사
COPY . .

# 빌드 시점에 환경 변수 주입
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# 의존성 설치 및 전체 빌드
RUN pnpm install --frozen-lockfile
RUN pnpm build

# 2단계: 실행 스테이지
FROM node:20-slim
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# 1. 프론트엔드 결과물 복사
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

# 2. 백엔드 실행을 위해 필요한 모든 폴더 구조를 통째로 복사
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/server ./apps/server
COPY --from=builder /app/package.json ./package.json

# 3. 설정 파일 복사
COPY nginx.conf /etc/nginx/nginx.conf
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# 80(Nginx), 3000(NestJS) 포트 개방
EXPOSE 80 3000

CMD ["./start.sh"]
