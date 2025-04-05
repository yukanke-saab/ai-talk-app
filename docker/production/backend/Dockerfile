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

# Prismaマイグレーションの実行
RUN npx prisma migrate deploy

# アプリケーションの起動
CMD ["node", "dist/index.js"]
