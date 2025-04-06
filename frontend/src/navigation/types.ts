/**
 * ナビゲーションパラメータの型定義
 */
export type RootStackParamList = {
  // ルートスタック
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Call: { aiId?: string };
  Profile: undefined;
};
