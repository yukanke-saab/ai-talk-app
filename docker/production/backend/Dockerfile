FROM node:18-alpine AS builder

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm ci

# ソースコードのコピー
COPY tsconfig.json ./
COPY prisma ./prisma/
COPY src ./src/

# Prismaクライアントの生成
RUN npx prisma generate

# TypeScriptのビルド
RUN npm run build

# 実行用イメージの作成
FROM node:18-alpine

WORKDIR /app

# タイムゾーン設定
RUN apk --no-cache add tzdata && \
    cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
    echo "Asia/Tokyo" > /etc/timezone && \
    apk del tzdata

# 本番環境用の依存関係のみインストール
COPY package*.json ./
RUN npm ci --only=production

# ビルド済みのアプリケーションをコピー
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# 環境変数の設定
ENV NODE_ENV=production
ENV PORT=3000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost:$PORT/ || exit 1

# 起動スクリプトを作成 (マイグレーションを実行してからアプリを起動)
COPY --from=builder /app/node_modules/.bin/prisma /usr/local/bin/prisma
RUN echo '#!/bin/sh\nprisma migrate deploy\nnode dist/server.js' > /app/start.sh \
    && chmod +x /app/start.sh

# アプリケーションの起動 (コンテナ起動時にマイグレーション実行)
CMD ["/app/start.sh"]
