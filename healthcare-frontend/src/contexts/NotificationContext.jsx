// src/contexts/NotificationContext.jsx
import { notificationAPI } from '@/services/api';
import { notification as antNotification } from 'antd';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch notifications khi user đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    
    try {
      setLoading(true);
      console.log('📢 NotificationContext - Fetching notifications...');
      const response = await notificationAPI.getMyNotifications({ limit: 20 });
      console.log('✅ NotificationContext - Got notifications:', response);
      setNotifications(response?.notifications || []);
      setUnreadCount(response?.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error?.message || error);
      // Silently fail - notifications are optional, don't break the app
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  // Hiển thị thông báo popup
  const showNotification = useCallback((type, title, description, duration = 4.5) => {
    antNotification[type]({
      message: title,
      description,
      duration,
      placement: 'topRight',
    });
  }, []);

  const success = useCallback((title, description) => {
    showNotification('success', title, description);
  }, [showNotification]);

  const error = useCallback((title, description) => {
    showNotification('error', title, description);
  }, [showNotification]);

  const warning = useCallback((title, description) => {
    showNotification('warning', title, description);
  }, [showNotification]);

  const info = useCallback((title, description) => {
    showNotification('info', title, description);
  }, [showNotification]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    showNotification,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
