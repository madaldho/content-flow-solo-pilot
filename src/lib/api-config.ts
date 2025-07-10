// API Configuration
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3001/api',
    timeout: 10000
  },
  production: {
    baseURL: 'https://kontenflow.vercel.app/api', // Vercel serverless functions
    timeout: 15000
  }
};

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const API_BASE_URL = isDevelopment 
  ? API_CONFIG.development.baseURL 
  : API_CONFIG.production.baseURL;

export const API_TIMEOUT = isDevelopment 
  ? API_CONFIG.development.timeout 
  : API_CONFIG.production.timeout;

export const getApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to make API requests with proper error handling
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw error;
  }
};
