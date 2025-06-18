import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from 'firebase/auth';

interface AuthState {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
  } | null;
  loading: boolean;
  error: string | null;
}

// Load initial state from localStorage
const loadInitialState = (): AuthState => {
  const savedState = localStorage.getItem('authState');
  if (savedState) {
    return JSON.parse(savedState);
  }
  return {
    user: null,
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
          email: action.payload.email,
          displayName: action.payload.displayName,
        };
      } else {
        state.user = null;
      }
      // Save to localStorage
      localStorage.setItem('authState', JSON.stringify(state));
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      localStorage.setItem('authState', JSON.stringify(state));
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      localStorage.setItem('authState', JSON.stringify(state));
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
      localStorage.removeItem('authState');
    },
  },
});

export const { setUser, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer; 