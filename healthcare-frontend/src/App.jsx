import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import AuthProvider from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminLogin from './pages/SuperAdmin/Login';
import SuperAdminRegister from './pages/SuperAdmin/Register';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import ForgotPassword from './pages/SuperAdmin/ForgotPassword';
import ResetPassword from './pages/SuperAdmin/ResetPassword';

function App() {
  return (
    <ConfigProvider locale={viVN}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Super Admin Routes */}
            <Route path="/superadmin/login" element={<SuperAdminLogin />} />
            <Route path="/superadmin/register" element={<SuperAdminRegister />} />
            <Route path="/superadmin/forgot-password" element={<ForgotPassword />} />
            <Route path="/superadmin/reset-password" element={<ResetPassword />} />
            <Route
              path="/superadmin/dashboard"
              element={
                <ProtectedRoute requiredRole="SUPER_ADMIN">
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Redirect */}
            <Route path="/" element={<Navigate to="/superadmin/login" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
}

export default App;
