import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/types';

type CallScreenRouteProp = RouteProp<MainStackParamList, 'Call'>;
type CallScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Call'>;

/**
 * 通話画面コンポーネント
 * @returns {JSX.Element} 通話画面要素
 */
export default function CallScreen(): JSX.Element {
  const navigation = useNavigation<CallScreenNavigationProp>();
  const route = useRoute<CallScreenRouteProp>();
  const { aiId } = route.params || {};
  const [isConnected, setIsConnected] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // 通話開始APIを呼び出す（実際の実装はIssue #4で行う）
    const connectCall = async () => {
      // 仮のAPIコール成功をシミュレート
      setTimeout(() => {
        setIsConnected(true);
      }, 2000);
    };

    connectCall();

    // タイマーを設定
    let timer: NodeJS.Timeout;
    if (isConnected) {
      timer = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    // クリーンアップ
    return () => {
      if (timer) clearInterval(timer);
      // 通話終了APIを呼び出す（実際の実装はIssue #4で行う）
    };
  }, [aiId, isConnected]);

  const handleEndCall = () => {
    // 通話終了APIを呼び出す（実際の実装はIssue #4で行う）
    navigation.goBack();
  };

  // 経過時間のフォーマット
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // AI名の仮データ
  const getAiName = (id?: string) => {
    const aiMap: Record<string, string> = {
      '1': 'AI アシスタント',
      '2': 'AI フレンド',
      '3': 'AI コーチ',
    };
    return id ? aiMap[id] || '不明なAI' : '不明なAI';
  };

  return (
    <View style={styles.container}>
      {!isConnected ? (
        <View style={styles.connectingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.connectingText}>接続中...</Text>
        </View>
      ) : (
        <View style={styles.callContainer}>
          <Text style={styles.aiName}>{getAiName(aiId)}</Text>
          <View style={styles.callStatus}>
            <Text style={styles.statusText}>通話中</Text>
            <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
          </View>
          <View style={styles.controls}>
            <Button
              title="通話終了"
              onPress={handleEndCall}
              color="#f44336"
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingText: {
    marginTop: 16,
    fontSize: 18,
  },
  callContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  aiName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
  },
  callStatus: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '200',
  },
  controls: {
    marginBottom: 40,
  },
});
