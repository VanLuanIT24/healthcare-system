// 💊 Medication Management API
import axios from '../axios';

const medicationAPI = {
  // Get all medications with filters
  getMedications: async (params) => {
    return await axios.get('/medications', { params });
  },

  // Get medication by ID
  getMedicationById: async (id) => {
    return await axios.get(`/medications/${id}`);
  },

  // Get medication statistics
  getMedicationStats: async () => {
    return await axios.get('/medications/stats');
  },

  // Create new medication
  createMedication: async (medicationData) => {
    return await axios.post('/medications', medicationData);
  },

  // Update medication
  updateMedication: async (id, medicationData) => {
    return await axios.put(`/medications/${id}`, medicationData);
  },

  // Update medication stock
  updateMedicationStock: async (id, stockData) => {
    return await axios.post(`/medications/${id}/stock`, stockData);
  },

  // Delete medication (soft delete)
  deleteMedication: async (id) => {
    return await axios.delete(`/medications/${id}`);
  },

  // Get low stock medications
  getLowStockMedications: async (params) => {
    return await axios.get('/medications/low-stock', { params });
  },

  // Search medications
  searchMedications: async (query, limit = 20) => {
    return await axios.get('/medications/search', { 
      params: { q: query, limit } 
    });
  },

  // Restock medication (convenience method)
  restockMedication: async (id, stockData) => {
    return await axios.post(`/medications/${id}/stock`, {
      ...stockData,
      type: 'IN'
    });
  },

  // Dispense medication (convenience method)
  dispenseMedication: async (id, stockData) => {
    return await axios.post(`/medications/${id}/stock`, {
      ...stockData,
      type: 'OUT'
    });
  },

  // Get medication inventory report
  getMedicationInventory: async (params) => {
    return await axios.get('/medications', { 
      params: { ...params, status: 'ACTIVE' } 
    });
  },

  // Get expiring medications
  getExpiringMedications: async (days = 30) => {
    return await axios.get('/medications', { 
      params: { 
        expiringWithin: days,
        status: 'ACTIVE' 
      } 
    });
  },

  // Get medication categories
  getMedicationCategories: async () => {
    // This could be enhanced with backend endpoint
    return {
      data: {
        categories: [
          'ANTIBIOTIC',
          'ANALGESIC',
          'ANTIHYPERTENSIVE',
          'ANTIDIABETIC',
          'ANTACID',
          'ANTIHISTAMINE',
          'ANTIVIRAL',
          'VACCINE',
          'VITAMIN',
          'SUPPLEMENT',
          'OTHER'
        ]
      }
    };
  },
};

export default medicationAPI;
