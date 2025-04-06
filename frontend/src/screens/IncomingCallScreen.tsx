import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Vibration, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useDispatch } from 'react-redux';
import { MainStackParamList } from '../navigation/types';
import { startMockCall } from '../store/slices/callSlice';
import { colors, spacing, typography } from '../components/ui/theme';

type IncomingCallScreenRouteProp = RouteProp<MainStackParamList, 'IncomingCall'>;
type IncomingCallScreenNavigationProp = StackNavigationProp<MainStackParamList, 'IncomingCall'>;

/**
 * AI着信画面コンポーネント
 * AIからの着信を表示し、応答または拒否するための画面
 * @returns {JSX.Element} AI着信画面要素
 */
export default function IncomingCallScreen(): JSX.Element {
  const navigation = useNavigation<IncomingCallScreenNavigationProp>();
  const route = useRoute<IncomingCallScreenRouteProp>();
  const dispatch = useDispatch();
  
  const { aiId, aiName } = route.params || { aiId: '1', aiName: 'AI アシスタント' };
  
  const [ringing, setRinging] = useState<boolean>(true);
  const [soundObject, setSoundObject] = useState<Audio.Sound | null>(null);
  
  // 着信音の再生と振動のセットアップ
  useEffect(() => {
    // 着信音の再生
    const playRingtone = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/ringtone.mp3'), // 注: このファイルは別途作成する必要があります
          { shouldPlay: true, isLooping: true }
        );
        setSoundObject(sound);
      } catch (error) {
        console.error('着信音の再生に失敗しました', error);
      }
    };
    
    // 着信振動パターン
    const startVibration = () => {
      const pattern = [1000, 2000, 1000];
      Vibration.vibrate(pattern, true);
    };
    
    if (ringing) {
      playRingtone();
      startVibration();
      
      // 30秒後に自動的に着信を終了（不在着信として処理）
      const timeout = setTimeout(() => {
        handleDecline();
      }, 30000);
      
      return () => {
        clearTimeout(timeout);
        if (soundObject) {
          soundObject.unloadAsync();
        }
        Vibration.cancel();
      };
    }
    
    return () => {
      if (soundObject) {
        soundObject.unloadAsync();
      }
      Vibration.cancel();
    };
  }, [ringing, soundObject]);
  
  // 着信に応答
  const handleAnswer = () => {
    setRinging(false);
    if (soundObject) {
      soundObject.unloadAsync();
    }
    Vibration.cancel();
    
    // AIの情報でモック通話を開始
    dispatch(startMockCall({
      id: aiId,
      name: aiName,
      description: 'AIアシスタント',
    }));
    
    // 通話画面に遷移
    navigation.replace('Call', { aiId });
  };
  
  // 着信を拒否
  const handleDecline = () => {
    setRinging(false);
    if (soundObject) {
      soundObject.unloadAsync();
    }
    Vibration.cancel();
    
    // ホーム画面に戻る
    navigation.replace('Home');
    
    // 不在着信として記録（この部分は後でCallHistoryサービスに置き換え）
    setTimeout(() => {
      Alert.alert(
        '不在着信',
        `${aiName}からの着信がありました`,
        [{ text: 'OK' }]
      );
    }, 500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.callerInfo}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={120} color={colors.primary} />
        </View>
        <Text style={styles.callerName}>{aiName}</Text>
        <Text style={styles.callStatus}>着信中...</Text>
      </View>
      
      <View style={styles.actionsContainer}>
        {/* 拒否ボタン */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.declineButton]} 
          onPress={handleDecline}
        >
          <Ionicons name="call" size={32} color={colors.white} style={{ transform: [{ rotate: '135deg' }] }} />
          <Text style={styles.actionText}>拒否</Text>
        </TouchableOpacity>
        
        {/* 応答ボタン */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.answerButton]} 
          onPress={handleAnswer}
        >
          <Ionicons name="call" size={32} color={colors.white} />
          <Text style={styles.actionText}>応答</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  callerInfo: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  avatarContainer: {
    marginBottom: spacing.lg,
  },
  callerName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold as any,
    marginBottom: spacing.sm,
  },
  callStatus: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: spacing.xxl,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: colors.error,
  },
  answerButton: {
    backgroundColor: colors.success,
  },
  actionText: {
    color: colors.white,
    marginTop: spacing.xs,
    fontSize: typography.fontSize.sm,
  },
});
