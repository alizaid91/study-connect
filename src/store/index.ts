import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import taskReducer from "./slices/taskSlice";
import resourceReducer from "./slices/resourceSlice";
import bookmarkReducer from "./slices/bookmarkSlice";
import papersReducer from "./slices/papersSlice";
import chatReducer from "./slices/chatSlice";
import globalPopupsReduces from "./slices/globalPopups";
import FilterReducer from "./slices/filtersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    resources: resourceReducer,
    bookmarks: bookmarkReducer,
    papers: papersReducer,
    chat: chatReducer,
    globalPopups: globalPopupsReduces,
    filters: FilterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
