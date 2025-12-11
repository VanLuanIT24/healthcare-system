// 🏥 Patient Management API
import axios from '../axios';

const patientAPI = {
  // Register new patient
  registerPatient: async (patientData) => {
    return await axios.post('/patients/register', patientData);
  },

  // Search patients
  searchPatients: async (query, filters) => {
    return await axios.get('/patients/search', {
      params: { q: query, ...filters },
    });
  },

  // Get all patients
  getPatients: async (params) => {
    return await axios.get('/patients', { params });
  },

  // Get patient by ID
  getPatientById: async (id) => {
    return await axios.get(`/patients/${id}`);
  },

  // Update patient
  updatePatient: async (id, patientData) => {
    return await axios.put(`/patients/${id}`, patientData);
  },

  // Delete patient
  deletePatient: async (id) => {
    return await axios.delete(`/patients/${id}`);
  },

  // Get patient medical records
  getPatientMedicalRecords: async (id, params) => {
    return await axios.get(`/patients/${id}/medical-records`, { params });
  },

  // Get patient appointments
  getPatientAppointments: async (id, params) => {
    return await axios.get(`/patients/${id}/appointments`, { params });
  },

  // Get patient prescriptions
  getPatientPrescriptions: async (id, params) => {
    return await axios.get(`/patients/${id}/prescriptions`, { params });
  },

  // Get patient bills
  getPatientBills: async (id, params) => {
    return await axios.get(`/patients/${id}/bills`, { params });
  },

  // Get patient lab results
  getPatientLabResults: async (id, params) => {
    return await axios.get(`/patients/${id}/lab-results`, { params });
  },

  // Get patient statistics
  getPatientStats: async () => {
    return await axios.get('/patients/stats');
  },

  // Admit patient
  admitPatient: async (id, admissionData) => {
    return await axios.post(`/patients/${id}/admit`, admissionData);
  },

  // Discharge patient
  dischargePatient: async (id, dischargeData) => {
    return await axios.post(`/patients/${id}/discharge`, dischargeData);
  },

  // Get patient emergency contacts
  getEmergencyContacts: async (id) => {
    return await axios.get(`/patients/${id}/emergency-contacts`);
  },

  // Update emergency contacts
  updateEmergencyContacts: async (id, contacts) => {
    return await axios.put(`/patients/${id}/emergency-contacts`, { contacts });
  },

  // Get patient insurance info
  getInsuranceInfo: async (id) => {
    return await axios.get(`/patients/${id}/insurance`);
  },

  // Update insurance info
  updateInsuranceInfo: async (id, insuranceData) => {
    return await axios.put(`/patients/${id}/insurance`, insuranceData);
  },
};

export default patientAPI;
