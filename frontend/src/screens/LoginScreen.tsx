import React from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';

/**
 * ログイン画面コンポーネント
 * @returns {JSX.Element} ログイン画面要素
 */
export default function LoginScreen(): JSX.Element {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = () => {
    // TODO: ログインAPI連携 (Issue #2)
    console.log('Login attempt with:', email, password);
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
      <Button title="ログイン" onPress={handleLogin} />
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
