// src/services/api/doctorScheduleAPI.js
import axios from '../axios';

const API_URL = '/api/doctor-schedules';

export const doctorScheduleAPI = {
  // Lấy danh sách lịch làm việc
  getSchedules: (params = {}) => {
    return axios.get(API_URL, { params });
  },

  // Lấy lịch làm việc của một bác sĩ
  getDoctorSchedules: (doctorId, params = {}) => {
    return axios.get(`${API_URL}/doctor/${doctorId}`, { params });
  },

  // Lấy chi tiết một lịch
  getScheduleById: (id) => {
    return axios.get(`${API_URL}/${id}`);
  },

  // Tạo lịch làm việc mới
  createSchedule: (data) => {
    return axios.post(API_URL, data);
  },

  // Tạo lịch hàng loạt
  bulkCreateSchedules: (doctorId, schedules) => {
    return axios.post(`${API_URL}/bulk`, { doctorId, schedules });
  },

  // Cập nhật lịch làm việc
  updateSchedule: (id, data) => {
    return axios.put(`${API_URL}/${id}`, data);
  },

  // Xóa lịch làm việc
  deleteSchedule: (id) => {
    return axios.delete(`${API_URL}/${id}`);
  },

  // Lấy slots khả dụng cho một ngày
  getAvailableSlots: (doctorId, date) => {
    return axios.get(`${API_URL}/available-slots/${doctorId}/${date}`);
  }
};

export default doctorScheduleAPI;
