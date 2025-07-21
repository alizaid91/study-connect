import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { ChatState, ChatSession, ChatMessage } from "../../types/chat";
import { chatService } from "../../services/chatService";

const initialState: ChatState = {
  sessions: {},
  messages: {},
  activeSessionId: localStorage.getItem("activeSessionId") || null,
  loading: true,
  loadingAi: false,
  loadingMessages: true,
  error: null,
};

// Thunks
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (
    {
      userId,
      sessionId,
      content,
    }: { userId: string; sessionId: string; content: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      dispatch(chatSlice.actions.setLoadingAi(true));
      dispatch(chatSlice.actions.setSessionError({ sessionId, error: "" }));
      dispatch(chatSlice.actions.setError(null));
      return await chatService.sendMessage(userId, sessionId, content);
    } catch (error: any) {
      console.log("regiecting with error: ", error);
      dispatch(chatSlice.actions.setLoadingAi(false));
      return rejectWithValue(sessionId);
    } finally {
      dispatch(chatSlice.actions.setLoadingAi(false));
    }
  }
);

export const listenToSessions = createAsyncThunk(
  "chat/listenToSessions",
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(chatSlice.actions.setLoading(true));
      chatService.listenToSessions(userId, (sessions) => {
        dispatch(chatSlice.actions.setSessions(sessions));
        if (sessions.length > 0) {
          dispatch(
            chatSlice.actions.setActiveSession(
              localStorage.getItem("activeSessionId") || sessions[0].id
            )
          );
        } else {
          dispatch(chatSlice.actions.setActiveSession(null));
        }
        dispatch(chatSlice.actions.setLoading(false));
      });
    } catch (error: any) {
      dispatch(chatSlice.actions.setLoading(false));
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (sessionId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(chatSlice.actions.setLoadingMessages(true));
      const messages = await chatService.fetchMessages(sessionId);
      dispatch(chatSlice.actions.setMessages({ sessionId, messages }));
      dispatch(chatSlice.actions.setLoadingMessages(false));
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSessions(state, action: PayloadAction<ChatSession[]>) {
      state.sessions = Object.fromEntries(action.payload.map((s) => [s.id, s]));
    },
    setMessages(
      state,
      action: PayloadAction<{ sessionId: string; messages: ChatMessage[] }>
    ) {
      state.messages[action.payload.sessionId] = action.payload.messages;
    },
    addMessage(
      state,
      action: PayloadAction<{ sessionId: string; message: ChatMessage }>
    ) {
      state.messages[action.payload.sessionId].push(action.payload.message);
    },
    updateMessageContent: (
      state,
      action: PayloadAction<{ sessionId: string; id: string; chunk: string }>
    ) => {
      const msg = state.messages[action.payload.sessionId].find(
        (m) => m.id === action.payload.id
      );
      if (msg) {
        msg.content += action.payload.chunk;
      }
    },
    setActiveSession(state, action: PayloadAction<string | null>) {
      state.activeSessionId = action.payload;
      localStorage.setItem("activeSessionId", action.payload || "");
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setLoadingAi(state, action: PayloadAction<boolean>) {
      state.loadingAi = action.payload;
    },
    setLoadingMessages(state, action: PayloadAction<boolean>) {
      state.loadingMessages = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setSessionError(
      state,
      action: PayloadAction<{ sessionId: string; error: string }>
    ) {
      const { sessionId, error } = action.payload;
      if (state.sessions[sessionId]) {
        state.sessions[sessionId].error = error;
      }
    },
    resetChatState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loadingAi = true;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.loadingAi = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.messages[action.payload as string] = state.messages[
          action.payload as string
        ].slice(0, -2);
        state.loadingAi = false;
        state.sessions[action.payload as string].error =
          "Something went wrong while generating AI response. Please try again!";
      });
  },
});

export const {
  setSessions,
  setMessages,
  updateMessageContent,
  setActiveSession,
  addMessage,
  setLoading,
  setLoadingAi,
  setLoadingMessages,
  setError,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;
