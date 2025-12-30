import axios from '../axios';

const API_URL = '/api/v1/admin/beds';

export const bedAPI = {
  // Get all beds with filters
  getBeds: (params = {}) => {
    return axios.get(API_URL, { params });
  },

  // Get bed by ID
  getBedById: (bedId) => {
    return axios.get(`${API_URL}/${bedId}`);
  },

  // Get beds by department
  getBedsByDepartment: (departmentId) => {
    return axios.get(`${API_URL}?department_id=${departmentId}`);
  },

  // Create new bed
  createBed: (data) => {
    return axios.post(API_URL, data);
  },

  // Bulk create beds
  bulkCreateBeds: (departmentId, data) => {
    return axios.post(`/api/v1/admin/departments/${departmentId}/beds/bulk`, data);
  },

  // Update bed
  updateBed: (bedId, data) => {
    return axios.put(`${API_URL}/${bedId}`, data);
  },

  // Update bed status
  updateBedStatus: (bedId, status) => {
    return axios.patch(`${API_URL}/${bedId}/status`, { status });
  },

  // Assign bed to patient
  assignBedToPatient: (bedId, patientId, admissionDate) => {
    return axios.patch(`${API_URL}/${bedId}/assign`, { patient_id: patientId, admission_date: admissionDate });
  },

  // Release bed (discharge patient)
  releaseBed: (bedId, dischargeDate) => {
    return axios.patch(`${API_URL}/${bedId}/release`, { discharge_date: dischargeDate });
  },

  // Get bed statistics
  getBedStats: (departmentId = null) => {
    if (departmentId) {
      return axios.get(`/api/v1/admin/departments/${departmentId}/beds/stats`);
    }
    return axios.get(`${API_URL}/stats`);
  },

  // Get available beds
  getAvailableBeds: (params = {}) => {
    return axios.get(`${API_URL}/available`, { params });
  },

  // Delete bed
  deleteBed: (bedId) => {
    return axios.delete(`${API_URL}/${bedId}`);
  },

  // Get bed occupancy history
  getBedHistory: (bedId) => {
    return axios.get(`${API_URL}/${bedId}/history`);
  },
};

// Legacy API (for compatibility)
export const getBeds = (params) => bedAPI.getBeds(params);
export const getBedById = (id) => bedAPI.getBedById(id);
export const createBed = (data) => bedAPI.createBed(data);
export const updateBedStatus = (bedId, status) => bedAPI.updateBedStatus(bedId, status);
export const assignBedToPatient = (bedId, patientId) => bedAPI.assignBedToPatient(bedId, patientId);
export const transferBed = (bedId, newBedId) => axios.patch(`${API_URL}/${bedId}/transfer`, { newBedId });
export const dischargeBed = (bedId) => bedAPI.releaseBed(bedId, new Date());
export const getAvailableBeds = (params) => bedAPI.getAvailableBeds(params);
export const getBedStats = (params) => bedAPI.getBedStats(null);

// Default export
export default bedAPI;
