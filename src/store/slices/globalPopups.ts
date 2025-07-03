import { createSlice } from '@reduxjs/toolkit';

interface GlobalPopupsState {
    isPremiumComingSoonOpen: boolean;
}

const initialState: GlobalPopupsState = {
    isPremiumComingSoonOpen: false,
};

const globalPopups = createSlice({
    name: 'globalPopups',
    initialState,
    reducers: {
        openPremiumComingSoon: (state) => {
            state.isPremiumComingSoonOpen = true;
        },
        closePremiumComingSoon: (state) => {
            state.isPremiumComingSoonOpen = false;
        },
    },
});

export const {
    openPremiumComingSoon,
    closePremiumComingSoon,
} = globalPopups.actions;

export default globalPopups.reducer;