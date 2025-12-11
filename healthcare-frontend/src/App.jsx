// 🏥 Healthcare System - Root Application Component
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

// Layouts
import ProtectedLayout from './layouts/ProtectedLayout';
import PublicLayout from './layouts/PublicLayout';

// Public Pages
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import LoginPage from './pages/auth/LoginPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Thêm import các page mới
const EmailVerificationPage = React.lazy(() => import('./pages/auth/EmailVerificationPage'));
const ResendVerificationPage = React.lazy(() => import('./pages/auth/ResendVerificationPage'));

// Public Pages - Landing & Info
const LandingPage = React.lazy(() => import('./pages/public/LandingPage'));
const AboutPage = React.lazy(() => import('./pages/public/AboutPage'));
const ServicesPage = React.lazy(() => import('./pages/public/ServicesPage'));
const ContactPage = React.lazy(() => import('./pages/public/ContactPage'));

// Protected Pages - Lazy Loading
const SuperAdminDashboard = React.lazy(() => import('./pages/dashboards/SuperAdminDashboard'));
const HospitalAdminDashboard = React.lazy(() => import('./pages/dashboards/HospitalAdminDashboard'));
const DoctorDashboard = React.lazy(() => import('./pages/dashboards/DoctorDashboard'));
const NurseDashboard = React.lazy(() => import('./pages/dashboards/NurseDashboard'));
const PatientDashboard = React.lazy(() => import('./pages/dashboards/PatientDashboard'));
const ReceptionistDashboard = React.lazy(() => import('./pages/dashboards/ReceptionistDashboard'));
const BillingDashboard = React.lazy(() => import('./pages/dashboards/BillingStaffDashboard'));
const PharmacistDashboard = React.lazy(() => import('./pages/dashboards/PharmacistDashboard'));
const LabTechnicianDashboard = React.lazy(() => import('./pages/dashboards/LabTechnicianDashboard'));

// User Management
const UserList = React.lazy(() => import('./pages/users/UserList'));
const UserCreate = React.lazy(() => import('./pages/users/UserCreate'));
const UserDetail = React.lazy(() => import('./pages/users/UserDetail'));
const UserEdit = React.lazy(() => import('./pages/users/UserEdit'));
const RoleManagement = React.lazy(() => import('./pages/users/RoleManagement'));

// Patient Management
const PatientList = React.lazy(() => import('./pages/patients/PatientList'));
const PatientRegister = React.lazy(() => import('./pages/patients/PatientRegister'));
const PatientProfile = React.lazy(() => import('./pages/patients/PatientProfile'));
const PatientEdit = React.lazy(() => import('./pages/patients/PatientEdit'));

// Appointment Management
const AppointmentList = React.lazy(() => import('./pages/appointments/AppointmentList'));
const AppointmentSchedule = React.lazy(() => import('./pages/appointments/AppointmentSchedule'));
const AppointmentDetail = React.lazy(() => import('./pages/appointments/AppointmentDetail'));
const AppointmentCalendar = React.lazy(() => import('./pages/appointments/AppointmentCalendar'));
const OnlineBookingPage = React.lazy(() => import('./pages/appointments/OnlineBookingPage'));
const DoctorSelectionPage = React.lazy(() => import('./pages/appointments/DoctorSelectionPage'));
const TimeSlotSelectionPage = React.lazy(() => import('./pages/appointments/TimeSlotSelectionPage'));
const TelemedicineRoom = React.lazy(() => import('./pages/appointments/TelemedicineRoom'));

// Clinical Module
const ConsultationRoom = React.lazy(() => import('./pages/clinical/ConsultationRoom'));
const MedicalRecordList = React.lazy(() => import('./pages/clinical/MedicalRecordList'));
const MedicalRecordDetail = React.lazy(() => import('./pages/clinical/MedicalRecordDetail'));
const MedicalRecordCreate = React.lazy(() => import('./pages/clinical/MedicalRecordCreate'));

// Prescription Management
const PrescriptionList = React.lazy(() => import('./pages/prescriptions/PrescriptionList'));
const PrescriptionCreate = React.lazy(() => import('./pages/prescriptions/PrescriptionCreate'));
const PrescriptionDetail = React.lazy(() => import('./pages/prescriptions/PrescriptionDetail'));

// Laboratory Module
const LabOrderList = React.lazy(() => import('./pages/laboratory/LabOrderList'));
const LabOrderCreate = React.lazy(() => import('./pages/laboratory/LabOrderCreate'));
const LabResultEntry = React.lazy(() => import('./pages/laboratory/LabResultEntry'));
const LabResultView = React.lazy(() => import('./pages/laboratory/LabResultView'));

// Billing Module
const BillingList = React.lazy(() => import('./pages/billing/BillingList'));
const BillingCreate = React.lazy(() => import('./pages/billing/BillingCreate'));
const BillingDetail = React.lazy(() => import('./pages/billing/BillingDetail'));
const PaymentProcess = React.lazy(() => import('./pages/billing/PaymentProcess'));

// Pharmacy Module
const MedicationList = React.lazy(() => import('./pages/pharmacy/MedicationList'));
const MedicationCreate = React.lazy(() => import('./pages/pharmacy/MedicationCreate'));
const MedicationDetail = React.lazy(() => import('./pages/pharmacy/MedicationDetail'));
const MedicationInventory = React.lazy(() => import('./pages/pharmacy/MedicationInventory'));
const DispenseInterface = React.lazy(() => import('./pages/pharmacy/DispenseInterface'));

// Reports & Analytics
const ClinicalReports = React.lazy(() => import('./pages/reports/ClinicalReports'));
const FinancialReports = React.lazy(() => import('./pages/reports/FinancialReports'));
const PharmacyReports = React.lazy(() => import('./pages/reports/PharmacyReports'));
const HRReports = React.lazy(() => import('./pages/reports/HRReports'));
const CustomReports = React.lazy(() => import('./pages/reports/CustomReports'));

// Admin & Settings
const SystemSettings = React.lazy(() => import('./pages/admin/SystemSettings'));
const AuditLogs = React.lazy(() => import('./pages/admin/AuditLogs'));
const SystemMonitoring = React.lazy(() => import('./pages/admin/SystemMonitoring'));

// User Profile & Additional Pages
const UserProfile = React.lazy(() => import('./pages/user/UserProfile'));
const AdmissionManagement = React.lazy(() => import('./pages/patient/AdmissionManagement'));
const DispensingQueue = React.lazy(() => import('./pages/pharmacy/DispensingQueue'));

// Error Pages
const NotFound = React.lazy(() => import('./pages/errors/NotFound'));
const Unauthorized = React.lazy(() => import('./pages/errors/Unauthorized'));

// Loading Component
const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flexDirection: 'column',
    gap: '20px'
  }}>
    <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
    <p style={{ color: '#1890ff', fontSize: '16px' }}>Đang tải...</p>
  </div>
);

function App() {
  return (
    <div className="healthcare-app">
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/home" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/booking" element={<OnlineBookingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
            <Route path="/resend-verification" element={<ResendVerificationPage />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedLayout />}>
            {/* Dashboards */}
            <Route path="/dashboard/super-admin" element={<SuperAdminDashboard />} />
            <Route path="/dashboard/hospital-admin" element={<HospitalAdminDashboard />} />
            <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
            <Route path="/dashboard/nurse" element={<NurseDashboard />} />
            <Route path="/dashboard/patient" element={<PatientDashboard />} />
            <Route path="/dashboard/receptionist" element={<ReceptionistDashboard />} />
            <Route path="/dashboard/billing" element={<BillingDashboard />} />
            <Route path="/dashboard/pharmacist" element={<PharmacistDashboard />} />
            <Route path="/dashboard/lab-technician" element={<LabTechnicianDashboard />} />

            {/* User Management */}
            <Route path="/users" element={<UserList />} />
            <Route path="/users/create" element={<UserCreate />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/users/:id/edit" element={<UserEdit />} />
            <Route path="/roles" element={<RoleManagement />} />

            {/* Patient Management */}
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/register" element={<PatientRegister />} />
            <Route path="/patients/:id" element={<PatientProfile />} />
            <Route path="/patients/:id/edit" element={<PatientEdit />} />

            {/* Appointments */}
            <Route path="/appointments" element={<AppointmentList />} />
            <Route path="/appointments/schedule" element={<AppointmentSchedule />} />
            <Route path="/appointments/calendar" element={<AppointmentCalendar />} />
            <Route path="/appointments/:id" element={<AppointmentDetail />} />
            <Route path="/appointments/book" element={<OnlineBookingPage />} />
            <Route path="/appointments/doctors" element={<DoctorSelectionPage />} />
            <Route path="/appointments/timeslots" element={<TimeSlotSelectionPage />} />
            <Route path="/appointments/telemedicine/:sessionId" element={<TelemedicineRoom />} />

            {/* Clinical */}
            <Route path="/consultation/:appointmentId" element={<ConsultationRoom />} />
            <Route path="/medical-records" element={<MedicalRecordList />} />
            <Route path="/medical-records/create" element={<MedicalRecordCreate />} />
            <Route path="/medical-records/:id" element={<MedicalRecordDetail />} />

            {/* Prescriptions */}
            <Route path="/prescriptions" element={<PrescriptionList />} />
            <Route path="/prescriptions/create" element={<PrescriptionCreate />} />
            <Route path="/prescriptions/:id" element={<PrescriptionDetail />} />

            {/* Laboratory */}
            <Route path="/lab/orders" element={<LabOrderList />} />
            <Route path="/lab/orders/create" element={<LabOrderCreate />} />
            <Route path="/lab/results/:orderId" element={<LabResultEntry />} />
            <Route path="/lab/results/view/:resultId" element={<LabResultView />} />

            {/* Billing */}
            <Route path="/billing" element={<BillingList />} />
            <Route path="/billing/create" element={<BillingCreate />} />
            <Route path="/billing/:id" element={<BillingDetail />} />
            <Route path="/billing/:id/payment" element={<PaymentProcess />} />

            {/* Pharmacy */}
            <Route path="/pharmacy/medications" element={<MedicationList />} />
            <Route path="/pharmacy/medications/create" element={<MedicationCreate />} />
            <Route path="/pharmacy/medications/:id" element={<MedicationDetail />} />
            <Route path="/pharmacy/medications/:id/edit" element={<MedicationCreate />} />
            <Route path="/pharmacy/inventory" element={<MedicationInventory />} />
            <Route path="/pharmacy/dispense" element={<DispenseInterface />} />
            <Route path="/pharmacy/queue" element={<DispensingQueue />} />

            {/* Reports */}
            <Route path="/reports/clinical" element={<ClinicalReports />} />
            <Route path="/reports/financial" element={<FinancialReports />} />
            <Route path="/reports/pharmacy" element={<PharmacyReports />} />
            <Route path="/reports/hr" element={<HRReports />} />
            <Route path="/reports/custom" element={<CustomReports />} />

            {/* Patient Additional */}
            <Route path="/patients/admissions" element={<AdmissionManagement />} />

            {/* User Profile */}
            <Route path="/profile" element={<UserProfile />} />

            {/* Admin & Settings */}
            <Route path="/admin/settings" element={<SystemSettings />} />
            <Route path="/admin/audit-logs" element={<AuditLogs />} />
            <Route path="/admin/monitoring" element={<SystemMonitoring />} />

            {/* Error Pages */}
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>

          {/* Default & 404 */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
