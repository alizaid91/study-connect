export interface Message {
  id: string;
  content: string;
  type: 'user' | 'bot' | 'system';
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  reply: string;
}