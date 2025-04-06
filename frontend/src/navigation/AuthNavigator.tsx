import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from './types';

// 画面コンポーネントをインポート
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createStackNavigator<AuthStackParamList>();

/**
 * 認証関連画面のナビゲーションスタック
 * @returns {JSX.Element} ナビゲーション要素
 */
export default function AuthNavigator(): JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e', // ヘッダーの背景色
        },
        headerTintColor: '#fff', // ヘッダーのテキスト色
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ title: 'ログイン' }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ title: '新規登録' }}
      />
    </Stack.Navigator>
  );
}
