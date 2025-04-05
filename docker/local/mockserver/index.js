/**
 * モックサーバー
 * 開発環境でOpenAIのAPIをシミュレート（チャット、音声認識、音声合成）
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ヘルスチェックエンドポイント
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Mock Server is running' });
});

// OpenAI API モック（チャット）
app.post('/openai/chat/completions', (req, res) => {
  const { messages } = req.body;
  const lastMessage = messages[messages.length - 1];
  
  // 簡単なAI応答をシミュレート
  const response = {
    id: 'mock-' + Date.now(),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'gpt-3.5-turbo-mock',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: `これはモックレスポンスです。あなたの質問: "${lastMessage.content}"に対するシミュレートされた回答です。`
        },
        finish_reason: 'stop'
      }
    ],
    usage: {
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150
    }
  };
  
  setTimeout(() => {
    res.json(response);
  }, 500); // 若干の遅延を追加して本物のAPIのように見せる
});

// OpenAI API モック（音声認識 - GPT-4o-transcribe）
app.post('/transcribe', (req, res) => {
  // 本来はオーディオファイルを受け取るが、モックでは固定テキストを返す
  const mockTranscriptions = [
    'こんにちは、調子はどうですか？',
    '今日はとても良い天気ですね。',
    'AI通話アプリのテスト中です。',
    'このアプリは使いやすいですね。',
    'もう少し話しましょうか？'
  ];
  
  const randomIndex = Math.floor(Math.random() * mockTranscriptions.length);
  
  setTimeout(() => {
    res.json({
      text: mockTranscriptions[randomIndex]
    });
  }, 300);
});

// OpenAI API モック（音声合成 - TTS）
app.post('/tts', (req, res) => {
  // テキストから音声合成のシミュレーション
  const mockAudioBuffer = Buffer.from('mock audio data');
  
  res.set('Content-Type', 'audio/mp3');
  res.send(mockAudioBuffer);
});

// 互換性のために従来のWhisperエンドポイントもサポート（非推奨）
app.post('/whisper/transcriptions', (req, res) => {
  const mockTranscriptions = [
    'こんにちは、調子はどうですか？',
    '今日はとても良い天気ですね。',
    'AI通話アプリのテスト中です。',
    'このアプリは使いやすいですね。',
    'もう少し話しましょうか？'
  ];
  
  const randomIndex = Math.floor(Math.random() * mockTranscriptions.length);
  
  setTimeout(() => {
    res.json({
      text: mockTranscriptions[randomIndex]
    });
  }, 300);
});

// 互換性のためにVOICEVOXエンドポイントもサポート（代替オプション）
app.post('/voicevox/audio_query', (req, res) => {
  res.json({
    accent_phrases: [],
    speedScale: 1.0,
    pitchScale: 0.0,
    intonationScale: 1.0,
    volumeScale: 1.0,
    prePhonemeLength: 0.1,
    postPhonemeLength: 0.1,
    outputSamplingRate: 24000,
    outputStereo: false,
    kana: 'モックデータです'
  });
});

app.post('/voicevox/synthesis', (req, res) => {
  const mockAudioBuffer = Buffer.from('mock audio data');
  
  res.set('Content-Type', 'audio/wav');
  res.send(mockAudioBuffer);
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Mock Server running on port ${PORT}`);
});
