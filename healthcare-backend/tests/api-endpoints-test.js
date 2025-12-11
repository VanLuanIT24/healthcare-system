// 🧪 Healthcare System - API Endpoints Test File
// Import and use these test cases to verify all endpoints work correctly

const axios = require('axios');

// ⚙️ Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const headers = {
  'Authorization': 'Bearer YOUR_TOKEN_HERE',
  'Content-Type': 'application/json'
};

/**
 * 🚀 TEST SUITE FOR BILLING ENDPOINTS
 */
const BillingTests = {
  
  // 1. List all bills
  getAllBills: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/billing`, {
        params: { page: 1, limit: 10, ...params },
        headers
      });
      console.log('✅ GET /billing', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ GET /billing failed:', error.message);
    }
  },

  // 2. Get specific bill
  getBill: async (billId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/billing/${billId}`, {
        headers
      });
      console.log('✅ GET /billing/{billId}', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ GET /billing/{billId} failed:', error.message);
    }
  },

  // 3. Create bill
  createBill: async (billData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/billing`, billData, {
        headers
      });
      console.log('✅ POST /billing', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ POST /billing failed:', error.message);
    }
  },

  // 4. Update bill
  updateBill: async (billId, updateData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/billing/${billId}`, updateData, {
        headers
      });
      console.log('✅ PUT /billing/{billId}', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ PUT /billing/{billId} failed:', error.message);
    }
  },

  // 5. Get payment history
  getPaymentHistory: async (billId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/billing/${billId}/payment-history`, {
        headers
      });
      console.log('✅ GET /billing/{billId}/payment-history', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ GET /billing/{billId}/payment-history failed:', error.message);
    }
  },

  // 6. Refund payment
  refundPayment: async (paymentId, refundData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/billing/payments/${paymentId}/refund`,
        refundData,
        { headers }
      );
      console.log('✅ POST /billing/payments/{paymentId}/refund', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ POST /billing/payments/{paymentId}/refund failed:', error.message);
    }
  },

  // 7. Get outstanding bills
  getOutstandingBills: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/billing/outstanding`, {
        params: { page: 1, limit: 10 },
        headers
      });
      console.log('✅ GET /billing/outstanding', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ GET /billing/outstanding failed:', error.message);
    }
  },

  // 8. Get revenue stats
  getRevenueStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/billing/revenue-stats`, {
        headers
      });
      console.log('✅ GET /billing/revenue-stats', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ GET /billing/revenue-stats failed:', error.message);
    }
  }
};

/**
 * 🚀 TEST SUITE FOR APPOINTMENT ENDPOINTS
 */
const AppointmentTests = {
  
  // 1. Check-in appointment
  checkInAppointment: async (appointmentId) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/appointments/${appointmentId}/check-in`,
        {},
        { headers }
      );
      console.log('✅ PATCH /appointments/{id}/check-in', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ PATCH /appointments/{id}/check-in failed:', error.message);
    }
  },

  // 2. Complete appointment
  completeAppointment: async (appointmentId, notes = '') => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/appointments/${appointmentId}/complete`,
        { notes },
        { headers }
      );
      console.log('✅ PATCH /appointments/{id}/complete', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ PATCH /appointments/{id}/complete failed:', error.message);
    }
  },

  // 3. Get available slots
  getAvailableSlots: async (doctorId, date) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/appointments/available-slots`, {
        params: { doctorId, date },
        headers
      });
      console.log('✅ GET /appointments/available-slots', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ GET /appointments/available-slots failed:', error.message);
    }
  },

  // 4. Get appointment statistics
  getAppointmentStats: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/appointments/stats`, {
        params,
        headers
      });
      console.log('✅ GET /appointments/stats', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ GET /appointments/stats failed:', error.message);
    }
  }
};

/**
 * 🚀 TEST SUITE FOR MEDICATION ENDPOINTS
 */
const MedicationTests = {
  
  // 1. Get inventory report
  getInventory: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/medications/inventory`, {
        params: { page: 1, limit: 20, ...params },
        headers
      });
      console.log('✅ GET /medications/inventory', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ GET /medications/inventory failed:', error.message);
    }
  }
};

/**
 * 🧪 RUN TESTS
 */
async function runAllTests() {
  console.log('\n📋 ============ STARTING API TESTS ============\n');

  // Test Billing
  console.log('\n💰 BILLING API TESTS\n');
  await BillingTests.getAllBills();
  await BillingTests.getRevenueStats();
  await BillingTests.getOutstandingBills();

  // Test Appointments
  console.log('\n📅 APPOINTMENT API TESTS\n');
  // Note: Replace with actual IDs
  // await AppointmentTests.getAvailableSlots('doctor_id', '2025-12-15');
  await AppointmentTests.getAppointmentStats();

  // Test Medications
  console.log('\n💊 MEDICATION API TESTS\n');
  await MedicationTests.getInventory();

  console.log('\n✅ ============ TESTS COMPLETED ============\n');
}

// Export for use in other test files
module.exports = {
  BillingTests,
  AppointmentTests,
  MedicationTests,
  runAllTests
};

// Uncomment to run tests
// runAllTests().catch(console.error);
