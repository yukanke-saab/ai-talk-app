/**
 * OpenAI APIとの連携サービス
 * 音声認識、チャット生成、音声合成の機能を提供
 */
import axios from 'axios';
import FormData from 'form-data';

// 環境変数からAPIのURLとキーを取得
const OPENAI_API_URL = process.env.OPENAI_API_URL || 'http://localhost:8080/openai';
const TRANSCRIBE_API_URL = process.env.TRANSCRIBE_API_URL || 'http://localhost:8080/transcribe';
const TTS_API_URL = process.env.TTS_API_URL || 'http://localhost:8080/tts';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'mock_key_for_development';

// OpenAI API クライアント
const openaiApi = axios.create({
  baseURL: OPENAI_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`
  }
});

// 音声認識 API クライアント
const transcribeApi = axios.create({
  baseURL: TRANSCRIBE_API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${OPENAI_API_KEY}`
  }
});

// 音声合成 API クライアント
const ttsApi = axios.create({
  baseURL: TTS_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`
  },
  responseType: 'arraybuffer'
});

/**
 * AIとのチャット
 * @param messages チャット履歴
 * @returns AIの応答
 */
export const sendChatMessage = async (messages: any[]) => {
  try {
    const response = await openaiApi.post('/chat/completions', {
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
 * @param audioBuffer 音声データのバッファ
 * @returns 認識されたテキスト
 */
export const transcribeAudio = async (audioBuffer: Buffer) => {
  try {
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: 'audio.webm',
      contentType: 'audio/webm'
    });
    formData.append('model', 'gpt-4o-transcribe');

    const response = await transcribeApi.post('', formData, {
      headers: formData.getHeaders()
    });
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
 * @returns 音声データ（Buffer）
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

export default {
  sendChatMessage,
  transcribeAudio,
  synthesizeSpeech
};
