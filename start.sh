#!/bin/sh
nginx -g "daemon on;"

# 서버 폴더로 이동해서 실행하되, NODE_PATH를 추가하여 루트 node_modules도 찾게 합니다.
cd /app/apps/server
export NODE_PATH=/app/node_modules:/app/apps/server/node_modules
node dist/main.js
