import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import AuthProvider from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import SuperAdminLogin from "./pages/SuperAdmin/Login";
import SuperAdminRegister from "./pages/SuperAdmin/Register";
import SuperAdminDashboard from "./pages/SuperAdmin/Dashboard";
import ForgotPassword from "./pages/SuperAdmin/ForgotPassword";
import ResetPassword from "./pages/SuperAdmin/ResetPassword";
import PatientRegister from "./pages/Patient/Register";
import PatientDashboard from "./pages/Patient/Dashboard";

// Root redirect component
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // 🎯 Chưa đăng nhập → Unified Login (/superadmin/login)
  if (!isAuthenticated) {
    return <Navigate to="/superadmin/login" replace />;
  }

  // ✅ Đã đăng nhập → Redirect theo role
  if (user?.role === "PATIENT") {
    return <Navigate to="/patient/dashboard" replace />;
  }

  // Default: Super Admin
  return <Navigate to="/superadmin/dashboard" replace />;
};

function App() {
  return (
    <ConfigProvider locale={viVN}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* 🎯 TRANG LOGIN CHUNG DUY NHẤT */}
            <Route path="/superadmin/login" element={<SuperAdminLogin />} />

            {/* Super Admin Routes */}
            <Route
              path="/superadmin/register"
              element={<SuperAdminRegister />}
            />
            <Route
              path="/superadmin/forgot-password"
              element={<ForgotPassword />}
            />
            <Route
              path="/superadmin/reset-password"
              element={<ResetPassword />}
            />
            <Route
              path="/superadmin/dashboard"
              element={
                <ProtectedRoute requiredRole="SUPER_ADMIN">
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Patient Routes */}
            <Route path="/patient/register" element={<PatientRegister />} />
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute requiredRole={["PATIENT", "SUPER_ADMIN"]}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />

            {/* Root Redirect */}
            <Route path="/" element={<RootRedirect />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
}

export default App;
