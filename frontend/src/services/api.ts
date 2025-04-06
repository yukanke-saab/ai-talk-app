import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // トークン保存用
import Constants from 'expo-constants';

// 環境変数からAPIのベースURLを取得（利用できない場合はデフォルト値を使用）
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター: リクエスト送信前にトークンをヘッダーに追加
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// TODO: レスポンスインターセプター: 401エラー時の処理など (任意)

export default api;
