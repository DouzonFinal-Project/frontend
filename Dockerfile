# frontend/Dockerfile
FROM node:18-alpine

# 1) 기본 셋업
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install

# 2) 앱 소스 복사
COPY . .

# 3) CRA/webpack-dev-server가 프록시 뒤에서도 잘 뜨도록
ENV HOST=0.0.0.0 \
    NODE_ENV=development \
    CI=false \
    CHOKIDAR_USEPOLLING=true \
    WDS_SOCKET_PORT=80 

EXPOSE 3000

# 4) 개발 서버 실행
CMD ["npm", "start"]
