import React, { useState } from 'react'; // useState をインポート
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native'; // Alert をインポート
import api from '../services/api'; // 作成したapiサービスをインポート
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage をインポート

/**
 * ログイン画面コンポーネント
 * @returns {JSX.Element} ログイン画面要素
 */
export default function LoginScreen(): JSX.Element {
  const [email, setEmail] = useState(''); // React.useState を useState に変更
  const [password, setPassword] = useState(''); // React.useState を useState に変更
  const [isLoading, setIsLoading] = useState(false); // ローディング状態を追加

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください。');
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token } = response.data;

      // トークンを保存
      await AsyncStorage.setItem('userToken', token);

      // TODO: ログイン成功後の画面遷移 (Issue #7)
      Alert.alert('成功', 'ログインしました！');
      // 例: navigation.navigate('Home');

    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'ログイン中にエラーが発生しました。';
      Alert.alert('ログインエラー', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ログイン</Text>
      <TextInput
        style={styles.input}
        placeholder="メールアドレス"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="パスワード"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="ログイン" onPress={handleLogin} disabled={isLoading} />
      {/* TODO: 新規登録画面への遷移ボタン (Issue #7) */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});
