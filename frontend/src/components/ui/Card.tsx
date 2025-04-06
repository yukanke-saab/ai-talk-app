import React from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  StyleProp, 
  ViewStyle 
} from 'react-native';
import { colors, shadow, border, spacing } from './theme';

/**
 * カードコンポーネントのProps
 */
export interface CardProps {
  /** カードの中身 */
  children: React.ReactNode;
  /** タッチイベントハンドラー */
  onPress?: () => void;
  /** カードのスタイル */
  style?: StyleProp<ViewStyle>;
  /** タッチ可能かどうか */
  disabled?: boolean;
  /** カードの影の大きさ */
  elevation?: 'none' | 'small' | 'medium' | 'large';
  /** 角丸の大きさ */
  radius?: 'none' | 'small' | 'medium' | 'large';
  /** コンテンツパディングの大きさ */
  padding?: 'none' | 'small' | 'medium' | 'large';
}

/**
 * カードコンポーネント
 * 情報をカード形式で表示する再利用可能なコンテナ
 */
export const Card: React.FC<CardProps> = ({ 
  children, 
  onPress, 
  style, 
  disabled = false,
  elevation = 'medium',
  radius = 'medium',
  padding = 'medium',
}) => {
  // 影のスタイルを取得
  const getShadowStyle = (): StyleProp<ViewStyle> => {
    switch (elevation) {
      case 'none':
        return {};
      case 'small':
        return shadow.sm;
      case 'large':
        return shadow.lg;
      case 'medium':
      default:
        return shadow.md;
    }
  };

  // 角丸のスタイルを取得
  const getRadiusStyle = (): number => {
    switch (radius) {
      case 'none':
        return 0;
      case 'small':
        return border.radius.sm;
      case 'large':
        return border.radius.lg;
      case 'medium':
      default:
        return border.radius.md;
    }
  };

  // パディングのスタイルを取得
  const getPaddingStyle = (): number => {
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return spacing.sm;
      case 'large':
        return spacing.lg;
      case 'medium':
      default:
        return spacing.md;
    }
  };

  const cardStyle = [
    styles.card, 
    getShadowStyle(),
    { 
      borderRadius: getRadiusStyle(),
      padding: getPaddingStyle(),
    },
    style
  ];

  // タッチイベントが指定されていればTouchableOpacityを使用、そうでなければViewを使用
  if (onPress) {
    return (
      <TouchableOpacity 
        style={cardStyle} 
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
});
