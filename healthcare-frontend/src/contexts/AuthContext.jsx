// src/contexts/AuthContext.jsx
import { authAPI } from '@/services/api';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Environment check for logging
const isDev = import.meta.env?.DEV ?? (process.env.NODE_ENV === 'development');

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kiểm tra token khi khởi động
  useEffect(() => {
    checkAuth();

    // Cũng listen cho storage change (khi login/logout xảy ra từ LoginPage)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (isDev) console.log('🔍 AuthContext checkAuth - Token exists:', !!token);

      if (token) {
        // Thử gọi API để lấy user data
        try {
          if (isDev) console.log('📡 AuthContext checkAuth - Calling getProfile...');
          const response = await authAPI.getProfile();

          // axios trả về response object { status, data: { success, message, data: { user }, ... } }
          let userObj = null;

          if (response?.data?.data?.user) {
            userObj = response.data.data.user;
          } else if (response?.data?.user) {
            userObj = response.data.user;
          } else if (response?.user) {
            userObj = response.user;
          } else if (response?.data && !response.status) {
            userObj = response.data;
          }

          if (isDev) console.log('📌 AuthContext checkAuth - User role:', userObj?.role);

          if (userObj) {
            setUser(userObj);
            setIsAuthenticated(true);
          } else {
            if (isDev) console.error('❌ AuthContext checkAuth - Cannot extract user from response');
            throw new Error('Cannot extract user from response');
          }
        } catch (error) {
          // Nếu API thất bại, NÊN LOGOUT thay vì sử dụng fallback
          if (isDev) console.warn('⚠️ AuthContext checkAuth - getProfile failed:', error.message);

          // IMPORTANT: Don't use fallback - token might be invalid
          // Clear auth state and require re-login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      if (isDev) console.error('❌ AuthContext checkAuth - Unexpected error:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);

      if (response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      }
      return { success: false, message: 'Không nhận được token' };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại';
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      // Backend returns: { success: true, data: { user: updatedUser } }
      const updatedUser = response?.data?.data?.user;
      if (updatedUser) {
        setUser(updatedUser);
        return { success: true };
      } else {
        return { success: false, message: 'No user data returned' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Cập nhật thất bại';
      return { success: false, message: errorMessage };
    }
  }, []);

  // ✨ Hàm mới: Set user từ login response (gọi từ LoginPage)
  const setUserFromLoginResponse = useCallback((userObj) => {
    if (userObj) {
      if (isDev) console.log('✅ AuthContext setUserFromLoginResponse - User role:', userObj.role);
      setUser(userObj);
      setIsAuthenticated(true);
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
    setUserFromLoginResponse,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
