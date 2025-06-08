import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatState, Message } from '../../types/chat';
import { chatService } from '../../services/chatService';
import { v4 as uuidv4 } from 'uuid';

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
};

// Async thunk for sending messages
export const sendMessageAsync = createAsyncThunk(
  'chat/sendMessage',
  async (messageContent: string, { rejectWithValue }) => {
    try {
      const reply = await chatService.sendMessageToBot(messageContent);
      return { userMessage: messageContent, botReply: reply };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return rejectWithValue(errorMessage);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Omit<Message, 'id' | 'timestamp'>>) => {
      const message: Message = {
        id: uuidv4(),
        timestamp: Date.now(),
        ...action.payload,
      };
      state.messages.push(message);
      state.error = null;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    resetChat: (state) => {
      state.messages = [];
      state.isLoading = false;
      state.error = null;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(sendMessageAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessageAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Add user message
        const userMessage: Message = {
          id: uuidv4(),
          content: action.payload.userMessage,
          type: 'user',
          timestamp: Date.now(),
        };
        state.messages.push(userMessage);
        
        // Add bot reply
        const botMessage: Message = {
          id: uuidv4(),
          content: action.payload.botReply,
          type: 'bot',
          timestamp: Date.now() + 1, // Ensure bot message comes after user message
        };
        state.messages.push(botMessage);
      })
      .addCase(sendMessageAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        
        // Add error message to chat
        const errorMessage: Message = {
          id: uuidv4(),
          content: `Error: ${action.payload}`,
          type: 'system',
          timestamp: Date.now(),
        };
        state.messages.push(errorMessage);
      });
  },
});

export const {
  addMessage,
  setLoading,
  setError,
  resetChat,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;