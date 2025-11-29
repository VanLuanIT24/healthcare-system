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
import DoctorDashboard from "./pages/Doctor/Dashboard";
import NurseDashboard from "./pages/Nurse/Dashboard";
import PharmacistDashboard from "./pages/Pharmacist/Dashboard";
import LabTechnicianDashboard from "./pages/LabTechnician/Dashboard";
import { Card, Result, Button } from "antd";

// Root redirect component
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // 🎯 Chưa đăng nhập → Unified Login (/superadmin/login)
  if (!isAuthenticated) {
    return <Navigate to="/superadmin/login" replace />;
  }

  // ✅ Đã đăng nhập → Redirect theo role
  const roleRedirects = {
    PATIENT: "/patient/dashboard",
    DOCTOR: "/doctor/dashboard",
    NURSE: "/nurse/dashboard",
    PHARMACIST: "/pharmacist/dashboard",
    LAB_TECHNICIAN: "/lab-technician/dashboard",
    SUPER_ADMIN: "/superadmin/dashboard",
    HOSPITAL_ADMIN: "/superadmin/dashboard",
    ADMIN: "/superadmin/dashboard",
  };

  const redirectPath = roleRedirects[user?.role];

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  // Default fallback
  return <Navigate to="/superadmin/login" replace />;
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

            {/* Doctor Routes */}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute requiredRole="DOCTOR">
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Nurse Routes */}
            <Route
              path="/nurse/dashboard"
              element={
                <ProtectedRoute requiredRole="NURSE">
                  <NurseDashboard />
                </ProtectedRoute>
              }
            />

            {/* Pharmacist Routes */}
            <Route
              path="/pharmacist/dashboard"
              element={
                <ProtectedRoute requiredRole="PHARMACIST">
                  <PharmacistDashboard />
                </ProtectedRoute>
              }
            />

            {/* Lab Technician Routes */}
            <Route
              path="/lab-technician/dashboard"
              element={
                <ProtectedRoute requiredRole="LAB_TECHNICIAN">
                  <LabTechnicianDashboard />
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
