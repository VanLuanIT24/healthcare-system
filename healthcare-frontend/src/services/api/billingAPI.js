// src/api/billingAPI.js - API Thanh toán (Phiên bản đầy đủ 2025 - Liên kết: Complete consultation/discharge → Create bill)
import axios from '../axios';

const billingAPI = {
  // ===== HÓA ĐƠN =====
  createBill: async (data) => axios.post('/api/billing', data),
  getBill: async (id) => axios.get(`/api/billing/${id}`),
  getBills: async (params = {}) => axios.get('/api/billing', { params }),
  updateBill: async (id, data) => axios.put(`/api/billing/${id}`, data),
  voidBill: async (id, reason) => axios.patch(`/api/billing/${id}/void`, { reason }),

  // ===== THANH TOÁN =====
  processPayment: async (billId, payment) => axios.post(`/api/billing/${billId}/payments`, payment),
  getPaymentHistory: async (billId) => axios.get(`/api/billing/${billId}/payments`),
  refundPayment: async (paymentId, data) => axios.post(`/api/payments/${paymentId}/refund`, data),

  // ===== BỆNH NHÂN =====
  getPatientBills: async (patientId, params = {}) => axios.get(`/api/patients/${patientId}/bills`, { params }),

  // ===== DỊCH VỤ & BẢO HIỂM =====
  getServices: async (params = {}) => axios.get('/api/services', { params }),
  verifyInsurance: async (patientId, data) => axios.post(`/api/patients/${patientId}/insurance/verify`, data),
  submitInsuranceClaim: async (billId, claim) => axios.post(`/api/billing/${billId}/insurance-claim`, claim),

  // ===== BÁO CÁO =====
  getOutstandingBills: async (params = {}) => axios.get('/api/billing/outstanding', { params }),
  getRevenueStats: async (params = {}) => axios.get('/api/billing/stats/revenue', { params }),

  // ===== IN ẤN =====
  generateInvoicePDF: async (billId) => axios.get(`/api/billing/${billId}/invoice/pdf`, { responseType: 'blob' }),
  generateReceiptPDF: async (paymentId) => axios.get(`/api/payments/${paymentId}/receipt/pdf`, { responseType: 'blob' }),
};

export default billingAPI;