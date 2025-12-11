// 📊 Reports & Analytics API
import axios from '../axios';

const reportAPI = {
  // Clinical Reports
  getClinicalReport: async (params) => {
    return await axios.get('/reports/clinical', { params });
  },

  getPatientCensusReport: async (params) => {
    return await axios.get('/reports/clinical/patient-census', { params });
  },

  getDiagnosisStatistics: async (params) => {
    return await axios.get('/reports/clinical/diagnosis-stats', { params });
  },

  getTreatmentOutcomes: async (params) => {
    return await axios.get('/reports/clinical/treatment-outcomes', { params });
  },

  getReadmissionRates: async (params) => {
    return await axios.get('/reports/clinical/readmission-rates', { params });
  },

  // Financial Reports
  getFinancialReport: async (params) => {
    return await axios.get('/reports/financial', { params });
  },

  getRevenueByDepartment: async (params) => {
    return await axios.get('/reports/financial/revenue-by-department', { params });
  },

  getARAgingReport: async (params) => {
    return await axios.get('/reports/financial/ar-aging', { params });
  },

  getInsuranceVsSelfPay: async (params) => {
    return await axios.get('/reports/financial/insurance-vs-selfpay', { params });
  },

  // Pharmacy Reports
  getPharmacyReport: async (params) => {
    return await axios.get('/reports/pharmacy', { params });
  },

  getMedicationUsageReport: async (params) => {
    return await axios.get('/reports/pharmacy/medication-usage', { params });
  },

  getInventoryValueReport: async () => {
    return await axios.get('/reports/pharmacy/inventory-value');
  },

  // HR Reports
  getHRReport: async (params) => {
    return await axios.get('/reports/hr', { params });
  },

  // Admin Reports
  getSystemUsageReport: async (params) => {
    return await axios.get('/reports/system-usage', { params });
  },

  getUserActivityReport: async (params) => {
    return await axios.get('/reports/user-activity', { params });
  },

  // Export reports
  exportReportToPDF: async (reportType, params) => {
    return await axios.get(`/reports/${reportType}/export/pdf`, {
      params,
      responseType: 'blob',
    });
  },

  exportReportToExcel: async (reportType, params) => {
    return await axios.get(`/reports/${reportType}/export/excel`, {
      params,
      responseType: 'blob',
    });
  },
};

export default reportAPI;
