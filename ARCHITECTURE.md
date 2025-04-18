# アーキテクチャ設計書

## 1. システム概要

AI通話アプリは、ユーザーがAIと音声通話ができるモバイルアプリケーションです。主な目的は、特に話し相手のいない老人を対象に、寂しさの解消、安否確認、認知症予防を提供することです。

## 2. 全体アーキテクチャ

システムは次の主要コンポーネントで構成されます：

```
┌───────────────────┐     ┌───────────────────────┐     ┌────────────────────┐
│                   │     │                       │     │                    │
│  モバイルアプリ    │◄────►│   バックエンドAPI     │◄────►│  外部サービス      │
│  (React Native)   │     │   (Node.js/Express)  │     │  - OpenAI API      │
│                   │     │                       │     │  - Stripe          │
└───────────────────┘     └──────────┬────────────┘     └────────────────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │                     │
                          │     データベース      │
                          │     (PostgreSQL)    │
                          │                     │
                          └─────────────────────┘
```

## 3. コンポーネント詳細

### 3.1 モバイルアプリ（フロントエンド）

#### アーキテクチャパターン
- **Flux/Redux アーキテクチャ** - 単方向データフローで状態管理

#### 主要コンポーネント
1. **認証モジュール**
   - ログイン/登録画面
   - 認証状態管理

2. **通話モジュール**
   - AI発信機能
   - 着信受信機能
   - 音声送受信機能

3. **プロフィールモジュール**
   - ユーザー情報管理
   - 課金情報表示

4. **音声処理モジュール**
   - マイク入力処理
   - スピーカー出力処理

#### 技術スタック詳細
- React Native/Expo
- Redux Toolkit
- React Navigation
- Expo AV (音声処理)
- Expo Notifications (プッシュ通知)

### 3.2 バックエンドAPI

#### アーキテクチャパターン
- **レイヤードアーキテクチャ** - コントローラー、サービス、モデル層の分離

#### 主要コンポーネント
1. **認証サービス**
   - JWT認証
   - ユーザー管理

2. **通話サービス**
   - 音声テキスト変換（OpenAI GPT-4o-transcribe）
   - AIチャット (OpenAI GPT-4o)
   - テキスト音声変換（OpenAI TTS）
   - 会話履歴管理

3. **課金サービス**
   - Stripe連携
   - 利用量計測
   - 従量課金処理

4. **通知サービス**
   - AI着信スケジュール管理
   - プッシュ通知送信

#### 技術スタック詳細
- Node.js/Express
- TypeScript
- Prisma ORM
- JWT認証
- OpenAI API SDK
- Stripe SDK

### 3.3 データベース

#### スキーマ詳細
- PostgreSQL (Supabaseでホスティング)
- 詳細なスキーマはSPECIFICATION.mdを参照

## 4. データフロー

### 4.1 ユーザー発信通話フロー
1. ユーザーがアプリで発信ボタンを押す
2. フロントエンドはバックエンドAPIに通話開始リクエストを送信
3. バックエンドはユーザーの認証と課金情報を確認
4. 通話セッションが作成され、フロントエンドに通知
5. ユーザーが音声を送信（音声ストリーム）
6. バックエンドはOpenAI音声認識APIで音声をテキストに変換
7. テキストをOpenAI GPTに送信し、応答を取得
8. 応答テキストをOpenAI TTSで音声に変換
9. 音声をフロントエンドに送信、ユーザーに再生
10. 会話内容はデータベースに保存
11. ユーザーが通話終了ボタンを押すと、通話使用時間に基づいて課金処理

### 4.2 AI着信フロー
1. バックエンドのスケジューラが設定された時間内でランダムに着信を生成
2. プッシュ通知をユーザーのデバイスに送信
3. ユーザーが通知に応答すると通話画面を表示
4. 以降、発信通話フローと同様のステップで会話を進行

## 5. API設計

### RESTful API エンドポイント

#### 認証関連
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `GET /api/auth/me` - 現在のユーザー情報取得

#### 通話関連
- `GET /api/ai` - 利用可能なAI一覧取得
- `POST /api/call/start` - 通話開始
- `POST /api/call/process-audio` - 音声処理
- `POST /api/call/end` - 通話終了
- `GET /api/call/history` - 通話履歴取得

#### 課金関連
- `GET /api/billing` - 課金情報取得
- `POST /api/billing/subscribe` - 定額プラン登録
- `GET /api/billing/usage` - 利用状況確認

## 6. セキュリティ設計

### 認証・認可
- JWT (JSON Web Tokens)による認証
- トークン有効期限の設定
- HTTPS通信の強制

### データ保護
- 個人情報の暗号化保存
- APIキーの環境変数管理
- バックエンドでのリクエスト検証

### プライバシー考慮事項
- 会話データの利用規約明示
- ユーザーによるデータ削除オプション提供
- 第三者共有の制限

## 7. パフォーマンス最適化

### フロントエンド
- 音声データのバッファリング
- 適切なコンポーネント分割によるレンダリング最適化
- リソース（アセット）の効率的なロード

### バックエンド
- キャッシュ機構の導入
- データベースクエリの最適化
- 非同期処理の活用

## 8. 拡張性と保守性

### モジュール分割
- 機能別の明確な責務分離
- インターフェース駆動設計

### 将来の拡張計画
- 複数言語対応
- 新しいAIモデルの追加
- グループ通話機能

## 9. 開発・運用フロー

### 開発環境
- ローカル開発環境（Docker）
- テスト環境（Staging）
- 本番環境（Production）

### CI/CD
- GitHub Actions によるテスト自動化
- 段階的デプロイ

### モニタリング
- エラーログ監視
- パフォーマンスメトリクス
- ユーザー行動分析
