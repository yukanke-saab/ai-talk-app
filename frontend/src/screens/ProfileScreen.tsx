import React from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

/**
 * プロフィール画面コンポーネント
 * @returns {JSX.Element} プロフィール画面要素
 */
export default function ProfileScreen(): JSX.Element {
  const navigation = useNavigation();

  // ログアウト処理
  const handleLogout = async () => {
    try {
      // トークンを削除
      await AsyncStorage.removeItem('userToken');
      
      // ログイン画面に戻る
      // @ts-ignore: 型エラーを一時的に無視
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('エラー', 'ログアウト処理中にエラーが発生しました。');
    }
  };

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
