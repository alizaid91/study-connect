import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Bookmark } from '../../types/content';

export interface BookmarkState {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string | null;
}

const initialState: BookmarkState = {
  bookmarks: [],
  loading: false,
  error: null
};

export const fetchBookmarks = createAsyncThunk(
  'bookmarks/fetchBookmarks',
  async (userId: string) => {
    const bookmarksRef = collection(db, 'bookmarks');
    const q = query(bookmarksRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Bookmark[];
  }
);

export const addBookmark = createAsyncThunk(
  'bookmarks/addBookmark',
  async (bookmark: Omit<Bookmark, 'id'>) => {
    const docRef = await addDoc(collection(db, 'bookmarks'), bookmark);
    return { id: docRef.id, ...bookmark };
  }
);

export const removeBookmark = createAsyncThunk(
  'bookmarks/removeBookmark',
  async (bookmarkId: string) => {
    await deleteDoc(doc(db, 'bookmarks', bookmarkId));
    return bookmarkId;
  }
);

const bookmarkSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Bookmarks
      .addCase(fetchBookmarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        state.loading = false;
        state.bookmarks = action.payload;
      })
      .addCase(fetchBookmarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bookmarks';
      })
      // Add Bookmark
      .addCase(addBookmark.fulfilled, (state, action) => {
        state.bookmarks.push(action.payload);
      })
      // Remove Bookmark
      .addCase(removeBookmark.fulfilled, (state, action) => {
        state.bookmarks = state.bookmarks.filter(bookmark => bookmark.id !== action.payload);
      });
  }
});

export default bookmarkSlice.reducer; 