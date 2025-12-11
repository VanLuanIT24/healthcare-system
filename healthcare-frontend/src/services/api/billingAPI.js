// 💰 Billing & Financial API
import axios from '../axios';

const billingAPI = {
  // Bills
  createBill: async (billData) => {
    return await axios.post('/billing', billData);
  },

  getBill: async (id) => {
    return await axios.get(`/billing/${id}`);
  },

  getBills: async (params) => {
    return await axios.get('/billing', { params });
  },

  updateBill: async (id, billData) => {
    return await axios.put(`/billing/${id}`, billData);
  },

  voidBill: async (id, reason) => {
    return await axios.patch(`/billing/${id}/void`, { reason });
  },

  // Payments
  processPayment: async (billId, paymentData) => {
    return await axios.post(`/billing/${billId}/payment`, paymentData);
  },

  getPaymentHistory: async (billId) => {
    return await axios.get(`/billing/${billId}/payment-history`);
  },

  refundPayment: async (paymentId, refundData) => {
    return await axios.post(`/billing/payments/${paymentId}/refund`, refundData);
  },

  // Patient bills
  getPatientBills: async (patientId, params) => {
    return await axios.get(`/billing/patient/${patientId}`, { params });
  },

  // Services
  getServices: async (params) => {
    return await axios.get('/services', { params });
  },

  getServiceById: async (id) => {
    return await axios.get(`/services/${id}`);
  },

  // Insurance
  verifyInsurance: async (patientId, insuranceData) => {
    return await axios.post('/billing/insurance/verify', {
      patientId,
      ...insuranceData,
    });
  },

  submitInsuranceClaim: async (billId, claimData) => {
    return await axios.post(`/billing/${billId}/insurance-claim`, claimData);
  },

  getInsuranceClaims: async (params) => {
    return await axios.get('/billing/insurance-claims', { params });
  },

  // Financial Statistics
  getRevenueStats: async (params) => {
    return await axios.get('/billing/revenue-stats', { params });
  },

  getDailyRevenue: async (date) => {
    return await axios.get('/billing/daily-revenue', { params: { date } });
  },

  getOutstandingBills: async (params) => {
    return await axios.get('/billing/outstanding', { params });
  },

  // Reports
  generateInvoice: async (billId) => {
    return await axios.get(`/billing/${billId}/invoice`, {
      responseType: 'blob',
    });
  },

  generateReceipt: async (paymentId) => {
    return await axios.get(`/billing/payments/${paymentId}/receipt`, {
      responseType: 'blob',
    });
  },
};

export default billingAPI;
