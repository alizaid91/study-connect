import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminState {
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

// Load initial state from localStorage
const loadInitialState = (): AdminState => {
  const savedState = localStorage.getItem('adminState');
  if (savedState) {
    return JSON.parse(savedState);
  }
  return {
    isAdmin: false,
    loading: false,
    error: null,
  };
};

const initialState: AdminState = loadInitialState();

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdmin: (state, action: PayloadAction<boolean>) => {
      state.isAdmin = action.payload;
      // Save to localStorage
      localStorage.setItem('adminState', JSON.stringify(state));
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      localStorage.setItem('adminState', JSON.stringify(state));
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      localStorage.setItem('adminState', JSON.stringify(state));
    },
    logout: (state) => {
      state.isAdmin = false;
      state.error = null;
      localStorage.removeItem('adminState');
    },
  },
});

export const { setAdmin, setLoading, setError, logout } = adminSlice.actions;
export default adminSlice.reducer; 