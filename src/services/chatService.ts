import { SendMessageRequest, SendMessageResponse } from '../types/chat';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_CHAT_API_URL || 'http://localhost:3000';

class ChatService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      mode: 'cors',
      credentials: 'omit',
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
          throw new Error(`Backend server is not reachable at ${API_BASE_URL}. Please ensure your chat backend server is running.`);
        }
        
        if (response.status === 405) {
          throw new Error(`Backend endpoint ${endpoint} does not accept ${options.method || 'GET'} requests or does not exist`);
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
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('failed to fetch') || errorMessage.includes('networkerror')) {
          // Check if it's a mixed content issue (HTTPS -> HTTP)
          if (typeof window !== 'undefined' && window.location.protocol === 'https:' && API_BASE_URL.startsWith('http:')) {
            throw new Error(
              `Mixed content error: Cannot make HTTP requests from HTTPS page. ` +
              `Please start your backend server with HTTPS support or run the frontend with HTTP. ` +
              `Backend URL: ${API_BASE_URL}`
            );
          }
          
          throw new Error(
            `Cannot connect to backend server at ${API_BASE_URL}. ` +
            `Please check: 1) Backend server is running, 2) CORS is properly configured, ` +
            `3) No firewall blocking the connection.`
          );
        }
        
        if (errorMessage.includes('cors')) {
          throw new Error(
            `CORS error: Backend server at ${API_BASE_URL} is not allowing requests from ${typeof window !== 'undefined' ? window.location.origin : 'unknown origin'}. ` +
            `Please configure CORS on your backend to allow this origin.`
          );
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
      
      // Provide more helpful error messages to users
      if (error instanceof Error) {
        if (error.message.includes('Mixed content error')) {
          throw new Error(
            'Connection Error: The chat service requires a secure connection. ' +
            'Please contact support or try refreshing the page.'
          );
        }
        
        if (error.message.includes('Cannot connect to backend')) {
          throw new Error(
            'Chat service is currently unavailable. Please try again later or contact support.'
          );
        }
        
        if (error.message.includes('CORS error')) {
          throw new Error(
            'Chat service configuration error. Please contact support.'
          );
        }
      }
      
      throw error;
    }
  }

  // Health check method with better error handling
  async checkHealth(): Promise<{ healthy: boolean; error?: string }> {
    try {
      await this.makeRequest('/health');
      return { healthy: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { healthy: false, error: errorMessage };
    }
  }

  // Test connection method for debugging
  async testConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
    try {
      console.log('Testing connection to:', API_BASE_URL);
      
      // First try a simple GET request to see if server responds
      const testResponse = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
      });
      
      console.log('Health check response:', testResponse.status);
      
      // Then test OPTIONS for CORS preflight
      const optionsResponse = await fetch(`${API_BASE_URL}/ask`, {
        method: 'OPTIONS',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      });
      
      console.log('OPTIONS response:', optionsResponse.status, optionsResponse.headers);
      
      return { 
        success: true, 
        details: {
          healthStatus: testResponse.status,
          corsStatus: optionsResponse.status,
          apiUrl: API_BASE_URL
        }
      };
    } catch (error) {
      console.error('Connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          apiUrl: API_BASE_URL,
          protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown',
          origin: typeof window !== 'undefined' ? window.location.origin : 'unknown'
        }
      };
    }
  }

  // Get current API URL for debugging
  getApiUrl(): string {
    return API_BASE_URL;
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;