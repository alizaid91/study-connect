import { SendMessageRequest, SendMessageResponse } from '../types/chat';

const API_BASE_URL = 'http://localhost:3000';

class ChatService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      mode: 'cors',
      credentials: 'omit', // Don't send credentials for CORS
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log('Making request to:', url);
    console.log('Request config:', config);

    try {
      const response = await fetch(url, config);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        
        if (response.status === 0 || response.status === 404) {
          throw new Error('Backend server is not reachable. Please ensure it\'s running on http://localhost:3000');
        }
        
        if (response.status === 405) {
          throw new Error('Backend endpoint /ask does not accept POST requests or does not exist');
        }
        
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
        );
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      
      if (error instanceof TypeError) {
        if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
          throw new Error('Network error: Cannot connect to backend. Check if CORS is enabled on your backend server.');
        }
        if (error.message.includes('Failed to fetch')) {
          throw new Error('CORS error: Backend is not allowing requests from this origin. Configure CORS on your backend.');
        }
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
        throw new Error('Invalid response from server: missing reply field');
      }

      return response.reply;
    } catch (error) {
      console.error('Chat service error:', error);
      throw error; // Re-throw the original error with its specific message
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

  // Test connection method for debugging
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'OPTIONS', // Preflight request
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('OPTIONS response:', response.status, response.headers);
      return { success: true };
    } catch (error) {
      console.error('Connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;