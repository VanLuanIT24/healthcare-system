// src/api/medicationAPI.js - API Quản lý Thuốc (Phiên bản đầy đủ 2025 - Liên kết: Dispense → Adjust stock → Alerts)
import axios from '../axios';

// ===== DANH MỤC THUỐC =====
export const getMedications = async (params = {}) => axios.get('/medications', { params });
export const getMedicationById = async (id) => axios.get(`/medications/${id}`);
export const searchMedications = async (query, params = {}) => axios.get('/medications/search', { params: { q: query, ...params } });
export const createMedication = async (data) => axios.post('/medications', data);
export const updateMedication = async (id, data) => axios.put(`/medications/${id}`, data);

// ===== QUẢN LÝ TỒN KHO =====
export const adjustStock = async (id, data) => axios.post(`/medications/${id}/inventory/adjust`, data);
export const restockMedication = async (id, batchData) => axios.post(`/medications/${id}/inventory/in`, batchData);
export const writeOffMedication = async (id, data) => axios.post(`/medications/${id}/inventory/out`, data);

// ===== CẢNH BÁO =====
export const getLowStock = async () => axios.get('/medications/alerts/low-stock');
export const getExpiringSoon = async (days = 60) => axios.get('/medications/alerts/expiring', { params: { days } });
export const getRecalledMedications = async () => axios.get('/medications/alerts/recalls');

// ===== THỐNG KÊ =====
export const getInventoryValue = async () => axios.get('/medications/inventory/value');
export const getMedicationUsageStats = async (params = {}) => axios.get('/medications/stats/usage', { params });
export const exportInventoryExcel = async (params = {}) => axios.get('/medications/inventory/export/excel', { params, responseType: 'blob' });

const medicationAPI = {
    getMedications,
    getMedicationById,
    searchMedications,
    createMedication,
    updateMedication,
    adjustStock,
    restockMedication,
    writeOffMedication,
    getLowStock,
    getExpiringSoon,
    getRecalledMedications,
    getInventoryValue,
    getMedicationUsageStats,
    exportInventoryExcel
};

export default medicationAPI;