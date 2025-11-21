import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { apiClient } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await apiClient.post('/auth/login', { email, password });

      console.log('Login response:', response.data);

      if (response.data.success) {
        const { user: userData, tokens } = response.data.data;
        const { accessToken, refreshToken } = tokens;

        // Check if userData is Mongoose document and extract _doc
        const plainUserData = userData._doc || userData;

        console.log('Plain user data:', plainUserData);
        console.log('Tokens:', tokens);

        // Store tokens and user
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(plainUserData));

        setUser(plainUserData);
        return plainUserData;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const response = await apiClient.post('/auth/register', userData);

      if (response.data.success) {
        return response.data.data;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Đăng ký thất bại';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear storage regardless of API call success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const response = await apiClient.post('/auth/refresh-token', { refreshToken });

      if (response.data.success) {
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        return accessToken;
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
      logout();
      throw err;
    }
  }, [logout]);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshAccessToken,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'SUPER_ADMIN'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthProvider;
