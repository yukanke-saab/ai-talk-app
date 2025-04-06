import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

// インターフェース定義
interface AI {
  id: string;
  name: string;
  description?: string;
}

interface CallState {
  isCallActive: boolean;
  currentAI: AI | null;
  callStartTime: number | null;
  callDuration: number; // 秒単位
  isConnecting: boolean;
  isMuted: boolean;
  callError: string | null;
}

// 非同期アクション: 通話開始
export const startCall = createAsyncThunk(
  'call/start',
  async (aiId: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/call/start', { aiId });
      return response.data; // AI情報を含む
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '通話の開始に失敗しました');
    }
  }
);

// 非同期アクション: 通話終了
export const endCall = createAsyncThunk(
  'call/end',
  async (_, { getState, rejectWithValue }) => {
    try {
      // TODO: callDurationを正確に計算
      const response = await api.post('/call/end');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '通話の終了に失敗しました');
    }
  }
);

// 初期状態
const initialState: CallState = {
  isCallActive: false,
  currentAI: null,
  callStartTime: null,
  callDuration: 0,
  isConnecting: false,
  isMuted: false,
  callError: null
};

// スライス作成
const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    // マイクのミュート状態を切り替える
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },
    // 通話時間を更新（1秒ごとに呼び出す）
    updateCallDuration: (state) => {
      if (state.isCallActive && state.callStartTime) {
        const now = Date.now();
        state.callDuration = Math.floor((now - state.callStartTime) / 1000);
      }
    },
    // 通話エラーをクリア
    clearCallError: (state) => {
      state.callError = null;
    },
    // モックデータを使用した通話開始（バックエンド不要）
    startMockCall: (state, action: PayloadAction<AI>) => {
      state.isCallActive = true;
      state.currentAI = action.payload;
      state.callStartTime = Date.now();
      state.callDuration = 0;
      state.isConnecting = false;
    },
    // モックデータを使用した通話終了（バックエンド不要）
    endMockCall: (state) => {
      state.isCallActive = false;
      state.currentAI = null;
      state.callStartTime = null;
      // callDurationはリセットしない（履歴として残す）
    }
  },
  extraReducers: (builder) => {
    // 通話開始アクション
    builder
      .addCase(startCall.pending, (state) => {
        state.isConnecting = true;
        state.callError = null;
      })
      .addCase(startCall.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.isCallActive = true;
        state.currentAI = action.payload.ai;
        state.callStartTime = Date.now();
        state.callDuration = 0;
      })
      .addCase(startCall.rejected, (state, action) => {
        state.isConnecting = false;
        state.callError = action.payload as string;
      });
    
    // 通話終了アクション
    builder
      .addCase(endCall.fulfilled, (state) => {
        state.isCallActive = false;
        state.currentAI = null;
        state.callStartTime = null;
        // callDurationはリセットしない（履歴として残す）
      })
      .addCase(endCall.rejected, (state, action) => {
        state.callError = action.payload as string;
        // エラーが発生しても通話状態を終了する
        state.isCallActive = false;
        state.currentAI = null;
        state.callStartTime = null;
      });
  }
});

// アクションをエクスポート
export const { 
  toggleMute, 
  updateCallDuration, 
  clearCallError,
  startMockCall,
  endMockCall
} = callSlice.actions;

// リデューサーをエクスポート
export default callSlice.reducer;
