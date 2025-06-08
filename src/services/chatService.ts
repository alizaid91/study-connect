import { SendMessageRequest, SendMessageResponse } from '../types/chat';

const API_BASE_URL = 'http://localhost:3000';

class ChatService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      mode: 'cors', // Enable CORS
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to the server. Please check if the backend is running on http://localhost:3000');
      }
      throw error;
    }
  }

  async sendMessageToBot(message: string): Promise<string> {
    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }

    if (message.length > 1000) {
      throw new Error('Message is too long. Please keep it under 1000 characters.');
    }

    const requestData: SendMessageRequest = { message: message.trim() };
    
    try {
      const response = await this.makeRequest<SendMessageResponse>('/ask', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      if (!response.reply) {
        throw new Error('Invalid response from server');
      }

      return response.reply;
    } catch (error) {
      // Re-throw with more specific error message
      if (error instanceof Error) {
        throw new Error(`Chat service error: ${error.message}`);
      }
      throw new Error('An unexpected error occurred while communicating with the chat service');
    }
  }

  // Health check method
  async checkHealth(): Promise<boolean> {
    try {
      await this.makeRequest('/health');
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;