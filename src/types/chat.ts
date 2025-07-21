// Chat message sender type
type ChatSender = 'user' | 'ai';

// Represents a single chat message
export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: ChatSender;
  content: string;
  timestamp: string;
}

// Represents a chat session
export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

// Redux state for chat
export interface ChatState {
  sessions: Record<string, ChatSession>;
  messages: Record<string, ChatMessage[]>;
  activeSessionId: string | null;
  loading: boolean;
  loadingAi: boolean;
  loadingMessages: boolean;
  error: string | null;
} 