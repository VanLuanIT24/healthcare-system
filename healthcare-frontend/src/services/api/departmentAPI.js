import axios from '../axios';

const API_URL = '/admin/departments';

// Department Management API
export const departmentAPI = {
  // Get all departments
  getDepartments: (params = {}) => {
    return axios.get(API_URL, { params });
  },

  // Get department by ID
  getDepartmentById: (departmentId) => {
    return axios.get(`${API_URL}/${departmentId}`);
  },

  // Get department statistics
  getDepartmentStats: (departmentId = null) => {
    if (departmentId) {
      return axios.get(`${API_URL}/${departmentId}/stats`);
    }
    return axios.get(`${API_URL}/stats`);
  },

  // Create new department
  createDepartment: (data) => {
    return axios.post(API_URL, data);
  },

  // Update department
  updateDepartment: (departmentId, data) => {
    return axios.put(`${API_URL}/${departmentId}`, data);
  },

  // Assign department head
  assignDepartmentHead: (departmentId, userId) => {
    return axios.patch(`${API_URL}/${departmentId}/head`, { user_id: userId });
  },

  // Delete/Archive department
  deleteDepartment: (departmentId) => {
    return axios.delete(`${API_URL}/${departmentId}`);
  },

  // Get beds for department
  getDepartmentBeds: (departmentId) => {
    return axios.get(`${API_URL}/${departmentId}/beds`);
  },

  // Get doctors in department
  getDepartmentDoctors: (departmentId) => {
    return axios.get(`${API_URL}/${departmentId}/doctors`);
  },
};

// Legacy API (for compatibility)
export const getDepartments = (params) => departmentAPI.getDepartments(params);
export const getDepartmentById = (id) => departmentAPI.getDepartmentById(id);
export const createDepartment = (data) => departmentAPI.createDepartment(data);
export const updateDepartment = (id, data) => departmentAPI.updateDepartment(id, data);
export const deleteDepartment = (id) => departmentAPI.deleteDepartment(id);
export const assignStaffToDepartment = (departmentId, staffIds) => axios.post(`${API_URL}/${departmentId}/assign-staff`, { staffIds });
export const setHeadOfDepartment = (departmentId, userId) => departmentAPI.assignDepartmentHead(departmentId, userId);
