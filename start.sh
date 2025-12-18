#!/bin/sh

# Nginx 실행 (백그라운드)
nginx -g "daemon on;"

# 백엔드 실행
node dist/main.js

