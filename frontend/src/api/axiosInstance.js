// frontend/src/api/axiosInstance.js
import axios from 'axios';

// Get API base URL from environment variable
// In a real app, you'd configure this in .env.development, .env.production etc.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://34.172.240.198:8000/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the JWT token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // Assuming token is stored in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration or 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If 401 and not already retrying, and not the login/register endpoint itself
    if (error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/')) {
      originalRequest._retry = true;
      // Here you would typically try to refresh the token
      // For this scaffold, we'll just redirect to login
      console.error("Token expired or invalid. Redirecting to login...");
      localStorage.removeItem('accessToken');
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;