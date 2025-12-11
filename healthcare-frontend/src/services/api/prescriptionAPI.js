// 💊 Prescription & Medication API
import axios from '../axios';

const prescriptionAPI = {
  // Prescriptions
  createPrescription: async (prescriptionData) => {
    return await axios.post('/prescriptions', prescriptionData);
  },

  getPrescription: async (id) => {
    return await axios.get(`/prescriptions/${id}`);
  },

  updatePrescription: async (id, prescriptionData) => {
    return await axios.put(`/prescriptions/${id}`, prescriptionData);
  },

  getPrescriptions: async (params) => {
    return await axios.get('/prescriptions', { params });
  },

  // Dispense medication
  dispenseMedication: async (prescriptionId, dispenseData) => {
    return await axios.post(`/prescriptions/${prescriptionId}/dispense`, dispenseData);
  },

  // Check drug interactions
  checkDrugInteractions: async (medications) => {
    return await axios.post('/prescriptions/check-interactions', { medications });
  },

  // Medications
  getMedications: async (params) => {
    return await axios.get('/medications', { params });
  },

  getMedicationById: async (id) => {
    return await axios.get(`/medications/${id}`);
  },

  createMedication: async (medicationData) => {
    return await axios.post('/medications', medicationData);
  },

  updateMedication: async (id, medicationData) => {
    return await axios.put(`/medications/${id}`, medicationData);
  },

  deleteMedication: async (id) => {
    return await axios.delete(`/medications/${id}`);
  },

  // Medication inventory
  getMedicationInventory: async (params) => {
    return await axios.get('/medications/inventory', { params });
  },

  updateMedicationStock: async (id, stockData) => {
    return await axios.patch(`/medications/${id}/stock`, stockData);
  },

  // Low stock alerts
  getLowStockAlerts: async () => {
    return await axios.get('/medications/low-stock');
  },

  // Expiring medications
  getExpiringMedications: async (days = 30) => {
    return await axios.get('/medications/expiring', { params: { days } });
  },

  // Search medications
  searchMedications: async (query) => {
    return await axios.get('/medications/search', { params: { q: query } });
  },
};

export default prescriptionAPI;
