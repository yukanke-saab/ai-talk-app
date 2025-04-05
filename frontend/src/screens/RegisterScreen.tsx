import React from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';

/**
 * 新規登録画面コンポーネント
 * @returns {JSX.Element} 新規登録画面要素
 */
export default function RegisterScreen(): JSX.Element {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const handleRegister = () => {
    if (password !== confirmPassword) {
      // TODO: エラー表示
      console.error('Passwords do not match');
      return;
    }
    // TODO: 新規登録API連携 (Issue #2)
    console.log('Register attempt with:', email, password);
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
      <Button title="登録" onPress={handleRegister} />
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
