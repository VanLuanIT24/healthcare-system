/**
 * 🏥 ADMIN API SERVICE
 * Centralized API calls for Admin Portal
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with interceptor
const apiClient = axios.create({
  baseURL: API_BASE_URL
});

// Add response interceptor to handle 401 errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ [API] 401 Unauthorized - Token expired or invalid');
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // Redirect to login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper to get auth headers
const getAuthHeaders = () => {
  // Try both 'token' and 'accessToken' keys for backward compatibility
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  if (!token) {
    console.error('❌ [API] No token found in localStorage');
    throw new Error('Authentication token not found. Please login again.');
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// ============================================
// 📊 DASHBOARD APIS
// ============================================

export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStats: async () => {
    const response = await apiClient.get(
      '/admin/dashboard/stats',
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get revenue chart data (7 days)
   */
  getRevenueChart: async () => {
    const response = await apiClient.get(
      `${API_BASE_URL}/admin/dashboard/revenue-chart`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get department statistics
   */
  getDepartmentStats: async () => {
    const response = await apiClient.get(
      `${API_BASE_URL}/admin/dashboard/department-stats`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get patient distribution
   * @param {string} type - 'admission', 'gender', or 'age'
   */
  getPatientDistribution: async (type = 'admission') => {
    const response = await apiClient.get(
      `${API_BASE_URL}/admin/dashboard/patient-distribution?type=${type}`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get recent activities
   * @param {number} limit - Number of activities to fetch
   */
  getRecentActivities: async (limit = 15) => {
    const response = await apiClient.get(
      `${API_BASE_URL}/admin/dashboard/recent-activities?limit=${limit}`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get system health
   */
  getSystemHealth: async () => {
    const response = await apiClient.get(
      `${API_BASE_URL}/admin/system-health`,
      getAuthHeaders()
    );
    return response.data;
  }
};

// ============================================
// 👥 STAFF (USER) APIS
// ============================================

export const staffApi = {
  /**
   * Get list of staff members
   */
  getList: async (params = {}) => {
    const { page = 1, limit = 10, role, status, department, search } = params;
    
    // Build params object, only include role if explicitly provided
    const queryParams = {
      page,
      limit
    };
    
    if (role) queryParams.role = role;
    if (status) queryParams.status = status;
    if (department) queryParams.department = department;
    if (search) queryParams.search = search;
    
    const response = await apiClient.get(`${API_BASE_URL}/users`, {
      ...getAuthHeaders(),
      params: queryParams
    });
    return response.data;
  },

  /**
   * Get staff member by ID
   */
  getById: async (userId) => {
    const response = await apiClient.get(
      `${API_BASE_URL}/users/${userId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Create new staff member
   */
  create: async (staffData) => {
    const response = await apiClient.post(
      `${API_BASE_URL}/users`,
      staffData,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Update staff member
   */
  update: async (userId, updateData) => {
    const response = await apiClient.put(
      `${API_BASE_URL}/users/${userId}`,
      updateData,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Disable staff member
   */
  disable: async (userId, reason) => {
    const response = await apiClient.patch(
      `${API_BASE_URL}/users/${userId}/disable`,
      { reason },
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Enable staff member
   */
  enable: async (userId) => {
    const response = await apiClient.patch(
      `${API_BASE_URL}/users/${userId}/enable`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Delete staff member (soft delete)
   */
  delete: async (userId, reason) => {
    const response = await apiClient.delete(
      `${API_BASE_URL}/users/${userId}`,
      {
        ...getAuthHeaders(),
        data: { reason }
      }
    );
    return response.data;
  },

  /**
   * Get user statistics
   */
  getStatistics: async () => {
    const response = await apiClient.get(
      `${API_BASE_URL}/users/stats/overview`,
      getAuthHeaders()
    );
    return response.data;
  }
};

// ============================================
// 🏥 PATIENT APIS
// ============================================

export const patientApi = {
  /**
   * Search patients
   */
  search: async (params = {}) => {
    const { keyword = '', page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    
    // Only send keyword if it's not empty
    const searchParams = {
      page,
      limit,
      sortBy,
      sortOrder
    };
    if (keyword && keyword.trim()) {
      searchParams.keyword = keyword.trim();
    }
    
    const response = await apiClient.get(`${API_BASE_URL}/patients/search`, {
      ...getAuthHeaders(),
      params: searchParams
    });
    return response.data;
  },

  /**
   * Register new patient
   */
  register: async (patientData) => {
    const response = await apiClient.post(
      `${API_BASE_URL}/patients/register`,
      patientData,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get patient demographics
   */
  getDemographics: async (patientId) => {
    const response = await apiClient.get(
      `${API_BASE_URL}/patients/${patientId}/demographics`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Update patient demographics
   */
  updateDemographics: async (patientId, updateData) => {
    const response = await apiClient.put(
      `${API_BASE_URL}/patients/${patientId}/demographics`,
      updateData,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Admit patient
   */
  admit: async (patientId, admissionData) => {
    const response = await apiClient.post(
      `${API_BASE_URL}/patients/${patientId}/admit`,
      admissionData,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Discharge patient
   */
  discharge: async (patientId, dischargeData) => {
    const response = await apiClient.post(
      `${API_BASE_URL}/patients/${patientId}/discharge`,
      dischargeData,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get patient insurance
   */
  getInsurance: async (patientId) => {
    const response = await apiClient.get(
      `${API_BASE_URL}/patients/${patientId}/insurance`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Update patient insurance
   */
  updateInsurance: async (patientId, insuranceData) => {
    const response = await apiClient.put(
      `${API_BASE_URL}/patients/${patientId}/insurance`,
      insuranceData,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get patient allergies
   */
  getAllergies: async (patientId) => {
    const response = await apiClient.get(
      `${API_BASE_URL}/patients/${patientId}/allergies`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Update patient allergies
   */
  updateAllergies: async (patientId, allergiesData) => {
    const response = await apiClient.put(
      `${API_BASE_URL}/patients/${patientId}/allergies`,
      allergiesData,
      getAuthHeaders()
    );
    return response.data;
  }
};

// ============================================
// 📅 APPOINTMENT APIS
// ============================================

export const appointmentApi = {
  /**
   * Get appointments list
   */
  getList: async (params = {}) => {
    const { page = 1, limit = 10, status, startDate, endDate, doctorId, patientId } = params;
    
    // Use search/advanced endpoint as main list endpoint doesn't exist
    const response = await apiClient.get(`${API_BASE_URL}/appointments/search/advanced`, {
      ...getAuthHeaders(),
      params: {
        page,
        limit,
        status,
        startDate,
        endDate,
        doctorId,
        patientId
      }
    });
    return response.data;
  },

  /**
   * Get appointment by ID
   */
  getById: async (appointmentId) => {
    const response = await apiClient.get(
      `${API_BASE_URL}/appointments/${appointmentId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Create appointment
   */
  create: async (appointmentData) => {
    const response = await apiClient.post(
      `${API_BASE_URL}/appointments`,
      appointmentData,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Update appointment
   */
  update: async (appointmentId, updateData) => {
    const response = await apiClient.put(
      `${API_BASE_URL}/appointments/${appointmentId}`,
      updateData,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Cancel appointment
   */
  cancel: async (appointmentId, reason) => {
    const response = await apiClient.patch(
      `${API_BASE_URL}/appointments/${appointmentId}/cancel`,
      { reason },
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Complete appointment
   */
  complete: async (appointmentId) => {
    const response = await apiClient.patch(
      `${API_BASE_URL}/appointments/${appointmentId}/complete`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get doctor schedule
   */
  getDoctorSchedule: async (doctorId, date) => {
    const response = await apiClient.get(`${API_BASE_URL}/appointments/schedule/${doctorId}`, {
      ...getAuthHeaders(),
      params: { date }
    });
    return response.data;
  }
};

// ============================================
// 💰 BILLING APIS
// ============================================

export const billingApi = {
  /**
   * Get bills list
   */
  getList: async (params = {}) => {
    const { page = 1, limit = 10, status, startDate, endDate, patientId } = params;
    
    // Backend billing routes require patientId, so return empty if not provided
    // TODO: Create a general billing list endpoint in backend
    if (!patientId) {
      console.warn('[BILLING API] patientId required - returning empty list');
      return {
        success: true,
        data: { bills: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0 } }
      };
    }
    
    const response = await apiClient.get(`${API_BASE_URL}/billing/patients/${patientId}/bills`, {
      ...getAuthHeaders(),
      params: {
        page,
        limit,
        status,
        startDate,
        endDate
      }
    });
    return response.data;
  },

  /**
   * Get bill by ID
   */
  getById: async (billId) => {
    const response = await apiClient.get(
      `${API_BASE_URL}/billing/${billId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Create bill
   */
  create: async (billData) => {
    const response = await apiClient.post(
      `${API_BASE_URL}/billing`,
      billData,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Update bill
   */
  update: async (billId, updateData) => {
    const response = await apiClient.put(
      `${API_BASE_URL}/billing/${billId}`,
      updateData,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Process payment
   */
  processPayment: async (billId, paymentData) => {
    const response = await apiClient.post(
      `${API_BASE_URL}/billing/${billId}/payment`,
      paymentData,
      getAuthHeaders()
    );
    return response.data;
  }
};

// ============================================
// 🧪 LABORATORY APIS
// ============================================

export const laboratoryApi = {
  /**
   * Get lab orders
   */
  getOrders: async (params = {}) => {
    const { page = 1, limit = 10, status, patientId } = params;
    
    const response = await apiClient.get(`${API_BASE_URL}/laboratory/orders`, {
      ...getAuthHeaders(),
      params: {
        page,
        limit,
        status,
        patientId
      }
    });
    return response.data;
  },

  /**
   * Get lab statistics
   */
  getStats: async () => {
    const response = await apiClient.get(
      `${API_BASE_URL}/laboratory/stats`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get lab order by ID
   */
  getOrderById: async (orderId) => {
    const response = await apiClient.get(
      `${API_BASE_URL}/laboratory/orders/${orderId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Create lab order
   */
  createOrder: async (orderData) => {
    const response = await apiClient.post(
      `${API_BASE_URL}/laboratory/orders`,
      orderData,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Update lab result
   */
  updateResult: async (orderId, resultData) => {
    const response = await apiClient.put(
      `${API_BASE_URL}/laboratory/orders/${orderId}/result`,
      resultData,
      getAuthHeaders()
    );
    return response.data;
  }
};

// ============================================
// 💊 PHARMACY APIS
// ============================================

export const pharmacyApi = {
  /**
   * Get medications list
   */
  getMedications: async (params = {}) => {
    const { page = 1, limit = 10, search, category, status } = params;
    
    const response = await apiClient.get(`${API_BASE_URL}/medications`, {
      ...getAuthHeaders(),
      params: {
        page,
        limit,
        search,
        category,
        status
      }
    });
    return response.data;
  },

  /**
   * Get medication statistics
   */
  getStats: async () => {
    const response = await apiClient.get(
      `${API_BASE_URL}/medications/stats`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get medication by ID
   */
  getMedicationById: async (medicationId) => {
    const response = await apiClient.get(
      `${API_BASE_URL}/medications/${medicationId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Create medication
   */
  createMedication: async (medicationData) => {
    const response = await apiClient.post(
      `${API_BASE_URL}/medications`,
      medicationData,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Update medication
   */
  updateMedication: async (medicationId, updateData) => {
    const response = await apiClient.put(
      `${API_BASE_URL}/medications/${medicationId}`,
      updateData,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Update medication stock
   */
  updateStock: async (medicationId, stockData) => {
    const response = await apiClient.post(
      `${API_BASE_URL}/medications/${medicationId}/stock`,
      stockData,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Delete medication
   */
  deleteMedication: async (medicationId) => {
    const response = await apiClient.delete(
      `${API_BASE_URL}/medications/${medicationId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get prescriptions
   */
  getPrescriptions: async (params = {}) => {
    const { page = 1, limit = 10, status, patientId } = params;
    
    const response = await apiClient.get(`${API_BASE_URL}/prescriptions`, {
      ...getAuthHeaders(),
      params: {
        page,
        limit,
        status,
        patientId
      }
    });
    return response.data;
  },

  /**
   * Get pending prescriptions
   */
  getPending: async () => {
    const response = await apiClient.get(
      `${API_BASE_URL}/prescriptions?status=PENDING`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get prescription by ID
   */
  getById: async (prescriptionId) => {
    const response = await apiClient.get(
      `${API_BASE_URL}/prescriptions/${prescriptionId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Dispense prescription
   */
  dispense: async (prescriptionId, dispensedBy) => {
    const response = await apiClient.patch(
      `${API_BASE_URL}/prescriptions/${prescriptionId}/dispense`,
      { dispensedBy },
      getAuthHeaders()
    );
    return response.data;
  }
};

// Export helper function
export { getAuthHeaders };

export default {
  dashboard: dashboardApi,
  staff: staffApi,
  patient: patientApi,
  appointment: appointmentApi,
  billing: billingApi,
  laboratory: laboratoryApi,
  pharmacy: pharmacyApi
};
