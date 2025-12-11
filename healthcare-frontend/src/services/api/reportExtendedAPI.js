// 📊 Advanced Reporting API
import axios from '../axios';

const reportExtendedAPI = {
  // Financial Reports
  getFinancialReport: async (params) => {
    return await axios.get('/reports/financial', { params });
  },

  getRevenueByDepartment: async (params) => {
    return await axios.get('/reports/financial/by-department', { params });
  },

  getRevenueByPaymentMethod: async (params) => {
    return await axios.get('/reports/financial/by-payment-method', { params });
  },

  exportFinancialReportPDF: async (params) => {
    return await axios.get('/reports/financial/export/pdf', {
      params,
      responseType: 'blob',
    });
  },

  exportFinancialReportExcel: async (params) => {
    return await axios.get('/reports/financial/export/excel', {
      params,
      responseType: 'blob',
    });
  },

  // Pharmacy Reports
  getPharmacyReport: async (params) => {
    return await axios.get('/reports/pharmacy', { params });
  },

  getMedicationUsageReport: async (params) => {
    return await axios.get('/reports/pharmacy/medication-usage', { params });
  },

  getInventoryReport: async (params) => {
    return await axios.get('/reports/pharmacy/inventory', { params });
  },

  exportPharmacyReportPDF: async (params) => {
    return await axios.get('/reports/pharmacy/export/pdf', {
      params,
      responseType: 'blob',
    });
  },

  exportPharmacyReportExcel: async (params) => {
    return await axios.get('/reports/pharmacy/export/excel', {
      params,
      responseType: 'blob',
    });
  },

  // Clinical Reports
  getClinicalReport: async (params) => {
    return await axios.get('/reports/clinical', { params });
  },

  getDiseaseStatistics: async (params) => {
    return await axios.get('/reports/clinical/disease-statistics', { params });
  },

  getTreatmentOutcomes: async (params) => {
    return await axios.get('/reports/clinical/treatment-outcomes', { params });
  },

  exportClinicalReportPDF: async (params) => {
    return await axios.get('/reports/clinical/export/pdf', {
      params,
      responseType: 'blob',
    });
  },

  exportClinicalReportExcel: async (params) => {
    return await axios.get('/reports/clinical/export/excel', {
      params,
      responseType: 'blob',
    });
  },

  // HR Reports
  getHRReport: async (params) => {
    return await axios.get('/reports/hr', { params });
  },

  getStaffPerformance: async (params) => {
    return await axios.get('/reports/hr/staff-performance', { params });
  },

  getAttendanceReport: async (params) => {
    return await axios.get('/reports/hr/attendance', { params });
  },

  exportHRReportPDF: async (params) => {
    return await axios.get('/reports/hr/export/pdf', {
      params,
      responseType: 'blob',
    });
  },

  exportHRReportExcel: async (params) => {
    return await axios.get('/reports/hr/export/excel', {
      params,
      responseType: 'blob',
    });
  },

  // Custom Report Builder
  getReportTemplates: async () => {
    return await axios.get('/reports/templates');
  },

  createCustomReport: async (reportConfig) => {
    return await axios.post('/reports/custom', reportConfig);
  },

  getCustomReport: async (reportId) => {
    return await axios.get(`/reports/custom/${reportId}`);
  },

  executeCustomReport: async (reportId, params) => {
    return await axios.post(`/reports/custom/${reportId}/execute`, params);
  },

  saveReportTemplate: async (templateData) => {
    return await axios.post('/reports/templates', templateData);
  },

  updateReportTemplate: async (templateId, templateData) => {
    return await axios.put(`/reports/templates/${templateId}`, templateData);
  },

  deleteReportTemplate: async (templateId) => {
    return await axios.delete(`/reports/templates/${templateId}`);
  },

  // Export Utilities
  downloadReport: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  generateReportFilename: (reportType, format) => {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${reportType}_report_${timestamp}.${format}`;
  },
};

export default reportExtendedAPI;
