import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StyleProp, 
  ViewStyle,
  TextStyle 
} from 'react-native';
import { colors, typography, spacing, border } from './theme';

/**
 * エラーメッセージのProps
 */
export interface ErrorMessageProps {
  /** エラーメッセージ */
  message: string;
  /** エラーの詳細（オプション） */
  details?: string;
  /** リトライ処理を行うコールバック関数 */
  onRetry?: () => void;
  /** リトライボタンのテキスト */
  retryText?: string;
  /** 閉じるコールバック関数 */
  onClose?: () => void;
  /** コンテナスタイル */
  containerStyle?: StyleProp<ViewStyle>;
  /** メッセージスタイル */
  messageStyle?: StyleProp<TextStyle>;
  /** 詳細スタイル */
  detailsStyle?: StyleProp<TextStyle>;
  /** エラーの種類 */
  type?: 'default' | 'warning' | 'info';
}

/**
 * エラーメッセージコンポーネント
 * アプリ内でのエラーメッセージを一貫した見た目で表示する
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  details,
  onRetry,
  retryText = 'リトライ',
  onClose,
  containerStyle,
  messageStyle,
  detailsStyle,
  type = 'default',
}) => {
  // エラータイプに応じたスタイルを取得
  const getTypeStyles = (): { 
    container: StyleProp<ViewStyle>;
    icon?: React.ReactNode;
  } => {
    switch (type) {
      case 'warning':
        return {
          container: styles.warningContainer,
        };
      case 'info':
        return {
          container: styles.infoContainer,
        };
      case 'default':
      default:
        return {
          container: styles.defaultContainer,
        };
    }
  };

  const { container } = getTypeStyles();

  return (
    <View style={[styles.container, container, containerStyle]}>
      <View style={styles.content}>
        <Text style={[styles.message, messageStyle]}>
          {message}
        </Text>
        
        {details && (
          <Text style={[styles.details, detailsStyle]}>
            {details}
          </Text>
        )}
        
        {onRetry && (
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={onRetry}
          >
            <Text style={styles.retryText}>{retryText}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {onClose && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// バリエーション - インラインエラー
export const InlineError: React.FC<{ message: string }> = ({ message }) => {
  if (!message) return null;
  
  return (
    <Text style={styles.inlineError}>{message}</Text>
  );
};

// スタイル
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: border.radius.md,
    marginBottom: spacing.md,
  },
  defaultContainer: {
    backgroundColor: colors.error + '15', // 15% の透明度
    borderLeftWidth: border.width.normal,
    borderLeftColor: colors.error,
  },
  warningContainer: {
    backgroundColor: colors.warning + '15',
    borderLeftWidth: border.width.normal,
    borderLeftColor: colors.warning,
  },
  infoContainer: {
    backgroundColor: colors.info + '15',
    borderLeftWidth: border.width.normal,
    borderLeftColor: colors.info,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  details: {
    fontSize: typography.fontSize.sm,
    color: colors.gray700,
    marginBottom: spacing.md,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: border.radius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  retryText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
  },
  closeButton: {
    marginLeft: spacing.sm,
    alignSelf: 'flex-start',
  },
  closeText: {
    fontSize: typography.fontSize.md,
    color: colors.gray600,
    fontWeight: typography.fontWeight.bold as any,
    paddingHorizontal: spacing.xs,
  },
  inlineError: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs / 2,
  },
});
