# AI通話アプリ - 開発環境構築ガイド

このリポジトリはAI通話アプリの開発環境を提供します。アプリケーションの詳細については[要件定義書](REQUIREMENTS.md)と[仕様書](SPECIFICATION.md)を参照してください。

## プロジェクト構成

```
ai-talk-app/
├── backend/                # バックエンドAPIサーバー
├── frontend/               # フロントエンドモバイルアプリ
├── docker/                 # Docker関連ファイル
│   ├── local/              # ローカル環境用Docker設定
│   └── production/         # 本番環境用Docker設定（参照用）
├── prisma/                 # データベースORMスキーマ
├── .env.example            # 環境変数の例
├── .env.production.example # 本番環境用環境変数の例
├── docker-compose.yml      # ローカル開発用Docker Compose設定
└── README.md               # プロジェクト説明（このファイル）
```

## 技術スタック

### バックエンド
- Node.js + Express - APIサーバー
- TypeScript - 型安全な開発
- Prisma - データベースORM
- PostgreSQL - データベース

### フロントエンド
- React Native / Expo - モバイルアプリ開発
- TypeScript - 型安全な開発
- Redux Toolkit - 状態管理
- React Navigation - 画面遷移

### 外部サービス
- OpenAI API - AIチャット（GPT）、音声認識（GPT-4o-transcribe）、音声合成（TTS）
- 音声合成の代替オプション - VOICEVOX（日本語特化、カスタマイズ性、コスト効率が重要な場合）
- Stripe - 決済処理
- Expo Push Notifications - プッシュ通知

## 開発環境のセットアップ

### 前提条件
- Git
- Docker と Docker Compose
- Node.js (v18以上)
- npm または yarn

### 環境のセットアップ手順

1. リポジトリのクローン
```bash
git clone <repository-url>
cd ai-talk-app
```

2. ディレクトリ構造の作成
```bash
mkdir -p backend/src
mkdir -p frontend/src
mkdir -p docker/local/{backend,mockserver}
mkdir -p docker/production/backend
```

3. 環境変数ファイルの作成
```bash
cp .env.example .env.local
```

4. Dockerコンテナの起動
```bash
docker-compose up -d
```

これで以下のサービスが起動します：
- PostgreSQLデータベース (port: 5432)
- モックサーバー (port: 8080)
- Adminer (port: 8081)

5. バックエンドのセットアップ
```bash
cd backend
npm init -y
npm install express cors helmet dotenv prisma @prisma/client
npm install -D typescript @types/node @types/express ts-node-dev
npx prisma init
# prisma/schema.prismaが既に存在するため、上書きはしない
npx prisma migrate dev --name init
```

6. フロントエンドのセットアップ
```bash
cd frontend
npm init -y
npx create-expo-app . -t blank --no-install
npm install react-native
```

## ローカル開発

### バックエンドの開発
```bash
cd backend
npm run dev
```

### フロントエンドの開発
```bash
cd frontend
npm start
```

## 環境の切り替え

ローカル環境と本番環境の切り替えは環境変数ファイルと`NODE_ENV`で行います。

- 開発環境: `.env.local` ファイル + `NODE_ENV=development`
- 本番環境: `.env.production` ファイル + `NODE_ENV=production`

## モックサーバー

ローカル開発では外部APIの代わりにモックサーバーを使用します：

- OpenAI API（チャット、音声認識、音声合成） → http://localhost:8080/openai
- 音声認識 → http://localhost:8080/transcribe
- 音声合成 → http://localhost:8080/tts

これにより、開発中のAPIコストを削減し、オフライン開発も可能にします。

## 音声API選択について

本番環境での実装では、以下の選択肢があります：

1. **音声認識（Speech-to-Text）**：
   - OpenAI GPT-4o-transcribe API - 最新かつ高精度な音声認識モデル

2. **音声合成（Text-to-Speech）**：
   - OpenAI TTS API - 多言語対応の音声合成（TTS-1/TTS-2）
   - VOICEVOX - 日本語に特化した高品質音声合成（セルフホスト可能）

選択基準：
- 日本語品質の要求度
- カスタマイズ性の必要性
- 使用頻度とコスト効率

## データベース管理

Adminerを使用してデータベースを管理できます：
- URL: http://localhost:8081
- サーバー: postgres
- ユーザー名: user
- パスワード: password
- データベース: aitalk
