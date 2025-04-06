/**
 * UI共通テーマ定義
 * カラー、サイズ、スペーシングなどのデザイン定数
 */

// カラーパレット
export const colors = {
  // プライマリーカラー
  primary: '#007AFF',
  primaryDark: '#0062CC',
  primaryLight: '#4D9FFF',
  
  // セカンダリーカラー
  secondary: '#5856D6',
  secondaryDark: '#4845AB',
  secondaryLight: '#7A79E1',
  
  // グレースケール
  white: '#FFFFFF',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  black: '#000000',
  
  // 意味論的カラー
  success: '#34C759',
  warning: '#FFCC00',
  error: '#FF3B30',
  info: '#5AC8FA',
  
  // 背景色
  background: '#FFFFFF',
  surface: '#FFFFFF',
  
  // テキスト色
  textPrimary: '#000000',
  textSecondary: '#757575',
  textDisabled: '#9E9E9E',
  textInverse: '#FFFFFF',
};

// タイポグラフィ
export const typography = {
  fontFamily: {
    base: undefined, // デフォルトのシステムフォント
    heading: undefined,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  fontWeight: {
    regular: 'normal',
    medium: '500',
    bold: 'bold',
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    loose: 1.75,
  },
};

// スペーシング
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// ボーダー
export const border = {
  radius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
  },
  width: {
    thin: 1,
    normal: 2,
    thick: 3,
  },
};

// シャドウ
export const shadow = {
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
};

// アニメーション
export const animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 450,
  },
};

// レイアウト
export const layout = {
  containerPadding: spacing.md,
  maxContentWidth: 768,
};

// zIndex
export const zIndex = {
  base: 0,
  elevated: 1,
  dropdown: 10,
  modal: 100,
  toast: 1000,
};
