// 🔐 Authentication Context
import { message } from 'antd';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import authAPI from '../services/api/authAPI';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');
        
        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        // Backend returns: { user, tokens: { accessToken, refreshToken }, sessionId }
        const { user, tokens, sessionId } = response.data;
        
        // Store user and tokens
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        if (sessionId) {
          localStorage.setItem('sessionId', sessionId);
        }
        
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, user };
      }
      
      throw new Error(response.message || 'Đăng nhập thất bại');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await authAPI.logout(refreshToken);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear storage
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      setUser(null);
      setIsAuthenticated(false);
      
      message.info('Đã đăng xuất');
    }
  }, []);

  // Update user profile
  const updateUserProfile = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    if (!user || !user.role) return false;
    return user.role === role;
  }, [user]);

  // Check if user has any of the roles
  const hasAnyRole = useCallback((roles) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  }, [user]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }, [user]);

  // Get dashboard route based on role
  const getDashboardRoute = useCallback(() => {
    if (!user || !user.role) return '/login';
    
    const roleRoutes = {
      'SUPER_ADMIN': '/dashboard/super-admin',
      'HOSPITAL_ADMIN': '/dashboard/hospital-admin',
      'DEPARTMENT_HEAD': '/dashboard/hospital-admin',
      'DOCTOR': '/dashboard/doctor',
      'NURSE': '/dashboard/nurse',
      'PHARMACIST': '/dashboard/pharmacist',
      'LAB_TECHNICIAN': '/dashboard/lab-technician',
      'RECEPTIONIST': '/dashboard/receptionist',
      'BILLING_STAFF': '/dashboard/billing',
      'PATIENT': '/dashboard/patient',
    };
    
    return roleRoutes[user.role] || '/dashboard/patient';
  }, [user]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUserProfile,
    hasRole,
    hasAnyRole,
    hasPermission,
    getDashboardRoute,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
