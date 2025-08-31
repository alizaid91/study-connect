import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "firebase/auth";
import { UserProfile } from "../../types/user";

interface AuthState {
  user: {
    uid: string;
  } | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// Load initial state from localStorage
const loadInitialState = (): AuthState => {
  const savedState = localStorage.getItem("authState");
  if (savedState) {
    return {
      user: JSON.parse(savedState),
      profile: null,
      loading: false,
      error: null,
    };
  }
  return {
    user: null,
    profile: null,
    loading: false,
    error: null,
  };
};

const initialState: AuthState = loadInitialState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      if (action.payload) {
        state.user = {
          uid: action.payload.uid,
        };
      } else {
        state.user = null;
      }
      // Save to localStorage
      localStorage.setItem("authState", JSON.stringify(state.user));
    },
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      localStorage.setItem("authState", JSON.stringify(state));
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
      state.profile = null;
      localStorage.removeItem("authState");
      localStorage.removeItem("activeSessionId");
      localStorage.removeItem("selectedBoardId");
    },
  },
});

export const { setUser, setProfile, setLoading, setError, logout } =
  authSlice.actions;
export default authSlice.reducer;
