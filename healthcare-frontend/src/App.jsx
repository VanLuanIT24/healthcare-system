import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import SuperAdminLogin from './pages/SuperAdmin/Login';
import SuperAdminRegister from './pages/SuperAdmin/Register';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import ForgotPassword from './pages/SuperAdmin/ForgotPassword';
import ResetPassword from './pages/SuperAdmin/ResetPassword';

// Ant Design Theme Configuration
const theme = {
  token: {
    colorPrimary: '#0099cc',           // Xanh nước biển chính - đậm hơn
    colorSuccess: '#10b981',           // Xanh lá
    colorWarning: '#f59e0b',           // Vàng
    colorError: '#ef4444',             // Đỏ
    colorInfo: '#0077aa',              // Xanh cyan đậm
    colorTextBase: '#0f172a',          // Màu chữ xanh đậm
    borderRadius: 8,                   // Góc bo tròn
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto'`,
  },
  components: {
    Button: {
      colorPrimary: '#0099cc',
      controlHeight: 40,
      borderRadius: 8,
    },
    Card: {
      borderRadiusLG: 12,
      boxShadow: '0 2px 8px rgba(0, 153, 204, 0.08)',
    },
    Input: {
      controlHeight: 40,
      borderRadius: 8,
      colorBorder: '#e0f2fe',
    },
    Select: {
      controlHeight: 40,
      borderRadius: 8,
    },
    Table: {
      colorPrimaryBg: '#f8fdfb',
      colorPrimaryBorder: '#e0f2fe',
    },
    Layout: {
      colorBgHeader: '#ffffff',
      colorBgBody: '#f8fdfb',
    },
  },
};

function App() {
  return (
    <ConfigProvider locale={viVN} theme={theme}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Home Page */}
            <Route path="/" element={<HomePage />} />

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

            {/* Patient Routes */}
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute requiredRole="PATIENT">
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />

            {/* Doctor Routes */}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute requiredRole="DOCTOR">
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
}

export default App;
