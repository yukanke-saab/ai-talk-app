import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ナビゲーターをインポート
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

/**
 * ルートナビゲーション
 * @returns {JSX.Element} ナビゲーション要素
 */
export default function RootNavigator(): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  // アプリ起動時にトークンをチェック
  useEffect(() => {
    const bootstrapAsync = async () => {
      let token = null;
      
      try {
        // AsyncStorageからトークンを取得
        token = await AsyncStorage.getItem('userToken');
        
        // TODO: トークンの有効性を検証する (バックエンドAPIとの連携) - Issue #4で実装予定
      } catch (e) {
        console.error('Failed to load token', e);
      }
      
      // トークンの有無で認証状態を更新
      setUserToken(token);
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  if (isLoading) {
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
        {userToken ? (
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
