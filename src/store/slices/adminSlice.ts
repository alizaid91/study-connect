import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminState {
  isAdmin: boolean;
}

const initialState: AdminState = {
  isAdmin: localStorage.getItem('isAdmin') === 'true',
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdmin: (state, action: PayloadAction<boolean>) => {
      state.isAdmin = action.payload;
      localStorage.setItem('isAdmin', action.payload.toString());
    },
    logoutAdmin: (state) => {
      state.isAdmin = false;
      localStorage.removeItem('isAdmin');
    },
  },
});

export const { setAdmin, logoutAdmin } = adminSlice.actions;
export default adminSlice.reducer; 