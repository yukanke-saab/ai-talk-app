import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendIncomingCallNotification } from './notificationService';

const prisma = new PrismaClient();

// 環境変数から設定を取得
const CALL_INTERVAL_MIN = parseInt(process.env.CALL_INTERVAL_MIN || '3600000', 10); // デフォルト1時間（ミリ秒）
const CALL_INTERVAL_MAX = parseInt(process.env.CALL_INTERVAL_MAX || '43200000', 10); // デフォルト12時間（ミリ秒）
const CALL_HOURS_START = parseInt(process.env.CALL_HOURS_START || '8', 10); // 着信開始時間（24時間制）
const CALL_HOURS_END = parseInt(process.env.CALL_HOURS_END || '21', 10); // 着信終了時間（24時間制）

// アクティブなユーザーセッション（最後の着信時間を管理）
const userLastCallTime: Record<number, number> = {};

// 着信スケジュールのCronジョブ
let schedulerJob: cron.ScheduledTask | null = null;

/**
 * 着信スケジューラを初期化
 */
export const initCallScheduler = () => {
  if (schedulerJob) {
    schedulerJob.stop();
  }

  // 毎分実行し、着信を発生させるべきかチェック
  schedulerJob = cron.schedule('* * * * *', async () => {
    try {
      await checkAndTriggerCalls();
    } catch (error: any) {
      console.error('着信スケジューラエラー:', error);
    }
  });

  console.log('AI着信スケジューラーが初期化されました');
  return schedulerJob;
};

/**
 * 着信可能ユーザーをチェックし、条件を満たすユーザーに着信を発生させる
 */
export const checkAndTriggerCalls = async () => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    
    // 設定された時間外であれば処理を行わない
    if (currentHour < CALL_HOURS_START || currentHour >= CALL_HOURS_END) {
      return;
    }
    
    // アクティブなユーザー（プッシュトークンがある）を取得
    const activeUsers = await prisma.user.findMany({
      where: {
        pushToken: {
          not: null
        }
      },
      select: {
        id: true,
        pushToken: true
      }
    });
    
    if (activeUsers.length === 0) {
      return;
    }
    
    const currentTime = Date.now();
    
    // 各ユーザーについて、着信を発生させるべきか判断
    for (const user of activeUsers) {
      const lastCallTime = userLastCallTime[user.id] || 0;
      const timeSinceLastCall = currentTime - lastCallTime;
      
      // 最後の着信から最小間隔以上経過しているか確認
      if (timeSinceLastCall >= CALL_INTERVAL_MIN) {
        // ランダムに着信を発生させるかどうか決定
        // 経過時間が長いほど着信確率が上がるようにする
        const callProbability = Math.min(
          1.0, 
          (timeSinceLastCall - CALL_INTERVAL_MIN) / (CALL_INTERVAL_MAX - CALL_INTERVAL_MIN)
        );
        
        if (Math.random() <= callProbability) {
          // 着信を発生させる
          await triggerIncomingCall(user.id);
          
          // 最終着信時間を更新
          userLastCallTime[user.id] = currentTime;
        }
      }
    }
  } catch (error: any) {
    console.error('着信チェックエラー:', error);
    throw error;
  }
};

/**
 * 特定のユーザーに着信を発生させる
 * @param userId ユーザーID
 */
export const triggerIncomingCall = async (userId: number) => {
  try {
    // ランダムにAIを選択
    const availableAIs = await prisma.aI.findMany();
    
    if (availableAIs.length === 0) {
      console.warn('利用可能なAIがありません');
      return false;
    }
    
    const randomAI = availableAIs[Math.floor(Math.random() * availableAIs.length)];
    
    // プッシュ通知を送信
    const notificationResult = await sendIncomingCallNotification(
      userId,
      randomAI.id.toString(),
      randomAI.name
    );
    
    // 着信イベントをログに記録（オプション）
    console.log(`着信通知送信 - ユーザー: ${userId}, AI: ${randomAI.name}, 結果: ${notificationResult.success}`);
    
    return notificationResult.success;
  } catch (error: any) {
    console.error('着信トリガーエラー:', error);
    return false;
  }
};

/**
 * プッシュトークンをユーザーに登録する際に、スケジューラにユーザーを追加
 * @param userId ユーザーID
 */
export const registerUserForCalls = (userId: number) => {
  // 最終着信時間をリセット（初期値として少し前の時間を設定）
  userLastCallTime[userId] = Date.now() - (CALL_INTERVAL_MIN / 2);
};

/**
 * テスト用: 指定したユーザーに手動で着信を発生させる
 * @param userId ユーザーID
 */
export const manualTriggerCall = async (userId: number) => {
  return await triggerIncomingCall(userId);
};

export default {
  initCallScheduler,
  registerUserForCalls,
  manualTriggerCall
};
