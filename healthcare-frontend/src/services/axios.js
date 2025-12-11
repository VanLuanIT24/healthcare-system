// 🌐 Axios Configuration - ĐÃ FIX
import { message } from 'antd';
import axios from 'axios';

// ✅ FIX: URL đúng cho cả dev và production
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ QUAN TRỌNG: Để gửi cookies nếu cần
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - FIXED REFRESH TOKEN LOGIC
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Handle 401 Unauthorized
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // ✅ Gọi đúng endpoint refresh token
          const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
            refreshToken,
          });

          if (response.data?.success) {
            const { accessToken } = response.data.data;
            
            // Lưu token mới
            localStorage.setItem('accessToken', accessToken);
            
            // Cập nhật header và retry request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        // Clear all auth data
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'Đã xảy ra lỗi';
    
    // Don't show error message for silent requests
    if (!originalRequest.silent && errorMessage) {
      message.error(errorMessage);
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default axiosInstance;