// 🔌 Patient Management API Extensions
import axios from '../axios';

const patientExtendedAPI = {
  // Insurance Management
  getPatientInsurance: async (patientId) => {
    return await axios.get(`/patients/${patientId}/insurance`);
  },

  updatePatientInsurance: async (patientId, insuranceData) => {
    return await axios.put(`/patients/${patientId}/insurance`, insuranceData);
  },

  deletePatientInsurance: async (patientId, insuranceId) => {
    return await axios.delete(`/patients/${patientId}/insurance/${insuranceId}`);
  },

  // Allergies Management
  getPatientAllergies: async (patientId) => {
    return await axios.get(`/patients/${patientId}/allergies`);
  },

  addPatientAllergy: async (patientId, allergyData) => {
    return await axios.post(`/patients/${patientId}/allergies`, allergyData);
  },

  updatePatientAllergy: async (patientId, allergyId, allergyData) => {
    return await axios.put(`/patients/${patientId}/allergies/${allergyId}`, allergyData);
  },

  deletePatientAllergy: async (patientId, allergyId) => {
    return await axios.delete(`/patients/${patientId}/allergies/${allergyId}`);
  },

  // Family History
  getPatientFamilyHistory: async (patientId) => {
    return await axios.get(`/patients/${patientId}/family-history`);
  },

  addFamilyHistory: async (patientId, historyData) => {
    return await axios.post(`/patients/${patientId}/family-history`, historyData);
  },

  updateFamilyHistory: async (patientId, historyId, historyData) => {
    return await axios.put(`/patients/${patientId}/family-history/${historyId}`, historyData);
  },

  deleteFamilyHistory: async (patientId, historyId) => {
    return await axios.delete(`/patients/${patientId}/family-history/${historyId}`);
  },

  // Emergency Contacts
  getEmergencyContacts: async (patientId) => {
    return await axios.get(`/patients/${patientId}/emergency-contacts`);
  },

  addEmergencyContact: async (patientId, contactData) => {
    return await axios.post(`/patients/${patientId}/emergency-contacts`, contactData);
  },

  updateEmergencyContact: async (patientId, contactId, contactData) => {
    return await axios.put(`/patients/${patientId}/emergency-contacts/${contactId}`, contactData);
  },

  deleteEmergencyContact: async (patientId, contactId) => {
    return await axios.delete(`/patients/${patientId}/emergency-contacts/${contactId}`);
  },

  // Advanced Search
  advancedSearch: async (searchParams) => {
    return await axios.post('/patients/advanced-search', searchParams);
  },

  // Patient Statistics
  getPatientStatistics: async (patientId) => {
    return await axios.get(`/patients/${patientId}/statistics`);
  },
};

export default patientExtendedAPI;
