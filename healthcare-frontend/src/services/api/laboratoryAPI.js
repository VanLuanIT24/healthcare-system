// 🔬 Laboratory API
import axios from '../axios';

const laboratoryAPI = {
  // Lab Orders
  orderLabTest: async (patientId, orderData) => {
    return await axios.post(`/laboratory/patients/${patientId}/lab-orders`, orderData);
  },

  createLabOrder: async (orderData) => {
    return await axios.post('/lab/orders', orderData);
  },

  getLabOrder: async (id) => {
    return await axios.get(`/laboratory/lab-orders/${id}`);
  },

  getLabOrders: async (params) => {
    return await axios.get('/laboratory/lab-orders', { params });
  },

  updateLabOrder: async (id, orderData) => {
    return await axios.put(`/laboratory/lab-orders/${id}`, orderData);
  },

  cancelLabOrder: async (id) => {
    return await axios.delete(`/laboratory/lab-orders/${id}/cancel`);
  },

  // Lab Results
  recordLabResult: async (orderId, resultData) => {
    return await axios.post(`/laboratory/lab-orders/${orderId}/results`, resultData);
  },

  getLabResult: async (resultId) => {
    return await axios.get(`/laboratory/lab-results/${resultId}`);
  },

  updateLabResult: async (orderId, testId, resultData) => {
    return await axios.patch(`/laboratory/lab-orders/${orderId}/results/${testId}`, resultData);
  },

  approveLabResult: async (orderId, testId) => {
    return await axios.post(`/laboratory/lab-orders/${orderId}/tests/${testId}/approve`);
  },

  // Test workflow status updates
  markSampleCollected: async (orderId, testId) => {
    return await axios.post(`/laboratory/lab-orders/${orderId}/tests/${testId}/collect`);
  },

  markTestInProgress: async (orderId, testId) => {
    return await axios.post(`/laboratory/lab-orders/${orderId}/tests/${testId}/start`);
  },

  // Lab Tests Catalog
  getLabTests: async (params) => {
    return await axios.get('/lab/tests', { params });
  },

  getLabTestById: async (id) => {
    return await axios.get(`/lab/tests/${id}`);
  },

  searchLabTests: async (query) => {
    return await axios.get('/lab/tests/search', { params: { q: query } });
  },

  // Lab Statistics
  getLabStats: async (params) => {
    return await axios.get('/lab/stats', { params });
  },

  // Pending collections
  getPendingCollections: async () => {
    return await axios.get('/lab/orders/pending-collection');
  },

  // In progress tests
  getInProgressTests: async () => {
    return await axios.get('/lab/orders/in-progress');
  },

  // Awaiting review
  getAwaitingReview: async () => {
    return await axios.get('/lab/results/awaiting-review');
  },

  // Specimen tracking
  updateSpecimenStatus: async (orderId, status) => {
    return await axios.patch(`/lab/orders/${orderId}/specimen-status`, { status });
  },
};

export default laboratoryAPI;
