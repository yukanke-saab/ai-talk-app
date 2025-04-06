import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Audio, AVPlaybackStatus, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { MainStackParamList } from '../navigation/types';
import { RootState } from '../store';
import { startMockCall, endMockCall, toggleMute, updateCallDuration } from '../store/slices/callSlice';
import aiService from '../services/aiService';

type CallScreenRouteProp = RouteProp<MainStackParamList, 'Call'>;
type CallScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Call'>;

/**
 * AIとの通話モード
 */
enum CallMode {
  LISTENING = 'listening',  // ユーザーの音声を聞いている
  PROCESSING = 'processing', // 音声をテキストに変換し、AI応答を生成中
  SPEAKING = 'speaking',    // AIの応答を話している
}

/**
 * 通話画面コンポーネント
 * @returns {JSX.Element} 通話画面要素
 */
export default function CallScreen(): JSX.Element {
  const navigation = useNavigation<CallScreenNavigationProp>();
  const route = useRoute<CallScreenRouteProp>();
  const dispatch = useDispatch();
  
  const { aiId } = route.params || {};
  const { isCallActive, currentAI, callDuration, isMuted } = useSelector((state: RootState) => state.call);
  
  const [isConnected, setIsConnected] = useState(false);
  const [callMode, setCallMode] = useState<CallMode>(CallMode.LISTENING);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  // 録音と再生の参照
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  
  // 通話の接続処理
  useEffect(() => {
    // オーディオモードを設定
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        });
        
        // 仮のAPIコール成功をシミュレート
        setTimeout(() => {
          setIsConnected(true);
          // AIのモック情報で通話を開始
          const mockAiInfo = {
            id: aiId || '1',
            name: getAiName(aiId),
            description: '会話AIアシスタント'
          };
          dispatch(startMockCall(mockAiInfo));
          
          // 通話開始後に録音を開始
          startRecording();
        }, 2000);
      } catch (error) {
        console.error('Failed to setup audio:', error);
        Alert.alert('エラー', '通話の準備に失敗しました');
        navigation.goBack();
      }
    };
    
    setupAudio();
    
    // タイマーを設定
    const timer = setInterval(() => {
      if (isConnected) {
        dispatch(updateCallDuration());
      }
    }, 1000);
    
    // クリーンアップ
    return () => {
      clearInterval(timer);
      stopRecording();
      stopPlayback();
      
      // 通話終了
      if (isCallActive) {
        dispatch(endMockCall());
      }
    };
  }, [aiId, dispatch, isConnected, isCallActive, navigation]);
  
  // 録音開始
  const startRecording = async () => {
    try {
      // 再生中なら停止
      if (isPlaying) {
        await stopPlayback();
      }
      
      // 録音権限をリクエスト
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('マイクへのアクセスが許可されていません');
        return;
      }
      
      // 既存の録音があれば停止
      await stopRecording();
      
      // 新しい録音を開始
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      
      recordingRef.current = recording;
      setIsRecording(true);
      setCallMode(CallMode.LISTENING);
      
      // 録音時間を制限（10秒）
      setTimeout(async () => {
        if (recordingRef.current) {
          const status = await recordingRef.current.getStatusAsync();
          if (status.isRecording) {
            await processRecording();
          }
        }
      }, 10000);
      
    } catch (error) {
      console.error('録音開始エラー:', error);
      Alert.alert('録音エラー', '録音の開始に失敗しました');
    }
  };
  
  // 録音停止と処理
  const processRecording = async () => {
    if (!recordingRef.current) return;
    
    try {
      setCallMode(CallMode.PROCESSING);
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);
      
      if (!uri) {
        throw new Error('録音データの取得に失敗しました');
      }
      
      // 音声認識（モック）
      const transcriptionResult = await aiService.mockTranscribeAudio({ uri });
      const userMessage = transcriptionResult.text || 'こんにちは';
      setTranscript(userMessage);
      
      // チャットAPIでAI応答を取得（モック）
      const messages = [
        { role: 'system', content: '短い返答で会話をしてください。80文字以内でユーザーに返答してください。' },
        { role: 'user', content: userMessage }
      ];
      const chatResponse = await aiService.sendChatMessage(messages);
      const aiMessage = chatResponse.choices[0].message.content || 'すみません、よく聞こえませんでした。';
      setAiResponse(aiMessage);
      
      // 音声合成と再生
      await playAiResponse(aiMessage);
      
    } catch (error) {
      console.error('録音処理エラー:', error);
      Alert.alert('エラー', '音声の処理に失敗しました');
      // エラー時は再度録音を開始
      startRecording();
    }
  };
  
  // AI応答の再生
  const playAiResponse = async (text: string) => {
    try {
      setCallMode(CallMode.SPEAKING);
      
      // 音声合成（モック）
      const audioData = await aiService.mockSynthesizeSpeech(text);
      
      // 音声再生
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${audioData}` },
        { shouldPlay: true }
      );
      
      soundRef.current = sound;
      setIsPlaying(true);
      
      // 再生状態の監視
      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync();
          soundRef.current = null;
          
          // 再生完了後、再度録音を開始
          startRecording();
        }
      });
      
    } catch (error) {
      console.error('音声再生エラー:', error);
      Alert.alert('エラー', 'AIの応答再生に失敗しました');
      // エラー時は再度録音を開始
      startRecording();
    }
  };
  
  // 録音停止
  const stopRecording = async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
        setIsRecording(false);
      } catch (error) {
        console.error('録音停止エラー:', error);
      }
    }
  };
  
  // 再生停止
  const stopPlayback = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setIsPlaying(false);
      } catch (error) {
        console.error('再生停止エラー:', error);
      }
    }
  };
  
  // 通話終了処理
  const handleEndCall = async () => {
    await stopRecording();
    await stopPlayback();
    dispatch(endMockCall());
    navigation.goBack();
  };
  
  // マイクミュート切り替え
  const handleToggleMute = () => {
    dispatch(toggleMute());
  };
  
  // 経過時間のフォーマット
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // AI名の取得
  const getAiName = (id?: string) => {
    const aiMap: Record<string, string> = {
      '1': 'AI アシスタント',
      '2': 'AI フレンド',
      '3': 'AI コーチ',
    };
    return id ? aiMap[id] || '不明なAI' : '不明なAI';
  };
  
  // 通話状態に応じたステータステキスト
  const getStatusText = () => {
    if (!isConnected) return '接続中...';
    
    switch (callMode) {
      case CallMode.LISTENING:
        return '聞いています...';
      case CallMode.PROCESSING:
        return '考え中...';
      case CallMode.SPEAKING:
        return '話しています...';
      default:
        return '通話中';
    }
  };
  
  // 通話状態に応じたステータスカラー
  const getStatusColor = () => {
    if (!isConnected) return '#0000ff';
    
    switch (callMode) {
      case CallMode.LISTENING:
        return '#4CAF50'; // 緑
      case CallMode.PROCESSING:
        return '#FF9800'; // オレンジ
      case CallMode.SPEAKING:
        return '#2196F3'; // 青
      default:
        return '#4CAF50';
    }
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
          <Text style={styles.aiName}>{currentAI?.name || getAiName(aiId)}</Text>
          
          {/* 会話コンテンツエリア */}
          <View style={styles.conversationContainer}>
            {transcript && (
              <View style={styles.messageContainer}>
                <Text style={styles.userMessage}>{transcript}</Text>
              </View>
            )}
            
            {aiResponse && (
              <View style={styles.messageContainer}>
                <Text style={styles.aiMessage}>{aiResponse}</Text>
              </View>
            )}
          </View>
          
          {/* 通話ステータス */}
          <View style={styles.callStatus}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
            <Text style={styles.timerText}>{formatTime(callDuration)}</Text>
          </View>
          
          {/* 通話コントロール */}
          <View style={styles.controls}>
            <TouchableOpacity 
              style={[styles.controlButton, isMuted && styles.mutedButton]} 
              onPress={handleToggleMute}
            >
              <Ionicons 
                name={isMuted ? "mic-off" : "mic"} 
                size={24} 
                color={isMuted ? "#fff" : "#333"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, styles.endCallButton]} 
              onPress={handleEndCall}
            >
              <Ionicons name="call" size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="volume-high" size={24} color="#333" />
            </TouchableOpacity>
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
  conversationContainer: {
    flex: 1,
    marginVertical: 20,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    marginVertical: 8,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#e1f5fe',
    padding: 12,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
    color: '#333',
  },
  aiMessage: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    color: '#333',
  },
  callStatus: {
    alignItems: 'center',
    marginVertical: 20,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 8,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '200',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 40,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mutedButton: {
    backgroundColor: '#f44336',
  },
  endCallButton: {
    backgroundColor: '#f44336',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});
