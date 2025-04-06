import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, border } from './theme';

/**
 * テキスト入力コンポーネントのProps
 */
export interface TextInputProps extends RNTextInputProps {
  /** ラベルテキスト */
  label?: string;
  /** エラーメッセージ */
  error?: string;
  /** ヘルプテキスト */
  helper?: string;
  /** 入力値必須かどうか */
  required?: boolean;
  /** コンテナスタイル */
  containerStyle?: StyleProp<ViewStyle>;
  /** 入力フィールドスタイル */
  inputStyle?: StyleProp<TextStyle>;
  /** ラベルスタイル */
  labelStyle?: StyleProp<TextStyle>;
  /** 使用不可状態 */
  disabled?: boolean;
  /** 右側のアイコン */
  rightIcon?: React.ReactNode;
  /** 右側のアイコンを押した時のコールバック */
  onRightIconPress?: () => void;
  /** 入力フィールドの外側の枠線スタイル */
  variant?: 'outline' | 'filled' | 'underline';
  /** パスワード表示切替ボタン付きのパスワード入力かどうか */
  isPassword?: boolean;
}

/**
 * カスタムテキスト入力コンポーネント
 */
export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helper,
  required = false,
  containerStyle,
  inputStyle,
  labelStyle,
  disabled = false,
  rightIcon,
  onRightIconPress,
  variant = 'outline',
  isPassword = false,
  secureTextEntry,
  onFocus,
  onBlur,
  ...rest
}) => {
  // パスワード表示状態管理
  const [passwordVisible, setPasswordVisible] = useState(false);
  // フォーカス状態管理
  const [isFocused, setIsFocused] = useState(false);

  // セキュアテキスト設定（パスワード表示/非表示）
  const secureEntry = isPassword 
    ? passwordVisible ? false : true 
    : secureTextEntry;

  // フォーカス時のハンドラー
  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  // ブラー（フォーカス外れた）時のハンドラー
  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

  // 入力フィールドの外枠スタイル計算
  const getContainerStyles = (): StyleProp<ViewStyle>[] => {
    const baseStyle: StyleProp<ViewStyle>[] = [styles.inputContainer];
    
    // バリアント別のスタイル
    switch (variant) {
      case 'filled':
        return [...baseStyle, styles.filledContainer];
      case 'underline':
        return [...baseStyle, styles.underlineContainer];
      case 'outline':
      default:
        baseStyle.push(styles.outlineContainer);
        break;
    }
    
    // 状態別のスタイル
    if (isFocused) {
      baseStyle.push(styles.focusedContainer);
    }
    
    if (error) {
      baseStyle.push(styles.errorContainer);
    }
    
    if (disabled) {
      baseStyle.push(styles.disabledContainer);
    }
    
    return baseStyle;
  };

  // パスワード表示切替アイコン
  const renderPasswordIcon = () => {
    if (!isPassword) return null;
    
    return (
      <TouchableOpacity 
        style={styles.rightIconContainer}
        onPress={() => setPasswordVisible(!passwordVisible)}
      >
        <Text style={styles.iconText}>
          {passwordVisible ? '隠す' : '表示'}
        </Text>
      </TouchableOpacity>
    );
  };

  // 右側アイコン表示
  const renderRightIcon = () => {
    if (!rightIcon && !isPassword) return null;
    
    if (isPassword) {
      return renderPasswordIcon();
    }
    
    if (rightIcon) {
      return (
        <TouchableOpacity 
          style={styles.rightIconContainer}
          onPress={onRightIconPress}
          disabled={!onRightIconPress}
        >
          {rightIcon}
        </TouchableOpacity>
      );
    }
    
    return null;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* ラベル */}
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.requiredMark}>*</Text>}
        </Text>
      )}
      
      {/* 入力フィールド */}
      <View style={getContainerStyles()}>
        <RNTextInput
          style={[
            styles.input,
            disabled && styles.disabledInput,
            inputStyle,
          ]}
          placeholderTextColor={colors.gray500}
          editable={!disabled}
          secureTextEntry={secureEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {renderRightIcon()}
      </View>
      
      {/* エラーメッセージまたはヘルパーテキスト */}
      {(error || helper) && (
        <Text 
          style={[
            styles.helperText,
            error ? styles.errorText : null,
          ]}
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%',
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.gray800,
    marginBottom: spacing.xs / 2,
  },
  requiredMark: {
    color: colors.error,
    marginLeft: spacing.xs / 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  outlineContainer: {
    borderWidth: border.width.thin,
    borderColor: colors.gray300,
    borderRadius: border.radius.md,
    paddingHorizontal: spacing.sm,
  },
  filledContainer: {
    backgroundColor: colors.gray100,
    borderRadius: border.radius.md,
    paddingHorizontal: spacing.sm,
  },
  underlineContainer: {
    borderBottomWidth: border.width.thin,
    borderBottomColor: colors.gray300,
    paddingHorizontal: 0,
  },
  focusedContainer: {
    borderColor: colors.primary,
  },
  errorContainer: {
    borderColor: colors.error,
  },
  disabledContainer: {
    backgroundColor: colors.gray100,
    borderColor: colors.gray300,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  disabledInput: {
    color: colors.gray600,
  },
  rightIconContainer: {
    marginLeft: spacing.xs,
    padding: spacing.xs,
  },
  iconText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray600,
    marginTop: spacing.xs / 2,
  },
  errorText: {
    color: colors.error,
  },
});
