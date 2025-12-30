// src/api/prescriptionAPI.js - API Quản lý Đơn thuốc (Phiên bản đầy đủ 2025 - Liên kết: Kê đơn → Cấp phát → Cập nhật stock medicationAPI)
import axios from '../axios';

const prescriptionAPI = {
  // ===== QUẢN LÝ ĐƠN THUỐC =====
  createPrescription: async (prescriptionData) => axios.post('/api/prescriptions', prescriptionData),
  getPrescription: async (id) => axios.get(`/api/prescriptions/${id}`),
  updatePrescription: async (id, prescriptionData) => axios.put(`/api/prescriptions/${id}`, prescriptionData),
  cancelPrescription: async (id, reason) => axios.patch(`/api/prescriptions/${id}/cancel`, { reason }),
  getPrescriptions: async (params = {}) => axios.get('/api/prescriptions', { params }),
  getPatientPrescriptions: async (patientId, params = {}) => axios.get(`/api/patients/${patientId}/prescriptions`, { params }),
  printPrescription: async (id) => axios.get(`/api/prescriptions/${id}/print`, { responseType: 'blob' }),
  approvePrescription: async (id) => axios.patch(`/api/prescriptions/${id}/approve`),

  // ===== CẤP PHÁT THUỐC =====
  dispenseMedication: async (prescriptionId, dispenseData) => axios.post(`/api/prescriptions/${prescriptionId}/dispense`, dispenseData),
  getDispenseHistory: async (prescriptionId) => axios.get(`/api/prescriptions/${prescriptionId}/dispense-history`),

  // ===== KIỂM TRA AN TOÀN =====
  checkDrugInteractions: async (medications) => axios.post('/api/prescriptions/check-interactions', { medications }),
  checkPatientAllergies: async (patientId, medications) => axios.post(`/api/prescriptions/${patientId}/check-allergies`, { medications }),
  getDosageSuggestions: async (medicationId, patientData) => axios.get(`/api/medications/${medicationId}/dosage-suggestions`, { params: patientData }),

  // ===== DANH MỤC THUỐC =====
  searchMedications: async (query, filters = {}) => axios.get('/api/medications/search', { params: { q: query, ...filters } }),
  getMedications: async (params = {}) => axios.get('/api/medications', { params }),
  getMedicationById: async (id) => axios.get(`/api/medications/${id}`),
  searchByActiveIngredient: async (ingredient) => axios.get('/api/medications/search', { params: { activeIngredient: ingredient } }),

  // ===== CẢNH BÁO =====
  getLowStockAlerts: async () => axios.get('/api/medications/low-stock'),
  getExpiringMedications: async (days = 30) => axios.get('/api/medications/expiring', { params: { days } }),
  getRecalledMedications: async () => axios.get('/api/medications/recalls'),
};

export default prescriptionAPI;