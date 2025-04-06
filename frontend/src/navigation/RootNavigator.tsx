import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppSelector } from '../store/hooks';

// ナビゲーターをインポート
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

/**
 * ルートナビゲーション
 * Reduxの認証状態に基づいてナビゲーションを切り替える
 * @returns {JSX.Element} ナビゲーション要素
 */
export default function RootNavigator(): JSX.Element {
  // Redux認証状態を取得
  const { isAuthenticated, loading, token } = useAppSelector(state => state.auth);

  if (loading) {
    // 読み込み中の表示
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // 認証済みの場合はメイン画面
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          // 未認証の場合は認証画面
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
