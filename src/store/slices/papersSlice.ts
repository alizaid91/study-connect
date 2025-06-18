import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Paper } from '../../types/content';

interface PapersState {
    papers: Paper[];
    loading: boolean;
    error: string | null;
}

const initialState: PapersState = {
    papers: [],
    loading: false,
    error: null,
};

const papersSlice = createSlice({
    name: 'papers',
    initialState,
    reducers: {
        setPapers: (state, action: PayloadAction<Paper[]>) => {
            state.papers = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const { setPapers, setLoading, setError } = papersSlice.actions;
export default papersSlice.reducer;