// 🌐 Axios Configuration - ĐÃ FIX
import { message } from 'antd';
import axios from 'axios';

// ✅ FIX: Đảm bảo URL luôn có /api suffix
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return 'http://localhost:5000/api';
  
  // Nếu URL đã có /api thì giữ nguyên, nếu không thì thêm vào
  return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

const API_URL = getApiUrl();

// ✅ Environment check for logging
const isDev = import.meta.env.DEV;

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

    // Only log in development mode
    if (isDev) {
      console.log('📤 Axios Request:', {
        method: config.method,
        url: config.url,
        hasToken: !!token,
      });
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't override Content-Type if it's FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    } else {
      // Let axios handle FormData Content-Type
      delete config.headers['Content-Type'];
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
    // Only log in development mode
    if (isDev) {
      console.log('🔄 axios - Response:', response.status, response.data?.success);
    }

    // ✅ QUAN TRỌNG: Luôn trả về toàn bộ response object (không bóc tách data)
    // Để frontend có thể kiểm tra response.status, response.data.success, etc.
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isLogoutRequest = originalRequest?.url?.includes('/auth/logout');

    // Handle 401 Unauthorized
    if (status === 401 && !originalRequest._retry && !isLogoutRequest) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // ✅ Gọi đúng endpoint refresh token
          const response = await axiosInstance.post('/api/auth/refresh-token', {
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

    // Don't show error message for logout requests or if silent flag is set
    if (!originalRequest.silent && !isLogoutRequest && errorMessage) {
      message.error(errorMessage);
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default axiosInstance;