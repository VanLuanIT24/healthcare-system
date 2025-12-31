// src/api/billingAPI.js - API Thanh toán (Phiên bản đầy đủ 2025 - Liên kết: Complete consultation/discharge → Create bill)
import axios from '../axios';

const billingAPI = {
  // ===== HÓA ĐƠN =====
  createBill: async (data) => axios.post('/billing', data),
  getBill: async (id) => axios.get(`/billing/${id}`),
  getBills: async (params = {}) => axios.get('/billing', { params }),
  updateBill: async (id, data) => axios.put(`/billing/${id}`, data),
  voidBill: async (id, reason) => axios.patch(`/billing/${id}/void`, { reason }),

  // ===== THANH TOÁN =====
  processPayment: async (billId, payment) => axios.post(`/billing/${billId}/payments`, payment),
  getPaymentHistory: async (billId) => axios.get(`/billing/${billId}/payments`),
  refundPayment: async (paymentId, data) => axios.post(`/payments/${paymentId}/refund`, data),

  // ===== BỆNH NHÂN =====
  getPatientBills: async (patientId, params = {}) => axios.get(`/patients/${patientId}/bills`, { params }),

  // ===== DỊCH VỤ & BẢO HIỂM =====
  getServices: async (params = {}) => axios.get('/services', { params }),
  verifyInsurance: async (patientId, data) => axios.post(`/patients/${patientId}/insurance/verify`, data),
  submitInsuranceClaim: async (billId, claim) => axios.post(`/billing/${billId}/insurance-claim`, claim),

  // ===== BÁO CÁO =====
  getOutstandingBills: async (params = {}) => axios.get('/billing/outstanding', { params }),
  getRevenueStats: async (params = {}) => axios.get('/billing/stats/revenue', { params }),

  // ===== IN ẤN =====
  generateInvoicePDF: async (billId) => axios.get(`/billing/${billId}/invoice/pdf`, { responseType: 'blob' }),
  generateReceiptPDF: async (paymentId) => axios.get(`/payments/${paymentId}/receipt/pdf`, { responseType: 'blob' }),
};

export default billingAPI;