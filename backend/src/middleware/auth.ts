import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_for_development';

/**
 * JWT認証ミドルウェア
 * リクエストヘッダーのAuthorizationからJWTトークンを取得し、検証する
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '有効なトークンがありません' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('開発環境: トークン検証をスキップ');
      // 開発環境では仮のユーザーIDを設定（テスト用）
      (req as any).user = { id: 1, email: 'dev@example.com' };
      next();
      return;
    }
    return res.status(403).json({ error: 'トークンが無効です' });
  }
};

/**
 * 特定の機能に対するアクセス制限用のオプションミドルウェア
 * Premium機能など、一部の機能に対するアクセス制限を設定する場合に使用
 */
export const checkSubscription = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user.id;

  try {
    // TODO: Prismaを使用してユーザーのサブスクリプション状態をチェック
    // サブスクリプションがアクティブかどうかを確認
    // const subscription = await prisma.subscription.findUnique({
    //   where: { userId }
    // });

    // if (!subscription || subscription.status !== 'active') {
    //   return res.status(403).json({ error: 'この機能を利用するにはサブスクリプションが必要です' });
    // }

    // 開発環境ではスキップ
    if (process.env.NODE_ENV === 'development') {
      next();
      return;
    }

    next();
  } catch (error) {
    console.error('サブスクリプションチェックエラー:', error);
    res.status(500).json({ error: 'サブスクリプション確認中にエラーが発生しました' });
  }
};
