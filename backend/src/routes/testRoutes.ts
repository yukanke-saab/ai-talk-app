import { Router } from 'express';
import { testIncomingCall } from '../controllers/testController';

const router = Router();

/**
 * テスト用ルート
 * 注: 本番環境では無効化または適切なアクセス制限を設けるべき
 */

// GET /api/test/incoming-call/:userId - 指定ユーザーへの着信テスト
router.get('/incoming-call/:userId', testIncomingCall);

export default router;
