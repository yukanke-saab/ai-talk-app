FROM node:18-alpine

WORKDIR /app

# 必要なツールのインストール
RUN apk add --no-cache git

# パッケージ管理ファイルのコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm ci

# TypeScript設定のコピー
COPY tsconfig.json ./

# 開発モードで起動
CMD ["npm", "run", "dev"]
