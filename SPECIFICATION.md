# 仕様書

**1. アプリケーション概要**

*   **アプリケーション名:** (仮) AI通話アプリ
*   **目的:** 寂しさの解消、老人の安否確認、認知症の予防
*   **概要:** AIとまるで人間と通話しているかのように音声通話できるアプリケーション。

**2. ターゲットユーザー**

*   誰でも使えるアプリだが、特に話し相手のいない老人をターゲットとする。

**3. 機能仕様**

*   **3.1 AIとの通話機能**
    *   **機能概要:** ユーザーがAIと音声通話できる機能。
    *   **動作:**
        1.  ユーザーが発信ボタンを押す。
        2.  アプリケーションがAIとの通話を開始する。
        3.  ユーザーがAIと音声で会話する。
        4.  ユーザーが通話終了ボタンを押す。
        5.  アプリケーションがAIとの通話を終了する。
    *   **AI:**
        *   複数の人格を用意する。
        *   各人格ごとに会話内容を記録しておく。
    *   **API:**
        *   OpenAI API (ChatGPT) - AIチャット
        *   OpenAI API (GPT-4o-transcribe) - 音声テキスト変換
        *   OpenAI API (TTS) - テキスト音声変換
        *   （代替オプション）VOICEVOX - 日本語特化のテキスト音声変換
*   **3.2 AIからの着信機能**
    *   **機能概要:** AIからユーザーに着信がある機能。
    *   **動作:**
        1.  アプリケーションが夜間早朝を除くランダムな時間にAIからの着信を生成する。
        2.  ユーザーに着信通知を表示する。
        3.  ユーザーが着信に応答する。
        4.  アプリケーションがAIとの通話を開始する。
        5.  ユーザーがAIと音声で会話する。
        6.  ユーザーが通話終了ボタンを押す。
        7.  アプリケーションがAIとの通話を終了する。
    *   **通知:**
        *   Expo Push Notifications
*   **3.3 課金機能**
    *   **機能概要:** アプリケーションの利用料金を課金する機能。
    *   **料金体系:**
        *   有料プラン加入ユーザーのみ利用可能。
        *   月額課金に加えて一定の利用を超えたら追加課金する「定額＋従量課金制」。
    *   **決済サービス:**
        *   Stripe
    *   **データベース:**
        *   Supabase (PostgreSQL)

**4. データベーススキーマ**

*   **4.1 ユーザー情報**
    *   user_id (INTEGER, PRIMARY KEY)
    *   password (TEXT)
    *   email (TEXT)
    *   billing_information (TEXT)
*   **4.2 AIの会話履歴**
    *   conversation_id (INTEGER, PRIMARY KEY)
    *   user_id (INTEGER, FOREIGN KEY)
    *   ai_id (INTEGER)
    *   timestamp (TIMESTAMP)
    *   message (TEXT)
*   **4.3 課金情報**
    *   billing_id (INTEGER, PRIMARY KEY)
    *   user_id (INTEGER, FOREIGN KEY)
    *   payment_method (TEXT)
    *   billing_date (TIMESTAMP)
    *   amount (REAL)

**5. API仕様**

*   **5.1 OpenAI API (チャット、音声認識、音声合成)**
    *   **チャット API:**
        *   エンドポイント: https://api.openai.com/v1/chat/completions
        *   モデル: GPT-4o
    *   **音声認識 API:**
        *   エンドポイント: https://api.openai.com/v1/audio/transcriptions
        *   モデル: GPT-4o-transcribe
    *   **音声合成 API:**
        *   エンドポイント: https://api.openai.com/v1/audio/speech
        *   モデル: TTS-1 または TTS-1-HD
*   **5.2 VOICEVOX (代替オプション)**
    *   エンドポイント: (セルフホスト/公式API)
    *   音声合成の日本語特化モデル
    *   カスタマイズ可能な音声キャラクター

**6. その他**

*   これらの機能は実際の電話番号を用いた電話ではなく、アプリ内における機能である。
