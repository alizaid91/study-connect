import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';
import resourceReducer from './slices/resourceSlice';
import adminReducer from './slices/adminSlice';
import bookmarkReducer from './slices/bookmarkSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    resources: resourceReducer,
    admin: adminReducer,
    bookmarks: bookmarkReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 