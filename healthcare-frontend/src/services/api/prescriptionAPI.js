// src/api/prescriptionAPI.js - API Quản lý Đơn thuốc (Phiên bản đầy đủ 2025 - Liên kết: Kê đơn → Cấp phát → Cập nhật stock medicationAPI)
import axios from '../axios';

const prescriptionAPI = {
  // ===== QUẢN LÝ ĐƠN THUỐC =====
  createPrescription: async (prescriptionData) => axios.post('/prescriptions', prescriptionData),
  getPrescription: async (id) => axios.get(`/prescriptions/${id}`),
  updatePrescription: async (id, prescriptionData) => axios.put(`/prescriptions/${id}`, prescriptionData),
  cancelPrescription: async (id, reason) => axios.patch(`/prescriptions/${id}/cancel`, { reason }),
  getPrescriptions: async (params = {}) => axios.get('/prescriptions', { params }),
  getPatientPrescriptions: async (patientId, params = {}) => axios.get(`/prescriptions/patients/${patientId}/prescriptions`, { params }),
  printPrescription: async (id) => axios.get(`/prescriptions/${id}/print`, { responseType: 'blob' }),
  exportPDF: async (id) => axios.get(`/prescriptions/${id}/print`, { responseType: 'blob' }),
  approvePrescription: async (id) => axios.patch(`/prescriptions/${id}/approve`),

  // ===== CẤP PHÁT THUỐC =====
  dispenseMedication: async (prescriptionId, dispenseData) => axios.post(`/prescriptions/${prescriptionId}/dispense`, dispenseData),
  getDispenseHistory: async (prescriptionId) => axios.get(`/prescriptions/${prescriptionId}/dispense-history`),

  // ===== KIỂM TRA AN TOÀN =====
  checkDrugInteractions: async (medications) => axios.post('/prescriptions/check-interactions', { medications }),
  checkPatientAllergies: async (patientId, medications) => axios.post(`/prescriptions/patients/${patientId}/check-allergies`, { medications }),
  getDosageSuggestions: async (medicationId, patientData) => axios.get(`/medications/${medicationId}/dosage-suggestions`, { params: patientData }),

  // ===== DANH MỤC THUỐC =====
  searchMedications: async (query, filters = {}) => axios.get('/medications/search', { params: { q: query, ...filters } }),
  getMedications: async (params = {}) => axios.get('/medications', { params }),
  getMedicationById: async (id) => axios.get(`/medications/${id}`),
  searchByActiveIngredient: async (ingredient) => axios.get('/medications/search', { params: { activeIngredient: ingredient } }),

  // ===== CẢNH BÁO =====
  getLowStockAlerts: async () => axios.get('/medications/low-stock'),
  getExpiringMedications: async (days = 30) => axios.get('/medications/expiring', { params: { days } }),
  getRecalledMedications: async () => axios.get('/medications/recalls'),
};

export default prescriptionAPI;