// API client for server-side and client-side requests
export const apiClient = {
  baseUrl: typeof window === 'undefined' 
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    : '',

  async get(endpoint: string, options?: RequestInit) {
    const url = typeof window === 'undefined' 
      ? `${this.baseUrl}${endpoint}`
      : endpoint;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  },

  async post(endpoint: string, data?: any, options?: RequestInit) {
    const url = typeof window === 'undefined' 
      ? `${this.baseUrl}${endpoint}`
      : endpoint;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }
};