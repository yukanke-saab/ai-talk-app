import axios from 'axios';
import Constants from 'expo-constants';

// 環境変数から外部APIのベースURLを取得
const OPENAI_API_URL = Constants.expoConfig?.extra?.openaiApiUrl || 'http://localhost:8080/openai';
const TRANSCRIBE_API_URL = Constants.expoConfig?.extra?.transcribeApiUrl || 'http://localhost:8080/transcribe';
const TTS_API_URL = Constants.expoConfig?.extra?.ttsApiUrl || 'http://localhost:8080/tts';

// ChatGPT APIクライアント
const chatApi = axios.create({
  baseURL: OPENAI_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 音声認識APIクライアント
const transcribeApi = axios.create({
  baseURL: TRANSCRIBE_API_URL,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// 音声合成APIクライアント
const ttsApi = axios.create({
  baseURL: TTS_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  responseType: 'arraybuffer' // 音声データをバイナリで受け取る
});

/**
 * AIとのチャット
 * @param messages チャット履歴
 * @returns AIの応答
 */
export const sendChatMessage = async (messages: any[]) => {
  try {
    const response = await chatApi.post('/chat/completions', {
      model: 'gpt-4o',
      messages
    });
    return response.data;
  } catch (error) {
    console.error('Chat API error:', error);
    throw error;
  }
};

/**
 * 音声をテキストに変換（音声認識）
 * @param audioFile 音声ファイル
 * @returns 認識されたテキスト
 */
export const transcribeAudio = async (audioFile: any) => {
  try {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'gpt-4o-transcribe');

    const response = await transcribeApi.post('', formData);
    return response.data;
  } catch (error) {
    console.error('Transcribe API error:', error);
    throw error;
  }
};

/**
 * テキストを音声に変換（音声合成）
 * @param text 合成するテキスト
 * @param voice 音声のタイプ（デフォルト: 'alloy'）
 * @returns 音声データ（ArrayBuffer）
 */
export const synthesizeSpeech = async (text: string, voice: string = 'alloy') => {
  try {
    const response = await ttsApi.post('', {
      input: text,
      voice,
      model: 'tts-1'
    });
    return response.data;
  } catch (error) {
    console.error('TTS API error:', error);
    throw error;
  }
};

/**
 * モック通話用の関数：テキストから音声生成をシミュレート
 * @param text AIからのメッセージテキスト
 * @returns 音声データ（本番環境でなければモックデータ）
 */
export const mockSynthesizeSpeech = async (text: string) => {
  // 開発環境ではモックサーバーが実際のAPIレスポンス形式を模倣
  return synthesizeSpeech(text);
};

/**
 * モック通話用の関数：音声からテキスト認識をシミュレート
 * @param audioData 録音した音声データ
 * @returns 認識されたテキスト（本番環境でなければモックデータ）
 */
export const mockTranscribeAudio = async (audioData: any) => {
  // 開発環境ではモックサーバーが実際のAPIレスポンス形式を模倣
  return transcribeAudio(audioData);
};

export default {
  sendChatMessage,
  transcribeAudio,
  synthesizeSpeech,
  mockSynthesizeSpeech,
  mockTranscribeAudio,
};
