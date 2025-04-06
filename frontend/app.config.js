/**
 * Expoアプリケーション設定ファイル
 * 環境変数の注入などアプリビルド時の設定を行います
 */
module.exports = {
  expo: {
    name: "AI Talk App",
    slug: "ai-talk-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yukanke.aitalkapp"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.yukanke.aitalkapp"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    // 新しいReact Nativeアーキテクチャの有効化
    newArchEnabled: true,
    extra: {
      // 環境変数の設定 - プロセス環境変数から読み込む、または既定値を使用
      apiBaseUrl: process.env.EXPO_API_BASE_URL || "http://localhost:3000/api",
      // 外部API設定
      openaiApiUrl: process.env.EXPO_OPENAI_API_URL || "http://localhost:8080/openai",
      transcribeApiUrl: process.env.EXPO_TRANSCRIBE_API_URL || "http://localhost:8080/transcribe",
      ttsApiUrl: process.env.EXPO_TTS_API_URL || "http://localhost:8080/tts",
      // EAS設定
      eas: {
        projectId: "your-project-id"
      }
    }
  }
};
