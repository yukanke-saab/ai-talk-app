import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// JWTシークレットは環境変数から取得
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-very-strong-secret-key';

// Request型にuserプロパティを追加するためのインターフェース
export interface AuthenticatedRequest extends Request {
  user?: { userId: number; email: string }; // トークンからデコードされた情報
}

/**
 * JWTトークンを検証するミドルウェア
 * @param req AuthenticatedRequest
 * @param res Response
 * @param next NextFunction
 */
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN_STRING

  if (token == null) {
    // トークンが存在しない場合
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return; // 必ずreturnする
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      // トークンが無効な場合 (期限切れなど)
      console.error('JWT Verification Error:', err.message);
      res.status(403).json({ message: 'Forbidden: Invalid token' });
      return; // 必ずreturnする
    }

    // トークンが有効な場合、デコードされたユーザー情報をリクエストに追加
    req.user = user as { userId: number; email: string };
    next(); // 次のミドルウェアまたはルートハンドラーへ
  });
};
