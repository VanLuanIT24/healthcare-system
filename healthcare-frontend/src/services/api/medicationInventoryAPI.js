// src/services/api/medicationInventoryAPI.js
import axios from '../axios';

const API_URL = '/api/v1/admin/medications';

export const medicationInventoryAPI = {
  // Get all medications
  getMedications: (params = {}) => {
    return axios.get(API_URL, { params });
  },

  // Get medication by ID
  getMedicationById: (medicationId) => {
    return axios.get(`${API_URL}/${medicationId}`);
  },

  // Create new medication
  createMedication: (data) => {
    return axios.post(API_URL, data);
  },

  // Update medication
  updateMedication: (medicationId, data) => {
    return axios.put(`${API_URL}/${medicationId}`, data);
  },

  // Update medication stock
  updateStock: (medicationId, quantity, type = 'add') => {
    return axios.patch(`${API_URL}/${medicationId}/stock`, { quantity, type });
  },

  // Batch update stock (import/export)
  batchUpdateStock: (data) => {
    return axios.post(`${API_URL}/batch/stock-update`, data);
  },

  // Delete medication
  deleteMedication: (medicationId) => {
    return axios.delete(`${API_URL}/${medicationId}`);
  },

  // Get low stock medications
  getLowStockMedications: (threshold = null) => {
    return axios.get(`${API_URL}/low-stock`, { params: { threshold } });
  },

  // Get expired medications
  getExpiredMedications: () => {
    return axios.get(`${API_URL}/expired`);
  },

  // Get medication statistics
  getInventoryStats: () => {
    return axios.get(`${API_URL}/stats`);
  },

  // Get medication history
  getMedicationHistory: (medicationId) => {
    return axios.get(`${API_URL}/${medicationId}/history`);
  },

  // Export medication report
  exportInventoryReport: (format = 'pdf') => {
    return axios.get(`${API_URL}/export`, { params: { format }, responseType: 'blob' });
  },

  // Get medications by department (for prescriptions)
  getMedicationsByDepartment: (departmentId) => {
    return axios.get(`/api/v1/admin/departments/${departmentId}/medications`);
  },

  // Adjust stock (for manual adjustment)
  adjustStock: (medicationId, newQuantity, reason) => {
    return axios.patch(`${API_URL}/${medicationId}/adjust`, { new_quantity: newQuantity, reason });
  },
};

export default medicationInventoryAPI;
