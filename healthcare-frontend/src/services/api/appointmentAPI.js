// src/api/appointmentAPI.js - API Quản lý Lịch hẹn (Cập nhật 2025 - Thêm approveCancelRequest cho giám sát)
import axios from '../axios';

const appointmentAPI = {
  // ===== TẠO & CRUD LỊCH HẸN =====
  createAppointment: async (appointmentData) => axios.post('/appointments', appointmentData),
  getAppointments: async (params = {}) => axios.get('/appointments', { params }),
  getAppointmentById: async (id) => axios.get(`/appointments/${id}`),
  updateAppointment: async (id, data) => axios.put(`/appointments/${id}`, data),
  cancelAppointment: async (id, reason = '') => axios.patch(`/appointments/${id}/cancel`, { reason }),
  requestCancelAppointment: async (id, reason = '') => axios.post(`/appointments/${id}/cancel-request`, { reason }),
  approveCancelRequest: async (id, approved = true, note = '') => axios.patch(`/appointments/${id}/cancel-request/approve`, { approved, note }),
  rescheduleAppointment: async (id, newTime) => axios.patch(`/appointments/${id}/reschedule`, newTime),

  // ===== TRẠNG THÁI LỊCH HẸN =====
  checkInAppointment: async (id) => axios.patch(`/appointments/${id}/check-in`),
  completeAppointment: async (id, notes = {}) => axios.patch(`/appointments/${id}/complete`, notes),
  noShowAppointment: async (id, reason = '') => axios.patch(`/appointments/${id}/no-show`, { reason }),

  // ===== LỌC THEO NGƯỜI DÙNG =====
  getDoctorAppointments: async (doctorId, params = {}) => axios.get(`/appointments/doctor/${doctorId}`, { params }),
  getPatientAppointments: async (patientId, params = {}) => axios.get(`/appointments/patient/${patientId}`, { params }),
  getTodayAppointments: async (params = {}) => axios.get('/appointments/today', { params }),
  getUpcomingAppointments: async (params = {}) => axios.get('/appointments/upcoming', { params }),

  // ===== KHUNG GIỜ TRỐNG & LỊCH LÀM VIỆC =====
  getAvailableSlots: async (params = {}) => axios.get('/appointments/available-slots', { params }),
  getDoctorSchedule: async (doctorId, params = {}) => axios.get(`/appointments/schedules/doctor/${doctorId}`, { params }),
  createDoctorSchedule: async (data) => axios.post('/appointments/schedules', data),
  updateDoctorSchedule: async (scheduleId, data) => axios.put(`/appointments/schedules/${scheduleId}`, data),
  deleteDoctorSchedule: async (scheduleId) => axios.delete(`/appointments/schedules/${scheduleId}`),

  // ===== NHẮC HẸN & THÔNG BÁO =====
  sendReminder: async (appointmentId) => axios.post(`/appointments/${appointmentId}/reminder`),
  sendBulkReminders: async () => axios.post('/appointments/reminders/send-bulk'),

  // ===== THỐNG KÊ & BÁO CÁO =====
  getAppointmentStats: async (params = {}) => axios.get('/appointments/stats', { params }),
  exportAppointmentsPDF: async (params = {}) => axios.get('/appointments/export/pdf', { params, responseType: 'blob' }),
  exportAppointmentsExcel: async (params = {}) => axios.get('/appointments/export/excel', { params, responseType: 'blob' }),

  // ===== AUDIT LOG =====
  getAppointmentAccessLogs: async (appointmentId) => axios.get(`/api/appointments/${appointmentId}/access-logs`),
};

export default appointmentAPI;