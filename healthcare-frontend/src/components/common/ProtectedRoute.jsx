// src/components/common/ProtectedRoute.jsx
import { useAuth } from '@/contexts/AuthContext';
import { Spin } from 'antd';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Chờ khi AuthContext đang kiểm tra authentication
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0) {
    // Normalize role to lowercase for comparison
    const userRole = (user?.role || 'guest').toLowerCase();
    const normalizedRequiredRoles = requiredRoles.map(r => r.toLowerCase());
    
    console.log('🔐 ProtectedRoute - Checking access:', {
      userRole,
      userObject: user,
      requiredRoles: normalizedRequiredRoles,
      hasAccess: normalizedRequiredRoles.includes(userRole)
    });
    
    if (!normalizedRequiredRoles.includes(userRole)) {
      console.warn(`❌ ProtectedRoute - User role '${userRole}' not in required roles:`, normalizedRequiredRoles);
      return <Navigate to="/403" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
