import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
// JWTシークレットは環境変数から取得するのが望ましい
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-very-strong-secret-key';

/**
 * ユーザー登録処理
 * @param req Request
 * @param res Response
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => { // 戻り値の型を Promise<void> に変更
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' }); // return を削除
    return; // voidを返すためにreturnを追加
  }

  try {
    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: 'Email already exists' }); // return を削除
      return; // voidを返すためにreturnを追加
    }

    // パスワードのハッシュ化 (ソルトラウンド数を指定)
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // パスワードを除外してレスポンス
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword); // return を削除

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration' }); // return を削除
  }
};

/**
 * ログイン処理
 * @param req Request
 * @param res Response
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => { // 戻り値の型を Promise<void> に変更
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' }); // return を削除
    return; // voidを返すためにreturnを追加
  }

  try {
    // ユーザー検索
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' }); // return を削除
      return; // voidを返すためにreturnを追加
    }

    // パスワード検証
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' }); // return を削除
      return; // voidを返すためにreturnを追加
    }

    // JWTトークン生成
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h', // トークン有効期限 (例: 1時間)
    });

    res.json({ token }); // return を削除

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' }); // return を削除
  }
};

// Request型にuserプロパティを追加するためのインターフェース拡張
// (より良い方法は型定義ファイルを作成すること)
interface AuthenticatedRequest extends Request {
    user?: { userId: number };
}

/**
 * 現在のユーザー情報取得 (要認証ミドルウェア)
 * @param req AuthenticatedRequest (認証ミドルウェアによりuserIdが付与されている想定)
 * @param res Response
 */
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => { // 戻り値の型を Promise<void> に変更
  // 認証ミドルウェアで req.user にユーザー情報がセットされている前提
  const userId = req.user?.userId;

  if (!userId) {
    // 通常、認証ミドルウェアで弾かれるはず
    res.status(401).json({ message: 'Unauthorized - User ID not found in request' }); // return を削除
    return; // voidを返すためにreturnを追加
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { // パスワードは返さない
        id: true,
        email: true,
        pushToken: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' }); // return を削除
      return; // voidを返すためにreturnを追加
    }

    res.json(user); // return を削除
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error' }); // return を削除
  }
};
