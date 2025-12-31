// src/services/api/doctorAPI.js
import axios from '../axios';

export const doctorAPI = {
  // Doctors List
  getDoctors: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    return axios.get(`/admin/doctors?${queryParams.toString()}`);
  },

  // Get doctor detail
  getDoctorById: async (doctorId) => axios.get(`/admin/doctors/${doctorId}`),

  // Create doctor
  createDoctor: async (doctorData) => axios.post('/admin/doctors', doctorData),

  // Update doctor profile
  updateDoctor: async (doctorId, doctorData) => axios.put(`/admin/doctors/${doctorId}`, doctorData),

  // Delete doctor
  deleteDoctor: async (doctorId) => axios.delete(`/admin/doctors/${doctorId}`),

  // Doctor specialties
  addSpecialty: async (doctorId, specialtyId) => 
    axios.post(`/admin/doctors/${doctorId}/specialties`, { specialtyId }),

  removeSpecialty: async (doctorId, specialtyId) => 
    axios.delete(`/admin/doctors/${doctorId}/specialties/${specialtyId}`),

  // Disable/Enable doctor
  disableDoctor: async (doctorId) => axios.patch(`/admin/doctors/${doctorId}/disable`),

  enableDoctor: async (doctorId) => axios.patch(`/admin/doctors/${doctorId}/enable`),

  // Doctor stats
  getDoctorStats: async (doctorId) => axios.get(`/admin/doctors/${doctorId}/stats`),

  getAllDoctorsStats: async () => axios.get('/admin/doctors/stats'),

  // Doctor appointments
  getDoctorAppointments: async (doctorId, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    return axios.get(`/appointment/doctor/${doctorId}?${queryParams.toString()}`);
  },

  // Doctor schedule
  getDoctorSchedules: async (doctorId, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    return axios.get(`/appointment/schedules/doctor/${doctorId}?${queryParams.toString()}`);
  },

  createSchedule: async (scheduleData) => axios.post('/appointment/schedules', scheduleData),

  updateSchedule: async (scheduleId, scheduleData) => 
    axios.put(`/appointment/schedules/${scheduleId}`, scheduleData),

  deleteSchedule: async (scheduleId) => axios.delete(`/appointment/schedules/${scheduleId}`),

  // ============ NEW FEATURES ============
  
  // Credentials Management
  addCredential: async (doctorId, credentialData) => 
    axios.post(`/admin/doctors/${doctorId}/credentials`, credentialData),

  updateCredential: async (doctorId, credentialId, credentialData) => 
    axios.put(`/admin/doctors/${doctorId}/credentials/${credentialId}`, credentialData),

  deleteCredential: async (doctorId, credentialId) => 
    axios.delete(`/admin/doctors/${doctorId}/credentials/${credentialId}`),

  // Consultation Fees
  setConsultationFees: async (doctorId, feesData) => 
    axios.patch(`/admin/doctors/${doctorId}/fees`, feesData),

  getConsultationFees: async (doctorId) => 
    axios.get(`/admin/doctors/${doctorId}/fees`),

  // Account Security
  resetPassword: async (doctorId) => 
    axios.post(`/admin/doctors/${doctorId}/reset-password`),

  getLoginHistory: async (doctorId, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    return axios.get(`/admin/doctors/${doctorId}/login-history?${queryParams.toString()}`);
  },

  forceLogout: async (doctorId) => 
    axios.post(`/admin/doctors/${doctorId}/force-logout`),

  getActivityLog: async (doctorId, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    return axios.get(`/admin/doctors/${doctorId}/activity-log?${queryParams.toString()}`);
  },

  // Performance Metrics
  getPerformanceMetrics: async (doctorId, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    return axios.get(`/admin/doctors/${doctorId}/performance?${queryParams.toString()}`);
  },

  // Doctor Reviews
  getDoctorReviews: async (doctorId, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    return axios.get(`/admin/doctors/${doctorId}/reviews?${queryParams.toString()}`);
  },

  // Patients
  getDoctorPatients: async (doctorId, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    return axios.get(`/admin/doctors/${doctorId}/patients?${queryParams.toString()}`);
  },

  // Bulk operations
  bulkEnableDoctors: async (doctorIds) => 
    axios.patch('/admin/doctors/bulk/enable', { doctorIds }),

  bulkDisableDoctors: async (doctorIds) => 
    axios.patch('/admin/doctors/bulk/disable', { doctorIds }),

  bulkDeleteDoctors: async (doctorIds) => 
    axios.delete('/admin/doctors/bulk/delete', { data: { doctorIds } }),
};
