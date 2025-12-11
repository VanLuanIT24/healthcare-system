// 🔌 Clinical Workflow API Extensions
import axios from '../axios';

const clinicalExtendedAPI = {
  // Progress Notes
  addProgressNote: async (recordId, noteData) => {
    return await axios.post(`/medical-records/${recordId}/progress-notes`, noteData);
  },

  getProgressNotes: async (recordId) => {
    return await axios.get(`/medical-records/${recordId}/progress-notes`);
  },

  updateProgressNote: async (recordId, noteId, noteData) => {
    return await axios.put(`/medical-records/${recordId}/progress-notes/${noteId}`, noteData);
  },

  deleteProgressNote: async (recordId, noteId) => {
    return await axios.delete(`/medical-records/${recordId}/progress-notes/${noteId}`);
  },

  // Diagnosis Management (ICD-10)
  searchICD10: async (query) => {
    return await axios.get('/clinical/icd10/search', { params: { query } });
  },

  createDiagnosis: async (diagnosisData) => {
    return await axios.post('/clinical/diagnoses', diagnosisData);
  },

  updateDiagnosis: async (diagnosisId, diagnosisData) => {
    return await axios.put(`/clinical/diagnoses/${diagnosisId}`, diagnosisData);
  },

  getPatientDiagnoses: async (patientId) => {
    return await axios.get(`/patients/${patientId}/diagnoses`);
  },

  deleteDiagnosis: async (diagnosisId) => {
    return await axios.delete(`/clinical/diagnoses/${diagnosisId}`);
  },

  // Vital Signs
  recordVitalSigns: async (recordId, vitalSignsData) => {
    return await axios.post(`/medical-records/${recordId}/vital-signs`, vitalSignsData);
  },

  getPatientVitalSigns: async (patientId, params) => {
    return await axios.get(`/patients/${patientId}/vital-signs`, { params });
  },

  getVitalSignsTrend: async (patientId, vitalType, days = 30) => {
    return await axios.get(`/patients/${patientId}/vital-signs/trend`, {
      params: { vitalType, days },
    });
  },

  // Consultation History
  getConsultationHistory: async (patientId, params) => {
    return await axios.get(`/patients/${patientId}/consultations`, { params });
  },

  getConsultationDetails: async (consultationId) => {
    return await axios.get(`/clinical/consultations/${consultationId}`);
  },

  // Recent Medical Records
  getRecentMedicalRecords: async (params) => {
    return await axios.get('/medical-records/recent', { params });
  },

  // Clinical Templates
  getClinicalTemplates: async (type) => {
    return await axios.get('/clinical/templates', { params: { type } });
  },

  saveClinicalTemplate: async (templateData) => {
    return await axios.post('/clinical/templates', templateData);
  },
};

export default clinicalExtendedAPI;
