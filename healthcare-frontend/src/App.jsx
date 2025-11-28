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
import ReceptionistDashboard from "./pages/Receptionist/Dashboard";
import BillingStaffDashboard from "./pages/BillingStaff/Dashboard";
import HospitalAdminDashboard from "./pages/HospitalAdmin/Dashboard";

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

  if (user?.role === "DOCTOR") {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  if (user?.role === "NURSE") {
    return <Navigate to="/nurse/dashboard" replace />;
  }

  if (user?.role === "PHARMACIST") {
    return <Navigate to="/pharmacist/dashboard" replace />;
  }

  if (user?.role === "LAB_TECHNICIAN") {
    return <Navigate to="/lab-technician/dashboard" replace />;
  }

  if (user?.role === "RECEPTIONIST") {
    return <Navigate to="/receptionist/dashboard" replace />;
  }

  if (user?.role === "BILLING_STAFF") {
    return <Navigate to="/billing-staff/dashboard" replace />;
  }

  if (user?.role === "HOSPITAL_ADMIN") {
    return <Navigate to="/hospital-admin/dashboard" replace />;
  }

  // 👨‍💼 Admin / SuperAdmin / Other roles
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
                <ProtectedRoute requiredRole={["PATIENT", "DOCTOR"]}>
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

            {/* Receptionist Routes */}
            <Route
              path="/receptionist/dashboard"
              element={
                <ProtectedRoute requiredRole="RECEPTIONIST">
                  <ReceptionistDashboard />
                </ProtectedRoute>
              }
            />

            {/* Billing Staff Routes */}
            <Route
              path="/billing-staff/dashboard"
              element={
                <ProtectedRoute requiredRole="BILLING_STAFF">
                  <BillingStaffDashboard />
                </ProtectedRoute>
              }
            />

            {/* Hospital Admin Routes */}
            <Route
              path="/hospital-admin/dashboard"
              element={
                <ProtectedRoute requiredRole="HOSPITAL_ADMIN">
                  <HospitalAdminDashboard />
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
