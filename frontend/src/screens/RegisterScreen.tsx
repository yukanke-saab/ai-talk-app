import React, { useState } from 'react'; // useState をインポート
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native'; // Alert をインポート
import api from '../services/api'; // 作成したapiサービスをインポート

/**
 * 新規登録画面コンポーネント
 * @returns {JSX.Element} 新規登録画面要素
 */
export default function RegisterScreen(): JSX.Element {
  const [email, setEmail] = useState(''); // React.useState を useState に変更
  const [password, setPassword] = useState(''); // React.useState を useState に変更
  const [confirmPassword, setConfirmPassword] = useState(''); // React.useState を useState に変更
  const [isLoading, setIsLoading] = useState(false); // ローディング状態を追加

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('エラー', 'すべての項目を入力してください。');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('エラー', 'パスワードが一致しません。');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/register', { email, password });
      Alert.alert('成功', 'ユーザー登録が完了しました。ログインしてください。');
      // TODO: 登録成功後、ログイン画面へ遷移させる (Issue #7)
      // 例: navigation.navigate('Login');

    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || '登録中にエラーが発生しました。';
      Alert.alert('登録エラー', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>新規登録</Text>
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
      <TextInput
        style={styles.input}
        placeholder="パスワード（確認）"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <Button title="登録" onPress={handleRegister} disabled={isLoading} />
      {/* TODO: ログイン画面への遷移ボタン (Issue #7) */}
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
