import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthStackParamList } from '../navigation/types';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

/**
 * ログイン画面コンポーネント
 * @returns {JSX.Element} ログイン画面要素
 */
export default function LoginScreen(): JSX.Element {
  const navigation = useNavigation<LoginScreenNavigationProp>();
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
      
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>アカウントをお持ちでない方は</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>新規登録</Text>
        </TouchableOpacity>
      </View>
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#666',
  },
  registerLink: {
    marginLeft: 5,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});
