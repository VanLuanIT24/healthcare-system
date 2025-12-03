import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthProvider, { useAuth } from "./contexts/AuthContext";
import { getDashboardRoute } from "./utils/roleUtils";

// Import pages
import ForgotPassword from "./pages/auth/ForgotPassword";
import UnifiedLogin from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AboutPage from "./pages/landing/AboutPage";
import AccountPage from "./pages/landing/AccountPage";
import CareersPage from "./pages/landing/CareersPage";
import ConsultationPage from "./pages/landing/ConsultationPage";
import ContactPage from "./pages/landing/ContactPage";
import DoctorsPage from "./pages/landing/DoctorsPage";
import FAQPage from "./pages/landing/FAQPage";
import HomePage from "./pages/landing/HomePage";
import NewsPage from "./pages/landing/NewsPage";
import PaymentPolicyPage from "./pages/landing/PaymentPolicyPage";
import PrivacyPolicyPage from "./pages/landing/PrivacyPolicyPage";
import ServicesPage from "./pages/landing/ServicesPage";
import TermsOfServicePage from "./pages/landing/TermsOfServicePage";
import UserGuidePage from "./pages/landing/UserGuidePage";

// Import dashboards
import AdminDashboard from "./pages/admin-portal/Dashboard";
import MedicalStaffDashboard from "./pages/medical-staff/Dashboard";
import PatientDashboard from "./pages/patient-portal/Dashboard";

// Import layouts

// Import styles
import "./styles/Auth.css";
import "./styles/index.css";

// Root redirect component
const RootRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const dashboardRoute = getDashboardRoute(user?.role);
  return <Navigate to={dashboardRoute} replace />;
};

function App() {
  return (
    <ConfigProvider locale={viVN}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/consultation" element={<ConsultationPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/user-guide" element={<UserGuidePage />} />
            <Route path="/payment-policy" element={<PaymentPolicyPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/login" element={<UnifiedLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Account Page - Available for all authenticated users */}
            <Route path="/account" element={<AccountPage />} />

            {/* Protected Dashboard Routes */}
            {/* NHÓM 1: Bệnh nhân & Người dùng */}
            <Route
              path="/patient/*"
              element={
                <ProtectedRoute requiredRole={['PATIENT', 'GUEST']}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* NHÓM 2: Nhân viên y tế */}
            <Route
              path="/medical/*"
              element={
                <ProtectedRoute requiredRole={['DOCTOR', 'NURSE', 'PHARMACIST', 'LAB_TECHNICIAN']}>
                  <MedicalStaffDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* NHÓM 3: Quản trị & Hành chính */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPARTMENT_HEAD', 'RECEPTIONIST', 'BILLING_STAFF']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Redirects */}
            <Route path="/dashboard" element={<RootRedirect />} />
            <Route path="/superadmin/*" element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
}

export default App;