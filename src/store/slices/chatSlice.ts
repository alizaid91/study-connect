import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ChatState, ChatSession, ChatMessage } from '../../types/chat';
import { chatService } from '../../services/chatService';

const initialState: ChatState = {
  sessions: {},
  messages: {},
  activeSessionId: localStorage.getItem('activeSessionId') || null,
  loading: true,
  loadingAi: false,
  loadingMessages: true,
  error: null,
};

// Thunks
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    { userId, sessionId, content }: { userId: string, sessionId: string; content: string },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      const state = getState() as { chat: ChatState };
      if (state.chat.error) {
        const messages = state.chat.messages[sessionId] || [];

        const trimmedMessages =
          messages.length >= 2
            ? messages.slice(0, messages.length - 2)
            : [];

        dispatch(chatSlice.actions.setMessages({
          sessionId,
          messages: trimmedMessages
        }));
      }
      dispatch(chatSlice.actions.setLoadingAi(true));
      dispatch(chatSlice.actions.setError(null));
      return await chatService.sendMessage(userId, sessionId, content);
    } catch (error: any) {
      console.log('regiecting with error: ', error)
      dispatch(chatSlice.actions.setLoadingAi(false));
      return rejectWithValue('Something went wrong while generating AI response. Please try again!');
    } finally {
      dispatch(chatSlice.actions.setLoadingAi(false));
    }
  }
);

export const listenToSessions = createAsyncThunk(
  'chat/listenToSessions',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(chatSlice.actions.setLoading(true));
      chatService.listenToSessions(userId, (sessions) => {
        dispatch(chatSlice.actions.setSessions(sessions));
        if (sessions.length > 0) {
          dispatch(chatSlice.actions.setActiveSession(localStorage.getItem('activeSessionId') || sessions[0].id));
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

export const listenToMessages = createAsyncThunk(
  'chat/listenToMessages',
  async (sessionId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(chatSlice.actions.setLoadingMessages(true));
      chatService.listenToMessages(sessionId, (messages) => {
        dispatch(chatSlice.actions.setMessages({ sessionId, messages }));
        dispatch(chatSlice.actions.setLoadingMessages(false));
      });
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSessions(state, action: PayloadAction<ChatSession[]>) {
      state.sessions = Object.fromEntries(action.payload.map(s => [s.id, s]));
    },
    setMessages(state, action: PayloadAction<{ sessionId: string; messages: ChatMessage[] }>) {
      state.messages[action.payload.sessionId] = action.payload.messages;
    },
    addMessage(state, action: PayloadAction<{ sessionId: string; message: ChatMessage }>) {
      state.messages[action.payload.sessionId].push(action.payload.message);
    },
    setStreamedResponse(state, action: PayloadAction<{ sessionId: string; chunk: string }>) {
      const messages = state.messages[action.payload.sessionId];
      messages[messages.length - 1].content += action.payload.chunk;
    },
    updateMessage(state, action: PayloadAction<{ sessionId: string; content: string }>) {
      const { sessionId, content } = action.payload;
      const message = state.messages[sessionId][state.messages[sessionId].length - 1];
      if (message) {
        message.id = 'error';
        message.content = content;
      }
    },
    setActiveSession(state, action: PayloadAction<string | null>) {
      state.activeSessionId = action.payload;
      localStorage.setItem('activeSessionId', action.payload || '');
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
        state.loadingAi = false;
        state.error = action.payload as string;
      })
  },
});

export const {
  setSessions,
  setMessages,
  setStreamedResponse,
  setActiveSession,
  addMessage,
  setLoading,
  setLoadingAi,
  setLoadingMessages,
  setError,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer; 