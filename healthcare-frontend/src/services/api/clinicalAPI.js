// 🩺 Clinical & Medical Records API
import axios from '../axios';

const clinicalAPI = {
  // Consultations
  createConsultation: async (consultationData) => {
    return await axios.post('/clinical/consultations', consultationData);
  },

  getConsultation: async (id) => {
    return await axios.get(`/clinical/consultations/${id}`);
  },

  updateConsultation: async (id, consultationData) => {
    return await axios.put(`/clinical/consultations/${id}`, consultationData);
  },

  // Diagnoses
  createDiagnosis: async (diagnosisData) => {
    return await axios.post('/clinical/diagnoses', diagnosisData);
  },

  getDiagnosis: async (id) => {
    return await axios.get(`/clinical/diagnoses/${id}`);
  },

  updateDiagnosis: async (id, diagnosisData) => {
    return await axios.put(`/clinical/diagnoses/${id}`, diagnosisData);
  },

  // Medical Records
  createMedicalRecord: async (recordData) => {
    return await axios.post('/medical-records', recordData);
  },

  getMedicalRecord: async (id) => {
    return await axios.get(`/medical-records/${id}`);
  },

  updateMedicalRecord: async (id, recordData) => {
    return await axios.put(`/medical-records/${id}`, recordData);
  },

  getMedicalRecords: async (params) => {
    return await axios.get('/medical-records', { params });
  },

  // Vital Signs
  recordVitalSigns: async (recordId, vitalSignsData) => {
    return await axios.post(`/medical-records/${recordId}/vital-signs`, vitalSignsData);
  },

  getVitalSigns: async (recordId) => {
    return await axios.get(`/medical-records/${recordId}/vital-signs`);
  },

  // Progress Notes
  addProgressNote: async (recordId, noteData) => {
    return await axios.post(`/medical-records/${recordId}/progress-notes`, noteData);
  },

  getProgressNotes: async (recordId) => {
    return await axios.get(`/medical-records/${recordId}/progress-notes`);
  },

  // ICD-10 Code Search
  searchICD10: async (query) => {
    return await axios.get('/clinical/icd10/search', { params: { q: query } });
  },
};

export default clinicalAPI;
