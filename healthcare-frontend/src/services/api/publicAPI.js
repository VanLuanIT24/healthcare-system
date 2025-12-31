// src/services/api/publicAPI.js
import axios from '../axios';

const publicAPI = {
  // 📊 Lấy thống kê trang chủ (số lượng bệnh nhân, bác sĩ, tỷ lệ hài lòng, v.v.)
  getStats: async () => {
    return await axios.get('/public/stats');
  },

  // 👨‍⚕️ Lấy danh sách bác sĩ nổi bật cho carousel
  getFeaturedDoctors: async (limit = 4) => {
    return await axios.get('/public/featured-doctors', {
      params: { limit }
    });
  },

  // 👨‍⚕️ Lấy danh sách tất cả bác sĩ với filter & pagination (cũ - dùng getAllDoctors thay vào đó)
  getAllDoctors: async (filters = {}) => {
    return await axios.get('/public/doctors', {
      params: {
        specialty: filters.specialty || undefined,
        department: filters.department || undefined,
        search: filters.search || undefined,
        page: filters.page || 1,
        limit: filters.limit || 10
      }
    });
  },

  // 👨‍⚕️ Lấy danh sách bác sĩ với filter đầy đủ (specialty, department, search, sort, pagination)
  getDoctors: async (params = {}) => {
    return await axios.get('/public/doctors', { params });
  },

  // 🏥 Lấy chi tiết một bác sĩ
  getDoctorDetail: async (doctorId) => {
    return await axios.get(`/public/doctors/${doctorId}`);
  },

  // 📋 Lấy danh sách chuyên khoa
  getSpecialties: async () => {
    return await axios.get('/public/specialties');
  },

  // 🏢 Lấy danh sách khoa/phòng ban
  getDepartments: async () => {
    return await axios.get('/public/departments');
  }
};

export default publicAPI;
