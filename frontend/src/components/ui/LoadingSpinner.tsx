import React from 'react';
import { 
  ActivityIndicator, 
  View, 
  StyleSheet, 
  StyleProp, 
  ViewStyle,
  Text
} from 'react-native';
import { colors, spacing, typography } from './theme';

/**
 * ローディングスピナーのProps
 */
export interface LoadingSpinnerProps {
  /** ローディング中かどうか */
  loading?: boolean;
  /** スピナーのサイズ */
  size?: 'small' | 'large';
  /** スピナーの色 */
  color?: string;
  /** コンテナスタイル */
  containerStyle?: StyleProp<ViewStyle>;
  /** ローディングメッセージ */
  message?: string;
  /** オーバーレイとして表示するかどうか（画面全体を覆う） */
  overlay?: boolean;
}

/**
 * ローディングスピナーコンポーネント
 * 読み込み中の状態を表示する
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  loading = true,
  size = 'large',
  color = colors.primary,
  containerStyle,
  message,
  overlay = false,
}) => {
  if (!loading) return null;
  
  return (
    <View 
      style={[
        styles.container,
        overlay && styles.overlayContainer,
        containerStyle
      ]}
    >
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
};

/**
 * 画面全体を覆うローディングオーバーレイ
 */
export const LoadingOverlay: React.FC<Omit<LoadingSpinnerProps, 'overlay'>> = (props) => (
  <LoadingSpinner {...props} overlay={true} />
);

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },
  message: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
