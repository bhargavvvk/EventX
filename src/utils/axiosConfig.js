import axios from 'axios';
import { isTokenValid, logout } from './auth';

// Create axios instance with proper configuration
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  maxRedirects: 0,
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Always try to attach token if it exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration from backend
    if (error.response && error.response.status === 401) {
      const errorMessage = error.response.data?.message;
      if (errorMessage && (errorMessage.includes('expired') || errorMessage.includes('invalid'))) {
        console.log('Token expired or invalid, logging out...');
        logout();
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running on localhost:5001');
    } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.error('SSL/TLS error - ensure backend is running on HTTP, not HTTPS');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
