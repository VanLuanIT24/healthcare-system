// src/router/AppRouter.jsx
import { ProtectedRoute, ScrollToTop } from '@/components/common';
import { Route, Routes } from 'react-router-dom';

// Public Pages
import BookingPage from '@/pages/public/Booking/BookingPage';
import { AboutPage, ContactPage, FAQPage, NewsPage } from '@/pages/public/Content';
import DoctorsListPage from '@/pages/public/DoctorsList';
import HomePage from '@/pages/public/Home/index.jsx';
import DoctorDetail from '@/pages/public/Services/DoctorDetail';
import ServiceDetail from '@/pages/public/Services/ServiceDetail';
import ServicesList from '@/pages/public/Services/ServicesList';

// Auth Pages
import ChangePasswordPage from '@/pages/auth/ChangePasswordPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import LoginPage from '@/pages/auth/LoginPage';
import LogoutPage from '@/pages/auth/LogoutPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ResendVerificationPageNew from '@/pages/auth/ResendVerificationPageNew';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import ResetPasswordPageNew from '@/pages/auth/ResetPasswordPageNew';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';

// Patient Portal
import AppointmentsPage from '@/pages/patient/AppointmentsPage';
import BookAppointment from '@/pages/patient/BookAppointment';
import CreateAppointmentPage from '@/pages/patient/CreateAppointmentPage';
import Dashboard from '@/pages/patient/Dashboard';
import LabResultsPage from '@/pages/patient/LabResultsPage';
import MedicalRecordsPage from '@/pages/patient/MedicalRecordsPage';
import MessagesPage from '@/pages/patient/MessagesPage';
import MyProfilePage from '@/pages/patient/MyProfilePage';
import PrescriptionsPage from '@/pages/patient/PrescriptionsPage';

// Doctor Portal
import DoctorAppointments from '@/pages/doctor/Appointments';
import DoctorDashboard from '@/pages/doctor/Dashboard';
import DoctorMedicalRecordDetail from '@/pages/doctor/MedicalRecordDetail';
import DoctorMedicalRecords from '@/pages/doctor/MedicalRecords';
import DoctorMessages from '@/pages/doctor/Messages';
import DoctorPrescriptions from '@/pages/doctor/Prescriptions';
import DoctorProfile from '@/pages/doctor/Profile';
import DoctorSchedule from '@/pages/doctor/Schedule';
import DoctorSettings from '@/pages/doctor/Settings';

// Staff Portal
import { StaffDashboard } from '@/pages/staff';

// Admin Portal - Appointments
import AppointmentAccessLogs from '@/pages/admin/appointments/AppointmentAccessLogs';
import AppointmentDetail from '@/pages/admin/appointments/AppointmentDetail';
import AppointmentReminders from '@/pages/admin/appointments/AppointmentReminders';
import AppointmentsList from '@/pages/admin/appointments/AppointmentsList';
import AppointmentStats from '@/pages/admin/appointments/AppointmentStats';
import AvailableSlots from '@/pages/admin/appointments/AvailableSlots';
import DoctorScheduleManagement from '@/pages/admin/appointments/DoctorScheduleManagement';
import ExportAppointments from '@/pages/admin/appointments/ExportAppointments';
import RescheduleAppointment from '@/pages/admin/appointments/RescheduleAppointment';
import TodayAppointments from '@/pages/admin/appointments/TodayAppointments';
import UpcomingAppointments from '@/pages/admin/appointments/UpcomingAppointments';
import BedDetail from '@/pages/admin/beds/BedDetail';
import BedForm from '@/pages/admin/beds/BedForm';
import BedsList from '@/pages/admin/beds/BedsList';
import BillingDetail from '@/pages/admin/billings/BillingDetail';
import BillingsList from '@/pages/admin/billings/BillingsList';
import CreateBilling from '@/pages/admin/billings/CreateBilling';
import DepartmentDetail from '@/pages/admin/departments/DepartmentDetail';
import DepartmentForm from '@/pages/admin/departments/DepartmentForm';
import DepartmentsList from '@/pages/admin/departments/DepartmentsList';
import AdminDoctorAppointments from '@/pages/admin/doctors/DoctorAppointments';
import DoctorCreate from '@/pages/admin/doctors/DoctorCreate';
import AdminDoctorDetail from '@/pages/admin/doctors/DoctorDetail';
import DoctorEdit from '@/pages/admin/doctors/DoctorEdit';
import AdminDoctorSchedule from '@/pages/admin/doctors/DoctorSchedule';
import DoctorsList from '@/pages/admin/doctors/DoctorsList';
import DoctorStats from '@/pages/admin/doctors/DoctorStats';
import DoctorWorkSchedule from '@/pages/admin/doctors/DoctorWorkSchedule';
import ManageDoctorSpecialties from '@/pages/admin/doctors/ManageDoctorSpecialties';
import CreateLaboratory from '@/pages/admin/laboratory/CreateLaboratory';
import LaboratoryDetail from '@/pages/admin/laboratory/LaboratoryDetail';
import LaboratoryList from '@/pages/admin/laboratory/LaboratoryList';
import MainDashboard from '@/pages/admin/MainDashboard';
import MedicationDetail from '@/pages/admin/medications/MedicationDetail';
import MedicationForm from '@/pages/admin/medications/MedicationForm';
import MedicationsList from '@/pages/admin/medications/MedicationInventory';
import PatientDetail from '@/pages/admin/patients/PatientDetail';
import PatientsList from '@/pages/admin/patients/PatientsList';
import ReportsPage from '@/pages/admin/reports/ReportsPage';
import SettingsPage from '@/pages/admin/settings/SettingsPage';
import ChangeRole from '@/pages/admin/users/ChangeRole';
import CreateUser from '@/pages/admin/users/CreateUser';
import DeletedUsers from '@/pages/admin/users/DeletedUsers';
import UserDetail from '@/pages/admin/users/UserDetail';
import UserEdit from '@/pages/admin/users/UserEdit';
import UsersList from '@/pages/admin/users/UsersList';
import UsersStats from '@/pages/admin/users/UsersStats';
import ConsultationsList from '@/pages/admin/consultations/ConsultationsList';
import ConsultationDetail from '@/pages/admin/consultations/ConsultationDetail';
import CreateConsultation from '@/pages/admin/consultations/CreateConsultation';

// Error Pages
import ForbiddenPage from '@/pages/errors/ForbiddenPage';
import MaintenancePage from '@/pages/errors/MaintenancePage';
import NotFoundPage from '@/pages/errors/NotFoundPage';
import ServerErrorPage from '@/pages/errors/ServerErrorPage';
import UnauthorizedPage from '@/pages/errors/UnauthorizedPage';

// Layouts
import { DashboardLayout, PublicLayout } from '@/components/layout';

const AppRouter = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/doctors" element={<DoctorsListPage />} />
          <Route path="/services" element={<ServicesList />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/doctors/:id" element={<DoctorDetail />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password-new" element={<ResetPasswordPageNew />} />
        <Route path="/resend-verification" element={<ResendVerificationPageNew />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/logout" element={<LogoutPage />} />

        {/* Patient Portal Routes */}
        <Route
          element={
            <ProtectedRoute requiredRoles={['PATIENT']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/patient/dashboard" element={<Dashboard />} />
          <Route path="/patient/appointments" element={<AppointmentsPage />} />
          <Route path="/patient/appointments/book" element={<BookAppointment />} />
          <Route path="/patient/create-appointment" element={<CreateAppointmentPage />} />
          <Route path="/patient/medical-records" element={<MedicalRecordsPage />} />
          <Route path="/patient/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/patient/lab-results" element={<LabResultsPage />} />
          <Route path="/patient/messages" element={<MessagesPage />} />
          <Route path="/patient/profile" element={<MyProfilePage />} />
        </Route>

        {/* Doctor Portal Routes */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute requiredRoles={['DOCTOR']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute requiredRoles={['DOCTOR']}>
              <DoctorAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments/:appointmentId"
          element={
            <ProtectedRoute requiredRoles={['DOCTOR']}>
              <DoctorAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/schedule"
          element={
            <ProtectedRoute requiredRoles={['DOCTOR']}>
              <DoctorSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/medical-records"
          element={
            <ProtectedRoute requiredRoles={['DOCTOR']}>
              <DoctorMedicalRecords />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/medical-records/:patientId"
          element={
            <ProtectedRoute requiredRoles={['DOCTOR']}>
              <DoctorMedicalRecordDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/prescriptions"
          element={
            <ProtectedRoute requiredRoles={['DOCTOR']}>
              <DoctorPrescriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/messages"
          element={
            <ProtectedRoute requiredRoles={['DOCTOR']}>
              <DoctorMessages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/profile"
          element={
            <ProtectedRoute requiredRoles={['DOCTOR']}>
              <DoctorProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/settings"
          element={
            <ProtectedRoute requiredRoles={['DOCTOR']}>
              <DoctorSettings />
            </ProtectedRoute>
          }
        />

        {/* Staff Portal Routes */}
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute requiredRoles={['NURSE', 'PHARMACIST', 'LAB_TECHNICIAN']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* Department Management */}
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <DepartmentsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments/create"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <DepartmentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments/:id/edit"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <DepartmentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments/:departmentId"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <DepartmentDetail />
            </ProtectedRoute>
          }
        />

        {/* Bed Management */}
        <Route
          path="/admin/beds"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <BedsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/beds/create"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <BedForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/beds/:id/edit"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <BedForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/beds/:bedId"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <BedDetail />
            </ProtectedRoute>
          }
        />

        {/* Medication/Inventory Management */}
        <Route
          path="/admin/medications"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <MedicationsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/medications/create"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <MedicationForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/medications/:id/edit"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <MedicationForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/medications/:medicationId"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <MedicationDetail />
            </ProtectedRoute>
          }
        />

        {/* Laboratory/Tests Management */}
        <Route
          path="/admin/laboratory"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <LaboratoryList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/laboratory/create"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <CreateLaboratory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/laboratory/:testId"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <LaboratoryDetail />
            </ProtectedRoute>
          }
        />

        {/* Billings Management */}
        <Route
          path="/admin/billings"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <BillingsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/billings/create"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <CreateBilling />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/billings/:billingId"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <BillingDetail />
            </ProtectedRoute>
          }
        />

        {/* Patients Management */}
        <Route
          path="/admin/patients"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']}>
              <PatientsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/patients/:patientId"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']}>
              <PatientDetail />
            </ProtectedRoute>
          }
        />

        {/* Consultations Management */}
        <Route
          path="/admin/consultations"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <ConsultationsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/consultations/create"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <CreateConsultation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/consultations/:consultationId"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <ConsultationDetail />
            </ProtectedRoute>
          }
        />

        {/* Reports Page */}
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Settings Page */}
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <MainDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/list"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <UsersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/create"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <CreateUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/deleted"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <DeletedUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:userId/edit"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <UserEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:userId/change-role"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <ChangeRole />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:userId"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <UserDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/stats"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <UsersStats />
            </ProtectedRoute>
          }
        />

        {/* Doctor Management Routes */}
        <Route
          path="/admin/doctors"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'DEPARTMENT_HEAD']}>
              <DoctorsList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/doctors/create"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'DEPARTMENT_HEAD']}>
              <DoctorCreate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/doctors/:doctorId"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'DEPARTMENT_HEAD']}>
              <AdminDoctorDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/doctors/:doctorId/edit"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'DEPARTMENT_HEAD']}>
              <DoctorEdit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/doctors/:doctorId/appointments"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'DEPARTMENT_HEAD']}>
              <AdminDoctorAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/doctors/:doctorId/specialties"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'DEPARTMENT_HEAD']}>
              <ManageDoctorSpecialties />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/doctors/stats"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'DEPARTMENT_HEAD']}>
              <DoctorStats />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/doctors/schedule"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'DEPARTMENT_HEAD']}>
              <AdminDoctorSchedule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/doctors/work-schedule"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'DEPARTMENT_HEAD']}>
              <DoctorWorkSchedule />
            </ProtectedRoute>
          }
        />

        {/* Appointments Management Routes */}
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST', 'DEPARTMENT_HEAD']}>
              <AppointmentsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments/today"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE']}>
              <TodayAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments/upcoming"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST', 'DOCTOR']}>
              <UpcomingAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments/available-slots"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST', 'PATIENT']}>
              <AvailableSlots />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments/stats"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'DEPARTMENT_HEAD']}>
              <AppointmentStats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments/schedule-management"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'DEPARTMENT_HEAD', 'DOCTOR']}>
              <DoctorScheduleManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments/reminders"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST']}>
              <AppointmentReminders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments/export"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <ExportAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments/:appointmentId"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'DEPARTMENT_HEAD', 'PATIENT']}>
              <AppointmentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments/:appointmentId/reschedule"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST', 'DOCTOR']}>
              <RescheduleAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments/:appointmentId/logs"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
              <AppointmentAccessLogs />
            </ProtectedRoute>
          }
        />

        {/* Error Routes */}
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

export default AppRouter;
