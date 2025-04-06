import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { uploadToS3, getSignedUrl } from '../services/storage';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ダミーAIデータ (開発用)
const mockAIs = [
  { id: '1', name: 'AI アシスタント', personality: '礼儀正しく丁寧に応対します' },
  { id: '2', name: 'AI フレンド', name_en: 'AI Friend', personality: 'カジュアルでフレンドリーな会話ができます' },
  { id: '3', name: 'AI コーチ', name_en: 'AI Coach', personality: '目標達成に向けて励まし支援します' }
];

/**
 * 利用可能なAI一覧を取得
 */
export const getAIs = async (req: Request, res: Response) => {
  try {
    const ais = await prisma.aI.findMany({
      select: {
        id: true,
        name: true,
        personality: true
      }
    });

    res.status(200).json(ais);
  } catch (error) {
    console.error('AI取得エラー:', error);
    
    // 開発環境ではモックデータを返す
    if (process.env.NODE_ENV === 'development') {
      res.status(200).json(mockAIs);
      return;
    }
    
    res.status(500).json({ message: 'AI一覧の取得に失敗しました' });
  }
};

/**
 * 通話を開始し、セッションを作成
 */
export const startCall = async (req: Request, res: Response) => {
  try {
    const { aiId } = req.body;
    const userId = (req as any).user.id; // 認証ミドルウェアからユーザーID取得

    // AIが存在するか確認
    const ai = await prisma.aI.findUnique({
      where: { id: aiId }
    });

    if (!ai) {
      // 開発環境ではモックデータからチェック
      if (process.env.NODE_ENV === 'development') {
        const mockAi = mockAIs.find(a => a.id === aiId);
        if (!mockAi) {
          return res.status(404).json({ message: '指定されたAIは存在しません' });
        }
      } else {
        return res.status(404).json({ message: '指定されたAIは存在しません' });
      }
    }

    // 通話セッションの作成
    const callSession = await prisma.callSession.create({
      data: {
        userId,
        aiId,
        status: 'active',
        startTime: new Date()
      }
    });

    res.status(201).json({
      callSessionId: callSession.id,
      startTime: callSession.startTime
    });
  } catch (error) {
    console.error('通話開始エラー:', error);
    
    // 開発環境ではモックレスポンスを返す
    if (process.env.NODE_ENV === 'development') {
      res.status(201).json({
        callSessionId: 'mock-session-' + Date.now(),
        startTime: new Date()
      });
      return;
    }
    
    res.status(500).json({ message: '通話の開始に失敗しました' });
  }
};

/**
 * 音声データを処理し、AIからの応答を返す
 */
export const processAudio = async (req: Request, res: Response) => {
  try {
    const { callSessionId } = req.query;
    const audioData = req.body; // 音声データはリクエストボディから取得

    if (!callSessionId) {
      return res.status(400).json({ message: 'callSessionIdが必要です' });
    }

    // 通話セッションの確認
    const callSession = await prisma.callSession.findUnique({
      where: { id: callSessionId as string }
    });

    if (!callSession || callSession.status !== 'active') {
      return res.status(404).json({ message: 'アクティブな通話セッションが見つかりません' });
    }

    // 音声をテキストに変換 (OpenAI Whisper API)
    const transcription = await openai.audio.transcriptions.create({
      file: audioData,
      model: 'whisper-1',
      language: 'ja'
    });

    // テキストをデータベースに保存
    const userMessage = await prisma.message.create({
      data: {
        callSessionId: callSessionId as string,
        content: transcription.text,
        role: 'user'
      }
    });

    // AIとのチャット
    const messages = [
      { role: 'system', content: 'あなたは会話アシスタントです。短い返答で会話をしてください。80文字以内でユーザーに返答してください。' },
      { role: 'user', content: transcription.text }
    ];

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: messages as any,
      max_tokens: 150
    });

    const aiResponseText = chatResponse.choices[0].message.content || 'すみません、よく聞こえませんでした。';

    // AIのメッセージをデータベースに保存
    const aiMessage = await prisma.message.create({
      data: {
        callSessionId: callSessionId as string,
        content: aiResponseText,
        role: 'assistant'
      }
    });

    // 音声合成 (OpenAI TTS API)
    const speechResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: aiResponseText
    });

    // 音声データをバッファに変換
    const audioBuffer = Buffer.from(await speechResponse.arrayBuffer());

    // 音声データをS3にアップロード（または直接レスポンスとして返す）
    const audioUrl = await uploadToS3(audioBuffer, `calls/${callSessionId}/${aiMessage.id}.mp3`);

    res.status(200).json({
      messageId: aiMessage.id,
      text: aiResponseText,
      audioUrl
    });
  } catch (error) {
    console.error('音声処理エラー:', error);
    
    // 開発環境ではモックレスポンスを返す
    if (process.env.NODE_ENV === 'development') {
      res.status(200).json({
        messageId: 'mock-message-' + Date.now(),
        text: 'こんにちは！何かお手伝いできることはありますか？',
        audioUrl: 'https://example.com/mock-audio.mp3'
      });
      return;
    }
    
    res.status(500).json({ message: '音声処理に失敗しました' });
  }
};

/**
 * 通話を終了
 */
export const endCall = async (req: Request, res: Response) => {
  try {
    const { callSessionId } = req.body;
    const userId = (req as any).user.id; // 認証ミドルウェアからユーザーID取得

    // 通話セッションの確認
    const callSession = await prisma.callSession.findUnique({
      where: {
        id: callSessionId,
        userId // 自分の通話セッションかどうか確認
      }
    });

    if (!callSession) {
      return res.status(404).json({ message: '通話セッションが見つかりません' });
    }

    // 通話セッションの更新
    const updatedCallSession = await prisma.callSession.update({
      where: { id: callSessionId },
      data: {
        status: 'completed',
        endTime: new Date(),
        duration: { set: Math.floor((Date.now() - callSession.startTime.getTime()) / 1000) } // 秒単位で計算
      }
    });

    res.status(200).json({
      callSessionId: updatedCallSession.id,
      status: updatedCallSession.status,
      duration: updatedCallSession.duration
    });
  } catch (error) {
    console.error('通話終了エラー:', error);
    
    // 開発環境ではモックレスポンスを返す
    if (process.env.NODE_ENV === 'development') {
      res.status(200).json({
        callSessionId: req.body.callSessionId,
        status: 'completed',
        duration: 120 // 仮の通話時間 2分
      });
      return;
    }
    
    res.status(500).json({ message: '通話の終了に失敗しました' });
  }
};

/**
 * 通話履歴を取得
 */
export const getCallHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // 認証ミドルウェアからユーザーID取得
    const { limit = 10, offset = 0 } = req.query; // ページネーション用

    // 通話履歴の取得
    const callHistory = await prisma.callSession.findMany({
      where: { userId },
      include: {
        ai: {
          select: {
            id: true,
            name: true
          }
        },
        messages: {
          select: {
            id: true,
            content: true,
            role: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      },
      take: Number(limit),
      skip: Number(offset)
    });

    // 通話履歴の総数を取得（ページネーション用）
    const total = await prisma.callSession.count({
      where: { userId }
    });

    res.status(200).json({
      calls: callHistory,
      total,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('通話履歴取得エラー:', error);
    
    // 開発環境ではモックデータを返す
    if (process.env.NODE_ENV === 'development') {
      res.status(200).json({
        calls: [
          {
            id: 'mock-session-1',
            aiId: '1',
            startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1日前
            endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5 * 60 * 1000), // 5分間の通話
            duration: 300,
            status: 'completed',
            ai: mockAIs[0],
            messages: [
              { id: 'msg1', content: 'こんにちは', role: 'user', createdAt: new Date() },
              { id: 'msg2', content: 'こんにちは！何かお手伝いできることはありますか？', role: 'assistant', createdAt: new Date() }
            ]
          }
        ],
        total: 1,
        limit: Number(limit),
        offset: Number(offset)
      });
      return;
    }
    
    res.status(500).json({ message: '通話履歴の取得に失敗しました' });
  }
};
