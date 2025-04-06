import { Request, Response } from 'express';
import { manualTriggerCall } from '../services/callSchedulerService';

/**
 * 指定したユーザーに手動でAI着信通知をトリガーするテスト用コントローラー
 * 注: 本番環境では無効化またはアクセス制限すべき
 */
export const testIncomingCall = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (!userId || isNaN(Number(userId))) {
      res.status(400).json({ message: '有効なユーザーIDが必要です' });
      return;
    }
    
    const result = await manualTriggerCall(Number(userId));
    
    if (result) {
      res.status(200).json({ 
        success: true, 
        message: `ユーザーID: ${userId} への着信通知が送信されました` 
      });
    } else {
      res.status(500).json({
        success: false,
        message: `ユーザーID: ${userId} への着信通知送信に失敗しました`
      });
    }
  } catch (error: any) {
    console.error('テスト着信エラー:', error);
    res.status(500).json({ 
      success: false, 
      message: '着信テストに失敗しました', 
      error: error.message 
    });
  }
};
