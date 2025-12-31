// src/api/clinicalAPI.js - API Lâm sàng (Phiên bản đầy đủ 2025 - Liên kết: Create consultation → Add diagnosis → Prescription/Lab order)
import axios from '../axios';

const clinicalAPI = {
  // ===== BUỔI KHÁM =====
  createConsultation: async (patientId, data) => axios.post(`/patients/${patientId}/consultations`, data),
  getConsultation: async (id) => axios.get(`/consultations/${id}`),
  updateConsultation: async (id, data) => axios.put(`/consultations/${id}`, data),
  completeConsultation: async (id) => axios.patch(`/consultations/${id}/complete`),
  approveConsultation: async (id) => axios.patch(`/consultations/${id}/approve`),

  recordSymptoms: async (consultationId, symptoms) => axios.post(`/consultations/${consultationId}/symptoms`, { symptoms }),
  recordPhysicalExam: async (consultationId, exam) => axios.post(`/consultations/${consultationId}/physical-exam`, exam),
  addDiagnosis: async (consultationId, diagnosis) => axios.post(`/consultations/${consultationId}/diagnoses`, diagnosis),
  getPatientConsultations: async (patientId, params = {}) => axios.get(`/patients/${patientId}/consultations`, { params }),

  // ===== CHẨN ĐOÁN =====
  searchICD10: async (query) => axios.get('/icd10/search', { params: { q: query } }),
  getPatientDiagnoses: async (patientId, params = {}) => axios.get(`/patients/${patientId}/diagnoses`, { params }),

  // ===== KẾ HOẠCH & GHI CHÚ =====
  createTreatmentPlan: async (patientId, plan) => axios.post(`/patients/${patientId}/treatment-plans`, plan),
  recordProgressNote: async (patientId, note) => axios.post(`/patients/${patientId}/progress-notes`, note),
  recordNursingNote: async (patientId, note) => axios.post(`/patients/${patientId}/nursing-notes`, note),

  // ===== HỒ SƠ =====
  getMedicalRecord: async (patientId) => axios.get(`/patients/${patientId}/medical-record`),
  exportMedicalRecordPDF: async (patientId) => axios.get(`/patients/${patientId}/medical-record/export/pdf`, { responseType: 'blob' }),

  // ===== DẤU HIỆU SINH TỒN =====
  recordVitalSigns: async (patientId, vitals) => axios.post(`/patients/${patientId}/vital-signs`, vitals),
  getVitalSignsHistory: async (patientId, params = {}) => axios.get(`/patients/${patientId}/vital-signs`, { params }),
  getVitalSignsTrend: async (patientId, type, days = 90) => axios.get(`/patients/${patientId}/vital-signs/trend`, { params: { type, days } }),

  // ===== MẪU =====
  getClinicalTemplates: async (specialty = '') => axios.get('/clinical/templates', { params: { specialty } }),
  saveClinicalTemplate: async (template) => axios.post('/clinical/templates', template),

  // ===== AUDIT =====
  getConsultationAccessLogs: async (consultationId) => axios.get(`/consultations/${consultationId}/access-logs`),
};

export default clinicalAPI;