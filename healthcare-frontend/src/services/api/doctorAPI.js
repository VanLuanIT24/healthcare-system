// src/services/api/doctorAPI.js
import axios from '../axios';

export const doctorAPI = {
  // Doctors List
  getDoctors: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    return axios.get(`/api/admin/doctors?${queryParams.toString()}`);
  },

  // Get doctor detail
  getDoctorById: async (doctorId) => axios.get(`/api/admin/doctors/${doctorId}`),

  // Create doctor
  createDoctor: async (doctorData) => axios.post('/api/admin/doctors', doctorData),

  // Update doctor profile
  updateDoctor: async (doctorId, doctorData) => axios.put(`/api/admin/doctors/${doctorId}`, doctorData),

  // Delete doctor
  deleteDoctor: async (doctorId) => axios.delete(`/api/admin/doctors/${doctorId}`),

  // Doctor specialties
  addSpecialty: async (doctorId, specialtyId) => 
    axios.post(`/api/admin/doctors/${doctorId}/specialties`, { specialtyId }),

  removeSpecialty: async (doctorId, specialtyId) => 
    axios.delete(`/api/admin/doctors/${doctorId}/specialties/${specialtyId}`),

  // Disable/Enable doctor
  disableDoctor: async (doctorId) => axios.patch(`/api/admin/doctors/${doctorId}/disable`),

  enableDoctor: async (doctorId) => axios.patch(`/api/admin/doctors/${doctorId}/enable`),

  // Doctor stats
  getDoctorStats: async (doctorId) => axios.get(`/api/admin/doctors/${doctorId}/stats`),

  getAllDoctorsStats: async () => axios.get('/api/admin/doctors/stats'),

  // Doctor appointments
  getDoctorAppointments: async (doctorId, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    return axios.get(`/api/appointment/doctor/${doctorId}?${queryParams.toString()}`);
  },

  // Doctor schedule
  getDoctorSchedules: async (doctorId, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    return axios.get(`/api/appointment/schedules/doctor/${doctorId}?${queryParams.toString()}`);
  },

  createSchedule: async (scheduleData) => axios.post('/api/appointment/schedules', scheduleData),

  updateSchedule: async (scheduleId, scheduleData) => 
    axios.put(`/api/appointment/schedules/${scheduleId}`, scheduleData),

  deleteSchedule: async (scheduleId) => axios.delete(`/api/appointment/schedules/${scheduleId}`),

  // ============ NEW FEATURES ============
  
  // Credentials Management
  addCredential: async (doctorId, credentialData) => 
    axios.post(`/api/admin/doctors/${doctorId}/credentials`, credentialData),

  updateCredential: async (doctorId, credentialId, credentialData) => 
    axios.put(`/api/admin/doctors/${doctorId}/credentials/${credentialId}`, credentialData),

  deleteCredential: async (doctorId, credentialId) => 
    axios.delete(`/api/admin/doctors/${doctorId}/credentials/${credentialId}`),

  // Consultation Fees
  setConsultationFees: async (doctorId, feesData) => 
    axios.patch(`/api/admin/doctors/${doctorId}/fees`, feesData),

  getConsultationFees: async (doctorId) => 
    axios.get(`/api/admin/doctors/${doctorId}/fees`),

  // Account Security
  resetPassword: async (doctorId) => 
    axios.post(`/api/admin/doctors/${doctorId}/reset-password`),

  getLoginHistory: async (doctorId, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    return axios.get(`/api/admin/doctors/${doctorId}/login-history?${queryParams.toString()}`);
  },

  forceLogout: async (doctorId) => 
    axios.post(`/api/admin/doctors/${doctorId}/force-logout`),

  getActivityLog: async (doctorId, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    return axios.get(`/api/admin/doctors/${doctorId}/activity-log?${queryParams.toString()}`);
  },

  // Performance Metrics
  getPerformanceMetrics: async (doctorId, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    return axios.get(`/api/admin/doctors/${doctorId}/performance?${queryParams.toString()}`);
  },

  // Doctor Reviews
  getDoctorReviews: async (doctorId, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    return axios.get(`/api/admin/doctors/${doctorId}/reviews?${queryParams.toString()}`);
  },

  // Patients
  getDoctorPatients: async (doctorId, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    return axios.get(`/api/admin/doctors/${doctorId}/patients?${queryParams.toString()}`);
  },

  // Bulk operations
  bulkEnableDoctors: async (doctorIds) => 
    axios.patch('/api/admin/doctors/bulk/enable', { doctorIds }),

  bulkDisableDoctors: async (doctorIds) => 
    axios.patch('/api/admin/doctors/bulk/disable', { doctorIds }),

  bulkDeleteDoctors: async (doctorIds) => 
    axios.delete('/api/admin/doctors/bulk/delete', { data: { doctorIds } }),
};
