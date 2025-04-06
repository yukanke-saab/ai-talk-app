import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store, persistor } from './src/store';
import { restoreToken } from './src/store/slices/authSlice';
import RootNavigator from './src/navigation/RootNavigator';

/**
 * アプリケーションのルートコンポーネント
 * @returns {JSX.Element} アプリケーション全体
 */
export default function App(): JSX.Element {
  // アプリ起動時にストレージからトークンを復元
  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
      } catch (e) {
        console.error('Failed to load token', e);
      }
      // 復元したトークンでRedux状態を更新
      store.dispatch(restoreToken(userToken));
    };

    bootstrapAsync();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
