FROM node:18-alpine

WORKDIR /app

# 必要なツールのインストール
RUN apk add --no-cache git

# パッケージ管理ファイルのコピー
COPY package*.json ./

# 依存関係のインストール（nodemonを含むこと）
RUN npm install
RUN npm install -g nodemon

# ホットリロード用の起動スクリプト作成
RUN echo '#!/bin/sh\nnodemon --watch . --ext js,json index.js' > /app/start-dev.sh \
    && chmod +x /app/start-dev.sh

# 開発モードで起動 (ホットリロード有効)
CMD ["/app/start-dev.sh"]
