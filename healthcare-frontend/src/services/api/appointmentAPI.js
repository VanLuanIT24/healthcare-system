// src/api/appointmentAPI.js - API Quản lý Lịch hẹn (Cập nhật 2025 - Thêm approveCancelRequest cho giám sát)
import axios from '../axios';

const appointmentAPI = {
  // ===== TẠO & CRUD LỊCH HẸN =====
  createAppointment: async (appointmentData) => axios.post('/api/appointments', appointmentData),
  getAppointments: async (params = {}) => axios.get('/api/appointments', { params }),
  getAppointmentById: async (id) => axios.get(`/api/appointments/${id}`),
  updateAppointment: async (id, data) => axios.put(`/api/appointments/${id}`, data),
  cancelAppointment: async (id, reason = '') => axios.patch(`/api/appointments/${id}/cancel`, { reason }),
  requestCancelAppointment: async (id, reason = '') => axios.post(`/api/appointments/${id}/cancel-request`, { reason }),
  approveCancelRequest: async (id, approved = true, note = '') => axios.patch(`/api/appointments/${id}/cancel-request/approve`, { approved, note }),
  rescheduleAppointment: async (id, newTime) => axios.patch(`/api/appointments/${id}/reschedule`, newTime),

  // ===== TRẠNG THÁI LỊCH HẸN =====
  checkInAppointment: async (id) => axios.patch(`/api/appointments/${id}/check-in`),
  completeAppointment: async (id, notes = {}) => axios.patch(`/api/appointments/${id}/complete`, notes),
  noShowAppointment: async (id, reason = '') => axios.patch(`/api/appointments/${id}/no-show`, { reason }),

  // ===== LỌC THEO NGƯỜI DÙNG =====
  getDoctorAppointments: async (doctorId, params = {}) => axios.get(`/api/appointments/doctor/${doctorId}`, { params }),
  getPatientAppointments: async (patientId, params = {}) => axios.get(`/api/appointments/patient/${patientId}`, { params }),
  getTodayAppointments: async (params = {}) => axios.get('/api/appointments/today', { params }),
  getUpcomingAppointments: async (params = {}) => axios.get('/api/appointments/upcoming', { params }),

  // ===== KHUNG GIỜ TRỐNG & LỊCH LÀM VIỆC =====
  getAvailableSlots: async (params = {}) => axios.get('/api/appointments/available-slots', { params }),
  getDoctorSchedule: async (doctorId, params = {}) => axios.get(`/api/appointments/schedules/doctor/${doctorId}`, { params }),
  createDoctorSchedule: async (data) => axios.post('/api/appointments/schedules', data),
  updateDoctorSchedule: async (scheduleId, data) => axios.put(`/api/appointments/schedules/${scheduleId}`, data),
  deleteDoctorSchedule: async (scheduleId) => axios.delete(`/api/appointments/schedules/${scheduleId}`),

  // ===== NHẮC HẸN & THÔNG BÁO =====
  sendReminder: async (appointmentId) => axios.post(`/api/appointments/${appointmentId}/reminder`),
  sendBulkReminders: async () => axios.post('/api/appointments/reminders/send-bulk'),

  // ===== THỐNG KÊ & BÁO CÁO =====
  getAppointmentStats: async (params = {}) => axios.get('/api/appointments/stats', { params }),
  exportAppointmentsPDF: async (params = {}) => axios.get('/api/appointments/export/pdf', { params, responseType: 'blob' }),
  exportAppointmentsExcel: async (params = {}) => axios.get('/api/appointments/export/excel', { params, responseType: 'blob' }),

  // ===== AUDIT LOG =====
  getAppointmentAccessLogs: async (appointmentId) => axios.get(`/api/appointments/${appointmentId}/access-logs`),
};

export default appointmentAPI;