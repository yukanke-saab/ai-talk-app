import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserProfile, logoutUser, clearError } from '../store/slices/authSlice';

type ProfileScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Profile'>;

/**
 * プロフィール画面コンポーネント
 * @returns {JSX.Element} プロフィール画面要素
 */
export default function ProfileScreen(): JSX.Element {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const dispatch = useAppDispatch();
  
  // Reduxステートから情報を取得
  const { user, loading, error } = useAppSelector(state => state.auth);
  
  // プロフィール情報をロード
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // エラーハンドリング
  useEffect(() => {
    if (error) {
      Alert.alert('エラー', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // ログアウト処理
  const handleLogout = () => {
    dispatch(logoutUser());
  };
  
  // ローディング表示
  if (loading && !user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>プロフィール</Text>
      
      {/* ユーザー情報表示エリア（サンプル） */}
      <View style={styles.infoContainer}>
        <Text style={styles.label}>メールアドレス</Text>
        <Text style={styles.value}>user@example.com</Text>
        
        <Text style={styles.label}>現在のプラン</Text>
        <Text style={styles.value}>フリープラン</Text>
        
        <Text style={styles.label}>今月の利用時間</Text>
        <Text style={styles.value}>0 分</Text>
      </View>
      
      {/* ボタンエリア */}
      <View style={styles.buttonContainer}>
        <Button
          title="ログアウト"
          onPress={handleLogout}
          color="#f44336"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  infoContainer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
});
