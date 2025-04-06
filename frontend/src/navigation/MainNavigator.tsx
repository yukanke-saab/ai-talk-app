import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainStackParamList } from './types';

// 画面コンポーネントをインポート
import HomeScreen from '../screens/HomeScreen';
import CallScreen from '../screens/CallScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator<MainStackParamList>();

/**
 * メイン画面のナビゲーションスタック
 * @returns {JSX.Element} ナビゲーション要素
 */
export default function MainNavigator(): JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName="Home"
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
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'ホーム' }}
      />
      <Stack.Screen 
        name="Call" 
        component={CallScreen} 
        options={{ title: '通話', headerShown: false }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'プロフィール' }}
      />
    </Stack.Navigator>
  );
}
