import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Bookmark } from '../../types/content';
import { bookmarkService } from '../../services/bookmarkService';

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
    return await bookmarkService.getBookmarks(userId);
  }
);

export const addBookmark = createAsyncThunk(
  'bookmarks/addBookmark',
  async (bookmark: Omit<Bookmark, 'id'>) => {
    return await bookmarkService.addBookmark(bookmark);
  }
);

export const removeBookmark = createAsyncThunk(
  'bookmarks/removeBookmark',
  async (bookmarkId: string) => {
    return await bookmarkService.removeBookmark(bookmarkId);
  }
);

export const toggleBookmark = createAsyncThunk(
  'bookmarks/toggleBookmark',
  async ({ userId, contentId, type, bookmarkData }: {
    userId: string;
    contentId: string;
    type: 'Paper' | 'Resource';
    bookmarkData: Omit<Bookmark, 'id' | 'userId' | 'contentId' | 'type'>;
  }) => {
    return await bookmarkService.toggleBookmark(userId, contentId, type, bookmarkData);
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
      })
      // Toggle Bookmark
      .addCase(toggleBookmark.fulfilled, (state, action) => {
        if (action.payload) {
          state.bookmarks.push(action.payload);
        } else {
          // If action.payload is null, it means the bookmark was removed
          // The UI will handle this by checking if the bookmark exists
        }
      });
  }
});

export default bookmarkSlice.reducer; 