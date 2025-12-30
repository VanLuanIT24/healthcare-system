// src/api/patientAPI.js - API Quản lý Bệnh nhân (Phiên bản đầy đủ 2025 - Liên kết workflow: Tạo hồ sơ → Đặt lịch → Nhập viện → Xuất viện)
import axios from '../axios';

const patientAPI = {
  // ===== QUẢN LÝ BỆNH NHÂN CƠ BẢN =====
  registerPatient: async (patientData) => axios.post('/api/patients/register', patientData),
  searchPatients: async (query, filters = {}) => axios.get('/api/patients/search', { params: { q: query, ...filters } }),
  advancedSearch: async (searchParams) => axios.post('/api/patients/advanced-search', searchParams),
  getPatients: async (params = {}) => axios.get('/api/patients', { params }),
  getPatientById: async (patientId) => axios.get(`/api/patients/${patientId}`),
  getPatientSensitiveData: async (patientId, emergencyReason = null) => axios.get(`/api/patients/${patientId}/sensitive`, { params: { emergency: !!emergencyReason, reason: emergencyReason } }),
  updatePatient: async (patientId, patientData) => axios.put(`/api/patients/${patientId}`, patientData),
  deletePatient: async (patientId) => axios.delete(`/api/patients/${patientId}`),

  // ===== NHẬP / XUẤT VIỆN =====
  admitPatient: async (patientId, admissionData) => axios.post(`/api/patients/${patientId}/admit`, admissionData),
  dischargePatient: async (patientId, dischargeData) => axios.post(`/api/patients/${patientId}/discharge`, dischargeData),

  // ===== TÀI LIỆU & HÌNH ẢNH =====
  getPatientDocuments: async (patientId) => axios.get(`/api/patients/${patientId}/documents`),
  uploadPatientDocument: async (patientId, formData) => axios.post(`/api/patients/${patientId}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deletePatientDocument: async (patientId, documentId) => axios.delete(`/api/patients/${patientId}/documents/${documentId}`),

  // ===== BẢO HIỂM =====
  getPatientInsurance: async (patientId) => axios.get(`/api/patients/${patientId}/insurance`),
  updatePatientInsurance: async (patientId, insuranceData) => axios.put(`/api/patients/${patientId}/insurance`, insuranceData),

  // ===== DỊ ỨNG =====
  getPatientAllergies: async (patientId) => axios.get(`/api/patients/${patientId}/allergies`),
  addPatientAllergy: async (patientId, allergyData) => axios.post(`/api/patients/${patientId}/allergies`, allergyData),
  updatePatientAllergy: async (patientId, allergyId, allergyData) => axios.put(`/api/patients/${patientId}/allergies/${allergyId}`, allergyData),
  deletePatientAllergy: async (patientId, allergyId) => axios.delete(`/api/patients/${patientId}/allergies/${allergyId}`),

  // ===== TIỀN SỬ GIA ĐÌNH =====
  getPatientFamilyHistory: async (patientId) => axios.get(`/api/patients/${patientId}/family-history`),
  addFamilyHistory: async (patientId, historyData) => axios.post(`/api/patients/${patientId}/family-history`, historyData),
  updateFamilyHistory: async (patientId, historyId, historyData) => axios.put(`/api/patients/${patientId}/family-history/${historyId}`, historyData),
  deleteFamilyHistory: async (patientId, historyId) => axios.delete(`/api/patients/${patientId}/family-history/${historyId}`),

  // ===== NGƯỜI LIÊN HỆ KHẨN CẤP =====
  getEmergencyContacts: async (patientId) => axios.get(`/api/patients/${patientId}/emergency-contacts`),
  addEmergencyContact: async (patientId, contactData) => axios.post(`/api/patients/${patientId}/emergency-contacts`, contactData),
  updateEmergencyContact: async (patientId, contactId, contactData) => axios.put(`/api/patients/${patientId}/emergency-contacts/${contactId}`, contactData),
  deleteEmergencyContact: async (patientId, contactId) => axios.delete(`/api/patients/${patientId}/emergency-contacts/${contactId}`),

  // ===== ĐỒNG Ý CHIA SẺ DỮ LIỆU =====
  getPatientConsents: async (patientId) => axios.get(`/api/patients/${patientId}/consents`),
  addPatientConsent: async (patientId, consentData) => axios.post(`/api/patients/${patientId}/consents`, consentData),

  // ===== XUẤT / IN =====
  exportPatientRecordPDF: async (patientId) => axios.get(`/api/patients/${patientId}/export-pdf`, { responseType: 'blob' }),
  generatePatientQRCode: async (patientId) => axios.get(`/api/patients/${patientId}/qrcode`),

  // ===== AUDIT & THỐNG KÊ =====
  getPatientAccessLogs: async (patientId, params = {}) => axios.get(`/api/patients/${patientId}/access-logs`, { params }),
  getPatientStats: async () => axios.get('/api/patients/stats'),
  getPatientStatistics: async (patientId) => axios.get(`/api/patients/${patientId}/statistics`),

  // ===== LIÊN KẾT MODULE KHÁC =====
  getPatientAppointments: async (patientId, params) => axios.get(`/api/patients/${patientId}/appointments`, { params }),
  getPatientMedicalRecords: async (patientId, params) => axios.get(`/api/patients/${patientId}/medical-records`, { params }),
  getPatientPrescriptions: async (patientId, params) => axios.get(`/api/patients/${patientId}/prescriptions`, { params }),
  getPatientBills: async (patientId, params) => axios.get(`/api/patients/${patientId}/bills`, { params }),
  getPatientLabResults: async (patientId, params) => axios.get(`/api/patients/${patientId}/lab-results`, { params }),
};

export default patientAPI;