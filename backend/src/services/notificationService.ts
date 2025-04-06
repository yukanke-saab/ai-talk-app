import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushReceipt } from 'expo-server-sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

/**
 * ユーザーのプッシュトークンを保存
 * @param userId ユーザーID
 * @param pushToken Expoプッシュトークン
 */
export const savePushToken = async (userId: number, pushToken: string) => {
  try {
    if (!Expo.isExpoPushToken(pushToken)) {
      throw new Error(`無効なExpoプッシュトークンです: ${pushToken}`);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { pushToken }
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('プッシュトークン保存エラー:', error);
    throw error;
  }
};

/**
 * 指定されたユーザーにプッシュ通知を送信
 * @param userId ユーザーID
 * @param title 通知タイトル
 * @param body 通知本文
 * @param data 通知に添付するデータ
 */
export const sendPushNotification = async (
  userId: number,
  title: string,
  body: string,
  data: Record<string, any> = {}
) => {
  try {
    // ユーザーのプッシュトークンを取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushToken: true }
    });

    if (!user?.pushToken) {
      console.warn(`ユーザー ${userId} のプッシュトークンが見つかりません`);
      return { success: false, error: 'プッシュトークンがありません' };
    }

    const pushToken = user.pushToken;

    // プッシュ通知メッセージの作成
    const messages: ExpoPushMessage[] = [{
      to: pushToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
      channelId: 'default',
    }];

    // 通知の送信
    const chunks = expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('プッシュ通知送信エラー:', error);
        throw error;
      }
    }

    // 送信結果の確認
    const receiptIds: string[] = [];
    for (const ticket of tickets) {
      // Expoレスポンスの型チェック（成功時のみIDが含まれる）
      if ('id' in ticket) {
        receiptIds.push(ticket.id);
      }
    }

    if (receiptIds.length > 0) {
      // 必要に応じて後でレシートをチェックするロジックをここに追加
      console.log(`送信されたプッシュ通知レシートID: ${receiptIds.join(', ')}`);
    }

    return { success: true, receiptIds };
  } catch (error: any) {
    console.error('プッシュ通知エラー:', error);
    return { success: false, error: error.message || '通知送信中にエラーが発生しました' };
  }
};

/**
 * AI着信通知を送信
 * @param userId ユーザーID
 * @param aiId AIID
 * @param aiName AI名
 */
export const sendIncomingCallNotification = async (
  userId: number,
  aiId: string,
  aiName: string
) => {
  return sendPushNotification(
    userId,
    '着信中',
    `${aiName}からの着信です`,
    {
      type: 'incoming_call',
      aiId,
      aiName
    }
  );
};

export default {
  savePushToken,
  sendPushNotification,
  sendIncomingCallNotification
};
