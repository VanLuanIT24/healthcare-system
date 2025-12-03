import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';

// Import all admin pages
import {
    AdminOverviewDashboard,
    AppointmentList,
    BillDetail,
    BillingList,
    CreateAppointment,
    CreateBill,
    CreatePatient,
    CreateStaff,
    LabDashboard,
    PatientDetail,
    PatientList,
    PendingPrescriptions,
    PharmacyDashboard,
    ReportsPage,
    ScheduleManagement,
    StaffDetail,
    StaffList,
    SystemSettings
} from './index'; /**
 * ADMIN PORTAL DASHBOARD
 * Main router component with AdminLayout wrapper
 */
const Dashboard = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* Dashboard */}
        <Route path="dashboard" element={<AdminOverviewDashboard />} />
        
        {/* Staff Management */}
        <Route path="staff/list" element={<StaffList />} />
        <Route path="staff/create" element={<CreateStaff />} />
        <Route path="staff/:id" element={<StaffDetail />} />
        
        {/* Patient Management */}
        <Route path="patients/list" element={<PatientList />} />
        <Route path="patients/create" element={<CreatePatient />} />
        <Route path="patients/:id" element={<PatientDetail />} />
        
        {/* Appointments */}
        <Route path="appointments/list" element={<AppointmentList />} />
        <Route path="appointments/create" element={<CreateAppointment />} />
        <Route path="schedules" element={<ScheduleManagement />} />
        
        {/* Billing */}
        <Route path="billing/list" element={<BillingList />} />
        <Route path="billing/create" element={<CreateBill />} />
        <Route path="billing/:id" element={<BillDetail />} />
        
        {/* Pharmacy */}
        <Route path="pharmacy/dashboard" element={<PharmacyDashboard />} />
        <Route path="pharmacy/prescriptions" element={<PendingPrescriptions />} />
        
        {/* Laboratory */}
        <Route path="laboratory/dashboard" element={<LabDashboard />} />
        
        {/* Reports */}
        <Route path="reports" element={<ReportsPage />} />
        
        {/* Settings */}
        <Route path="settings" element={<SystemSettings />} />
        
        {/* Default redirect to dashboard */}
        <Route path="*" element={<AdminOverviewDashboard />} />
      </Route>
    </Routes>
  );
};

export default Dashboard;
