import { SendMessageRequest, SendMessageResponse } from '../types/chat';

const API_BASE_URL = 'http://localhost:3000';

class ChatService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
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
        throw new Error('Unable to connect to the server. Please check if the backend is running.');
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
    
    const response = await this.makeRequest<SendMessageResponse>('/ask', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });

    if (!response.reply) {
      throw new Error('Invalid response from server');
    }

    return response.reply;
  }

  // Health check method for future use
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