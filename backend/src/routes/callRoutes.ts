import express from 'express';
import { getAIs, startCall, processAudio, endCall, getCallHistory } from '../controllers/callController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// 全てのルートに認証ミドルウェアを適用
router.use(authenticateJWT);

// 利用可能なAI一覧を取得
router.get('/ai', getAIs);

// 通話関連のエンドポイント
router.post('/call/start', startCall);
router.post('/call/process-audio', processAudio);
router.post('/call/end', endCall);
router.get('/call/history', getCallHistory);

export default router;
