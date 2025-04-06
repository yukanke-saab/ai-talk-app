import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  ActivityIndicator,
  View,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing, border } from './theme';

/**
 * ボタンの種類
 */
export type ButtonType = 'primary' | 'secondary' | 'outline' | 'text';

/**
 * ボタンのサイズ
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * ボタンコンポーネントのProps
 */
export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /** ボタンのテキスト */
  label: string;
  /** ボタンの種類 */
  type?: ButtonType;
  /** ボタンのサイズ */
  size?: ButtonSize;
  /** ボタンが無効かどうか */
  disabled?: boolean;
  /** ボタンが読み込み中かどうか */
  loading?: boolean;
  /** ボタンの左側に表示するアイコン */
  leftIcon?: React.ReactNode;
  /** ボタンの右側に表示するアイコン */
  rightIcon?: React.ReactNode;
  /** ボタンのスタイル */
  style?: StyleProp<ViewStyle>;
  /** ボタンのテキストのスタイル */
  labelStyle?: StyleProp<TextStyle>;
  /** ボタンがフルサイズ(親要素の横幅いっぱい)かどうか */
  fullWidth?: boolean;
}

/**
 * 共通ボタンコンポーネント
 * @returns ボタン要素
 */
export const Button: React.FC<ButtonProps> = ({ 
  label, 
  type = 'primary', 
  size = 'medium', 
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  labelStyle,
  fullWidth = false,
  ...rest 
}) => {
  // ボタンタイプに応じたスタイル
  const getTypeStyles = (): { 
    container: StyleProp<ViewStyle>;
    label: StyleProp<TextStyle>;
    indicator: string;
  } => {
    switch (type) {
      case 'primary':
        return {
          container: styles.primaryContainer,
          label: styles.primaryLabel,
          indicator: colors.white,
        };
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          label: styles.secondaryLabel,
          indicator: colors.white,
        };
      case 'outline':
        return {
          container: styles.outlineContainer,
          label: styles.outlineLabel,
          indicator: colors.primary,
        };
      case 'text':
        return {
          container: styles.textContainer,
          label: styles.textLabel,
          indicator: colors.primary,
        };
      default:
        return {
          container: styles.primaryContainer,
          label: styles.primaryLabel,
          indicator: colors.white,
        };
    }
  };

  // ボタンサイズに応じたスタイル
  const getSizeStyles = (): StyleProp<ViewStyle> => {
    switch (size) {
      case 'small':
        return styles.smallContainer;
      case 'large':
        return styles.largeContainer;
      case 'medium':
      default:
        return styles.mediumContainer;
    }
  };

  const { container, label: labelTypeStyle, indicator } = getTypeStyles();
  const sizeStyle = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.baseContainer,
        container,
        sizeStyle,
        fullWidth && styles.fullWidth,
        disabled && styles.disabledContainer,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
    >
      <View style={styles.contentContainer}>
        {leftIcon && !loading && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        {loading ? (
          <ActivityIndicator size="small" color={indicator} />
        ) : (
          <Text 
            style={[
              styles.baseLabel,
              labelTypeStyle,
              disabled && styles.disabledLabel,
              labelStyle,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        )}
        
        {rightIcon && !loading && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

/**
 * プライマリーボタンコンポーネント
 * @returns プライマリーボタン要素
 */
export const PrimaryButton: React.FC<Omit<ButtonProps, 'type'>> = (props) => (
  <Button type="primary" {...props} />
);

/**
 * セカンダリーボタンコンポーネント
 * @returns セカンダリーボタン要素
 */
export const SecondaryButton: React.FC<Omit<ButtonProps, 'type'>> = (props) => (
  <Button type="secondary" {...props} />
);

/**
 * アウトラインボタンコンポーネント
 * @returns アウトラインボタン要素
 */
export const OutlineButton: React.FC<Omit<ButtonProps, 'type'>> = (props) => (
  <Button type="outline" {...props} />
);

/**
 * テキストボタンコンポーネント
 * @returns テキストボタン要素
 */
export const TextButton: React.FC<Omit<ButtonProps, 'type'>> = (props) => (
  <Button type="text" {...props} />
);

const styles = StyleSheet.create({
  baseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: border.radius.md,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  primaryContainer: {
    backgroundColor: colors.primary,
  },
  secondaryContainer: {
    backgroundColor: colors.secondary,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: border.width.thin,
    borderColor: colors.primary,
  },
  textContainer: {
    backgroundColor: 'transparent',
  },
  smallContainer: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 32,
  },
  mediumContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 40,
  },
  largeContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  disabledContainer: {
    backgroundColor: colors.gray300,
    borderColor: colors.gray300,
  },
  baseLabel: {
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium as any,
    fontSize: typography.fontSize.md,
  },
  primaryLabel: {
    color: colors.white,
  },
  secondaryLabel: {
    color: colors.white,
  },
  outlineLabel: {
    color: colors.primary,
  },
  textLabel: {
    color: colors.primary,
  },
  disabledLabel: {
    color: colors.gray600,
  },
  leftIconContainer: {
    marginRight: spacing.xs,
  },
  rightIconContainer: {
    marginLeft: spacing.xs,
  },
});
