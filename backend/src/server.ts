import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes'; // インポートを追加

// .envファイルから環境変数を読み込む
// プロジェクトルートの.envを参照するため、パスを調整
dotenv.config({ path: '../.env' });

const prisma = new PrismaClient();
const app: Express = express();
const port = process.env.PORT || 3000;

// JSONリクエストボディをパースするためのミドルウェア
app.use(express.json());

// ルートエンドポイント (テスト用)
app.get('/', (req: Request, res: Response) => {
  res.send('Backend API is running!');
});

// 認証ルートのマウント
app.use('/api/auth', authRoutes); // マウント処理を追加

// TODO: 通話ルートのマウント (Issue #11)
// TODO: 課金ルートのマウント (Issue #12)

// TODO: グローバルエラーハンドリングミドルウェア (Issue #15)
// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

async function main() {
  // Prisma Clientの接続 (任意だが、接続確認に役立つ)
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1); // 接続失敗時はプロセス終了
  }

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
