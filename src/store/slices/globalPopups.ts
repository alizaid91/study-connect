import { createSlice } from "@reduxjs/toolkit";

interface GlobalPopupsState {
  isPremiumComingSoonOpen: boolean;
  isProfileCompleteOpen: boolean;
}

const initialState: GlobalPopupsState = {
  isPremiumComingSoonOpen: false,
  isProfileCompleteOpen: false,
};

const globalPopups = createSlice({
  name: "globalPopups",
  initialState,
  reducers: {
    openPremiumComingSoon: (state) => {
      state.isPremiumComingSoonOpen = true;
    },
    closePremiumComingSoon: (state) => {
      state.isPremiumComingSoonOpen = false;
    },
    openProfileComplete: (state) => {
      state.isProfileCompleteOpen = true;
    },
    closeProfileComplete: (state) => {
      state.isProfileCompleteOpen = false;
    },
  },
});

export const {
  openPremiumComingSoon,
  closePremiumComingSoon,
  openProfileComplete,
  closeProfileComplete,
} = globalPopups.actions;

export default globalPopups.reducer;
