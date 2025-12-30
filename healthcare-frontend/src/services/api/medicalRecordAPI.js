// src/services/api/medicalRecordAPI.js - API Quản lý Hồ sơ Y tế
import axios from '../axios';

const medicalRecordAPI = {
  // ===== HỒ SƠ Y TẾ CỦA BỆNH NHÂN =====
  getPatientMedicalRecords: async (patientId, params = {}) =>
    axios.get(`/api/medical-records/patient/${patientId}`, { params }),
  
  getMedicalRecord: async (recordId) =>
    axios.get(`/api/medical-records/${recordId}`),

  // ===== DẤU HIỆU SINH TỒN =====
  getVitalSigns: async (patientId, params = {}) =>
    axios.get(`/api/medical-records/patient/${patientId}/vital-signs`, { params }),

  // ===== TIỀN SỬ BỆNH LÝ =====
  getMedicalHistory: async (patientId) =>
    axios.get(`/api/medical-records/patient/${patientId}/medical-history`),

  // ===== LỊCH SỬ PHẪU THUẬT =====
  getSurgicalHistory: async (patientId) =>
    axios.get(`/api/medical-records/patient/${patientId}/surgical-history`),

  // ===== DỊ ỨNG VÀ PHẢN ỨNG THUỐC =====
  getAllergies: async (patientId) =>
    axios.get(`/api/medical-records/patient/${patientId}/allergies`),

  // ===== XUẤT XUẤT =====
  exportPDF: async (patientId, params = {}) =>
    axios.get(`/api/medical-records/patient/${patientId}/export/pdf`, { 
      params, 
      responseType: 'blob' 
    }),

  exportExcel: async (patientId, params = {}) =>
    axios.get(`/api/medical-records/patient/${patientId}/export/excel`, { 
      params, 
      responseType: 'blob' 
    }),
};

export default medicalRecordAPI;
