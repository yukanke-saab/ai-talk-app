import { Router } from 'express'; // Request, Response はコントローラーで使うので削除
import { registerUser, loginUser, getCurrentUser } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// POST /api/auth/register - ユーザー登録
router.post('/register', registerUser);

// POST /api/auth/login - ログイン
router.post('/login', loginUser);

// GET /api/auth/me - 現在のユーザー情報取得 (要認証)
router.get('/me', authenticateToken, getCurrentUser);

export default router;
