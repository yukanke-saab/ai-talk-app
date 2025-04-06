import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes'; // 認証ルートのインポート
import testRoutes from './routes/testRoutes'; // テストルートのインポート
// 実装済みの場合にのみインポート
// import callRoutes from './routes/callRoutes'; // 通話ルートのインポート
import { initCallScheduler } from './services/callSchedulerService'; // 着信スケジューラーをインポート
import logger from './utils/logger'; // ロガー
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware'; // エラーハンドリング

// .envファイルから環境変数を読み込む
// プロジェクトルートの.envを参照するため、パスを調整
dotenv.config({ path: '../.env' });

const prisma = new PrismaClient();
const app: Express = express();
const port = process.env.PORT || 3000;

// セキュリティミドルウェア
app.use(helmet());

// CORSの設定
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // フロントエンドのオリジン
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// JSONリクエストボディをパースするためのミドルウェア
app.use(express.json({ limit: '10mb' })); // 大きいリクエストボディの対応
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// リクエストロギングミドルウェア
app.use(logger.logRequest);

// ルートエンドポイント (テスト用)
app.get('/', (req: Request, res: Response) => {
  res.send('Backend API is running!');
});

// 認証ルートのマウント
app.use('/api/auth', authRoutes);

// テストルートのマウント（開発環境のみ）
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/test', testRoutes);
  console.log('Test routes enabled (development only)');
}

// TODO: 通話ルートのマウント (Issue #11)
// app.use('/api/call', callRoutes);

// TODO: 課金ルートのマウント (Issue #12)
// app.use('/api/billing', billingRoutes);

// 404エラーハンドリング - 存在しないルートへのアクセス
app.use(notFoundHandler);

// グローバルエラーハンドリングミドルウェア (すべてのエラーを捕捉)
app.use(errorHandler);

async function main() {
  // Prisma Clientの接続 (任意だが、接続確認に役立つ)
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1); // 接続失敗時はプロセス終了
  }

  // AI着信スケジューラーを初期化（開発環境でも起動しておく）
  const scheduler = initCallScheduler();
  console.log('AI Call Scheduler initialized');

  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    // アプリケーション終了時にPrisma Clientを切断
    // await prisma.$disconnect(); // 通常は不要だが、明示的に行う場合
  });

// SIGINTシグナル（Ctrl+C）でPrisma Clientを切断
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
