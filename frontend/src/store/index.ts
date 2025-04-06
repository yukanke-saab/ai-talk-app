import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import callReducer from './slices/callSlice';

// Persistの設定
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // 永続化するステートを指定
};

// 全てのReducerを結合
const rootReducer = combineReducers({
  auth: authReducer,
  call: callReducer,
});

// Persistを適用したReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Storeの作成
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Redux Persistの非シリアライズ警告を無視
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Persistorの作成
export const persistor = persistStore(store);

// RootState型の定義
export type RootState = ReturnType<typeof store.getState>;
// AppDispatch型の定義
export type AppDispatch = typeof store.dispatch;
