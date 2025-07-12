import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from 'firebase/auth';
import { UserProfile } from '../../types/user';

interface AuthState {
  user: {
    uid: string;
  } | null;
  profile: UserProfile | null;
  quota: {
    taskBoards: number;
    chatSessions: number;
    aiCredits: number;
    promptsPerDay: number;
  };
  isAIActive: boolean;
  loading: boolean;
  error: string | null;
}

// Load initial state from localStorage
const loadInitialState = (): AuthState => {
  const savedState = localStorage.getItem('authState');
  if (savedState) {
    return {
      user: JSON.parse(savedState),
      profile: null,
      quota: {
        taskBoards: 0,
        chatSessions: 0,
        aiCredits: 0,
        promptsPerDay: 0,
      },
      isAIActive: false,
      loading: false,
      error: null,
    };
  }
  return {
    user: null,
    profile: null,
    quota: {
      taskBoards: 0,
      chatSessions: 0,
      aiCredits: 0,
      promptsPerDay: 0,
    },
    isAIActive: false,
    loading: false,
    error: null,
  };
};

const initialState: AuthState = loadInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      if (action.payload) {
        state.user = {
          uid: action.payload.uid,
        };
      } else {
        state.user = null;
      }
      // Save to localStorage
      localStorage.setItem('authState', JSON.stringify(state.user));
    },
    setIsAiActive: (state, action: PayloadAction<boolean>) => {
      state.isAIActive = action.payload;
    },
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    setQuota: (state, action: PayloadAction<{
      taskBoards: number;
      chatSessions: number;
      aiCredits: number;
      promptsPerDay: number;
    }>) => {
      state.quota = {
        taskBoards: action.payload.taskBoards,
        chatSessions: action.payload.chatSessions,
        aiCredits: action.payload.aiCredits,
        promptsPerDay: action.payload.promptsPerDay,
      };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      localStorage.setItem('authState', JSON.stringify(state));
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
      state.profile = null;
      localStorage.removeItem('authState');
      localStorage.removeItem('activeSessionId');
      localStorage.removeItem('selectedBoardId');
    },
  },
});

export const { setUser, setIsAiActive, setProfile, setQuota, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer; 