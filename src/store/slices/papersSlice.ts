import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../config/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Paper } from '../../types/content';
import { AppDispatch, RootState } from '../index';

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

export const fetchPapers = createAsyncThunk<Paper[], void, {
    dispatch: AppDispatch;
    state: RootState;
    rejectValue: string;
}>(
    'papers/fetchPapers',
    async (_, { rejectWithValue }) => {
        try {
            const papersRef = collection(db, 'papers');
            const q = query(papersRef, orderBy('uploadedAt', 'desc'));
            const querySnapshot = await getDocs(q);

            const papersData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Paper[];

            return papersData;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch papers';
            return rejectWithValue(errorMessage);
        }
    }
);

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
    extraReducers: (builder) => {
        builder
            .addCase(fetchPapers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPapers.fulfilled, (state, action) => {
                state.loading = false;
                state.papers = action.payload;
            })
            .addCase(fetchPapers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch papers';
            });
    },
});

export const { setPapers, setLoading, setError } = papersSlice.actions;
export default papersSlice.reducer;