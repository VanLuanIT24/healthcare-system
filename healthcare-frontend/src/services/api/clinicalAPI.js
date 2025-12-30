// src/api/clinicalAPI.js - API Lâm sàng (Phiên bản đầy đủ 2025 - Liên kết: Create consultation → Add diagnosis → Prescription/Lab order)
import axios from '../axios';

const clinicalAPI = {
  // ===== BUỔI KHÁM =====
  createConsultation: async (patientId, data) => axios.post(`/api/patients/${patientId}/consultations`, data),
  getConsultation: async (id) => axios.get(`/api/consultations/${id}`),
  updateConsultation: async (id, data) => axios.put(`/api/consultations/${id}`, data),
  completeConsultation: async (id) => axios.patch(`/api/consultations/${id}/complete`),
  approveConsultation: async (id) => axios.patch(`/api/consultations/${id}/approve`),

  recordSymptoms: async (consultationId, symptoms) => axios.post(`/api/consultations/${consultationId}/symptoms`, { symptoms }),
  recordPhysicalExam: async (consultationId, exam) => axios.post(`/api/consultations/${consultationId}/physical-exam`, exam),
  addDiagnosis: async (consultationId, diagnosis) => axios.post(`/api/consultations/${consultationId}/diagnoses`, diagnosis),
  getPatientConsultations: async (patientId, params = {}) => axios.get(`/api/patients/${patientId}/consultations`, { params }),

  // ===== CHẨN ĐOÁN =====
  searchICD10: async (query) => axios.get('/api/icd10/search', { params: { q: query } }),
  getPatientDiagnoses: async (patientId, params = {}) => axios.get(`/api/patients/${patientId}/diagnoses`, { params }),

  // ===== KẾ HOẠCH & GHI CHÚ =====
  createTreatmentPlan: async (patientId, plan) => axios.post(`/api/patients/${patientId}/treatment-plans`, plan),
  recordProgressNote: async (patientId, note) => axios.post(`/api/patients/${patientId}/progress-notes`, note),
  recordNursingNote: async (patientId, note) => axios.post(`/api/patients/${patientId}/nursing-notes`, note),

  // ===== HỒ SƠ =====
  getMedicalRecord: async (patientId) => axios.get(`/api/patients/${patientId}/medical-record`),
  exportMedicalRecordPDF: async (patientId) => axios.get(`/api/patients/${patientId}/medical-record/export/pdf`, { responseType: 'blob' }),

  // ===== DẤU HIỆU SINH TỒN =====
  recordVitalSigns: async (patientId, vitals) => axios.post(`/api/patients/${patientId}/vital-signs`, vitals),
  getVitalSignsHistory: async (patientId, params = {}) => axios.get(`/api/patients/${patientId}/vital-signs`, { params }),
  getVitalSignsTrend: async (patientId, type, days = 90) => axios.get(`/api/patients/${patientId}/vital-signs/trend`, { params: { type, days } }),

  // ===== MẪU =====
  getClinicalTemplates: async (specialty = '') => axios.get('/api/clinical/templates', { params: { specialty } }),
  saveClinicalTemplate: async (template) => axios.post('/api/clinical/templates', template),

  // ===== AUDIT =====
  getConsultationAccessLogs: async (consultationId) => axios.get(`/api/consultations/${consultationId}/access-logs`),
};

export default clinicalAPI;