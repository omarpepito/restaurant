import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/dev';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';

    // Log error for debugging (PII is masked by backend)
    console.error('[API Error]', message);

    if (error.response?.status === 400 && message.includes('Payload too large')) {
      alert('Request failed: The data size is too large (limit 16KB).');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
