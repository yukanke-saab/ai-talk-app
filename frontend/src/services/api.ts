import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // トークン保存用

// TODO: 環境変数からAPIのベースURLを取得するように変更する
const API_BASE_URL = 'http://localhost:3000/api'; // ローカル開発環境のバックエンドAPI

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
