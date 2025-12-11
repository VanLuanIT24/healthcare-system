// src/api/appointmentAPI.js
import axios from '../axios';

const appointmentAPI = {
  // ✅ FIX: Sử dụng đúng base path
  createAppointment: async (appointmentData) => {
    return await axios.post('/api/appointments', appointmentData);
  },

  getAppointments: async (params) => {
    return await axios.get('/api/appointments', { params });
  },

  getAppointmentById: async (id) => {
    return await axios.get(`/api/appointments/${id}`);
  },

  updateAppointment: async (id, appointmentData) => {
    return await axios.put(`/api/appointments/${id}`, appointmentData);
  },

  // ✅ FIX: Sử dụng POST thay vì PATCH
  cancelAppointment: async (id, data) => {
    return await axios.post(`/api/appointments/${id}/cancel`, data);
  },

  // ✅ FIX: Sử dụng POST thay vì PATCH
  rescheduleAppointment: async (id, data) => {
    return await axios.post(`/api/appointments/${id}/reschedule`, data);
  },

  // ✅ FIX: Sử dụng PATCH đúng
  checkInAppointment: async (id) => {
    return await axios.patch(`/api/appointments/${id}/check-in`);
  },

  completeAppointment: async (id) => {
    return await axios.patch(`/api/appointments/${id}/complete`);
  },

  getDoctorAppointments: async (doctorId, params) => {
    return await axios.get(`/api/appointments/doctor/${doctorId}`, { params });
  },

  getAvailableSlots: async (doctorId, date) => {
    return await axios.get('/api/appointments/available-slots', {
      params: { doctorId, date },
    });
  },

  getTodayAppointments: async () => {
    return await axios.get('/api/appointments/today');
  },

  getUpcomingAppointments: async (params) => {
    return await axios.get('/api/appointments/upcoming', { params });
  },

  getAppointmentStats: async (params) => {
    return await axios.get('/api/appointments/stats', { params });
  },

  getTodayAppointments: async () => {
  return await axios.get('/api/appointments/today');
},

getUpcomingAppointments: async (days = 7) => {
  return await axios.get('/api/appointments/upcoming', { 
    params: { days } 
  });
},
};

export default appointmentAPI;