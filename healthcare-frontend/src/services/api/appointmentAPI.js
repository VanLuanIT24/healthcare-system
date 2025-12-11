// 📅 Appointment Management API
import axios from '../axios';

const appointmentAPI = {
  // Create appointment
  createAppointment: async (appointmentData) => {
    return await axios.post('/appointments', appointmentData);
  },

  // Get all appointments
  getAppointments: async (params) => {
    return await axios.get('/appointments', { params });
  },

  // Get all appointments (alias for consistency)
  getAllAppointments: async (params) => {
    return await axios.get('/appointments', { params });
  },

  // Get appointment by ID
  getAppointmentById: async (id) => {
    return await axios.get(`/appointments/${id}`);
  },

  // Update appointment
  updateAppointment: async (id, appointmentData) => {
    return await axios.put(`/appointments/${id}`, appointmentData);
  },

  // Cancel appointment
  cancelAppointment: async (id, reason) => {
    return await axios.patch(`/appointments/${id}/cancel`, { reason });
  },

  // Reschedule appointment
  rescheduleAppointment: async (id, newDateTime) => {
    return await axios.patch(`/appointments/${id}/reschedule`, { appointmentDate: newDateTime });
  },

  // Check-in appointment
  checkInAppointment: async (id) => {
    return await axios.patch(`/appointments/${id}/check-in`);
  },

  // Complete appointment
  completeAppointment: async (id) => {
    return await axios.patch(`/appointments/${id}/complete`);
  },

  // Get doctor's appointments
  getDoctorAppointments: async (doctorId, params) => {
    return await axios.get(`/appointments/doctor/${doctorId}`, { params });
  },

  // Get available time slots
  getAvailableSlots: async (doctorId, date) => {
    return await axios.get('/appointments/available-slots', {
      params: { doctorId, date },
    });
  },

  // Get today's appointments
  getTodayAppointments: async () => {
    return await axios.get('/appointments/today');
  },

  // Get upcoming appointments
  getUpcomingAppointments: async (params) => {
    return await axios.get('/appointments/upcoming', { params });
  },

  // Get appointment statistics
  getAppointmentStats: async (params) => {
    return await axios.get('/appointments/stats', { params });
  },
};

export default appointmentAPI;
