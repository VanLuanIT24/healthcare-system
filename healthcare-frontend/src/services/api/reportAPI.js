import axios from '../axios';

// Report API client
const reportAPI = {
  // ===== BÁOO CÁO LÂM SÀNG =====
  getClinicalReport: async (params = {}) => 
    axios.get('/reports/clinical', { params }),
  
  // ===== BÁOO CÁO TÀI CHÍNH =====
  getFinancialReport: async (params = {}) => 
    axios.get('/reports/financial', { params }),
  
  // ===== BÁOO CÁO DƯỢC =====
  getPharmacyReport: async (params = {}) => 
    axios.get('/reports/pharmacy', { params }),
  
  // ===== BÁOO CÁO NHÂN SỰ =====
  getHRReport: async (params = {}) => 
    axios.get('/reports/hr', { params }),

  // ===== EXPORTED METHODS (LEGACY) =====
  getPatientReport: (params) => axios.get('/reports/patients', { params }),
  getAppointmentReport: (params) => axios.get('/reports/appointments', { params }),
  getRevenueReport: (params) => axios.get('/reports/revenue', { params }),
  exportReport: (type, params) => axios.get(`/reports/export/${type}`, { params, responseType: 'blob' }),
};

export default reportAPI;

