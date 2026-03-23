# Oracle VM 수동 배포 전용:
# - VM 호스트에서 pnpm install / pnpm build 후, docker build 컨텍스트에 node_modules·dist가 들어가야 함
#   (보통 .dockerignore에서 해당 항목을 잠시 완화 — 레포 기본값은 그대로 두고 VM에서만 조정하는 편이 안전)
# - GitHub Actions의 서버 이미지 빌드(cd-prod 등)는 이 Dockerfile과 전제가 다르므로, CI 정리는 Vercel·수동 배포 확인 후 별도로 맞추면 됨

FROM node:22-slim

# 보안: non-root 유저 생성
RUN useradd -m -u 1001 appuser

WORKDIR /app

# 호스트(VM)에서 이미 준비된 의존성과 빌드 산출물을 복사만 함
COPY node_modules ./node_modules
COPY apps/server/node_modules ./apps/server/node_modules
COPY packages/common/node_modules ./packages/common/node_modules
COPY packages/common/package.json ./packages/common/package.json
COPY packages/common/dist ./packages/common/dist
COPY apps/server/dist ./apps/server/dist
COPY apps/server/package.json ./apps/server/package.json

# 소유권 변경
RUN chown -R appuser:appuser /app

# non-root 유저로 전환
USER appuser

# 환경 변수 설정
ENV NODE_ENV=production

# 포트 개방 (앱 3000, 메트릭 9091)
EXPOSE 3000 9091

# Health check 설정
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

# 서버 실행
CMD ["node", "apps/server/dist/main.js"]
