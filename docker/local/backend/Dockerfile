FROM node:18-alpine

WORKDIR /app

# 必要なツールのインストール
RUN apk add --no-cache git

# パッケージ管理ファイルのコピー
COPY package*.json ./

# 依存関係のインストール（開発依存関係も含む）
RUN npm install --include=dev

# TypeScript設定とPrismaスキーマのコピー
COPY tsconfig.json ./
COPY prisma ./prisma/

# Prismaクライアントの生成
RUN npx prisma generate

# 開発用マイグレーション実行 (ホットリロード中の初回起動時にDockefile内で実行するよりも適切)
# Dockerコンテナ起動時に実行するためにシェルスクリプトを作成
RUN echo '#!/bin/sh\nnpx prisma migrate deploy\nnpm run dev' > /app/start.sh \
    && chmod +x /app/start.sh

# 開発モードで起動（マイグレーション実行後に開発サーバー起動）
CMD ["/app/start.sh"]
