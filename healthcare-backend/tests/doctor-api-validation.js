const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Mock admin token (you need to get actual token from backend)
let adminToken = '';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test configuration
const tests = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper functions
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const testResult = (testName, passed, message = '') => {
  if (passed) {
    tests.passed++;
    log(`✅ PASS: ${testName}`, 'green');
  } else {
    tests.failed++;
    log(`❌ FAIL: ${testName}`, 'red');
    if (message) log(`   ${message}`, 'yellow');
    tests.errors.push({ test: testName, message });
  }
};

const apiCall = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    const status = error.response?.status;
    return { success: false, data: error.response?.data, status, message };
  }
};

// Main test suite
async function runTests() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║  Doctor Management API Validation Tests                ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝\n', 'cyan');

  // Step 1: Get admin token (login as super admin)
  log('STEP 1: Authenticating as Super Admin...', 'blue');
  const loginResponse = await apiCall('POST', '/api/auth/login', {
    email: 'superadmin@hospital.com',
    password: 'SuperAdmin@123'
  });

  if (loginResponse.success && loginResponse.data?.data?.accessToken) {
    adminToken = loginResponse.data.data.accessToken;
    testResult('Admin Authentication', true);
  } else {
    testResult('Admin Authentication', false, loginResponse.message);
    log('\n❌ Cannot proceed without admin token', 'red');
    return;
  }

  // Step 2: Test GET /api/admin/doctors (List doctors)
  log('\n\nSTEP 2: Testing Doctor List Endpoint...', 'blue');
  const listResponse = await apiCall('GET', '/api/admin/doctors?page=1&limit=10');
  testResult('GET /api/admin/doctors', listResponse.success);
  if (listResponse.success) {
    const paginationCheck = listResponse.data?.data && Array.isArray(listResponse.data.data);
    testResult('Response has doctor array', paginationCheck);
    if (paginationCheck) {
      log(`   Found ${listResponse.data.data.length} doctors`, 'cyan');
    }
  }

  // Step 3: Test GET /api/admin/doctors/stats (All doctors stats)
  log('\n\nSTEP 3: Testing Doctor Stats Endpoint...', 'blue');
  const statsResponse = await apiCall('GET', '/api/admin/doctors/stats');
  testResult('GET /api/admin/doctors/stats', statsResponse.success);
  if (statsResponse.success && statsResponse.data?.data) {
    const hasStats = 'totalDoctors' in statsResponse.data.data;
    testResult('Response has statistics', hasStats);
  }

  // Step 4: Test filters in GET /api/admin/doctors
  log('\n\nSTEP 4: Testing Doctor List Filters...', 'blue');
  
  // Get specialties first
  const specialtiesResponse = await apiCall('GET', '/api/public/specialties');
  if (specialtiesResponse.success && specialtiesResponse.data?.data?.length > 0) {
    const specialtyId = specialtiesResponse.data.data[0]._id;
    const filterResponse = await apiCall('GET', `/api/admin/doctors?specialty_id=${specialtyId}`);
    testResult(`Filter by specialty (${specialtyId})`, filterResponse.success);
  }

  // Get departments
  const departmentsResponse = await apiCall('GET', '/api/public/departments');
  if (departmentsResponse.success && departmentsResponse.data?.data?.length > 0) {
    const departmentId = departmentsResponse.data.data[0]._id;
    const filterResponse = await apiCall('GET', `/api/admin/doctors?department_id=${departmentId}`);
    testResult(`Filter by department (${departmentId})`, filterResponse.success);
  }

  // Test search
  const searchResponse = await apiCall('GET', '/api/admin/doctors?search=doctor');
  testResult('Search by name/email', searchResponse.success);

  // Step 5: Test GET /api/admin/doctors/:id (Get single doctor)
  log('\n\nSTEP 5: Testing Get Doctor Detail...', 'blue');
  if (listResponse.success && listResponse.data?.data?.length > 0) {
    const doctorId = listResponse.data.data[0]._id;
    const detailResponse = await apiCall('GET', `/api/admin/doctors/${doctorId}`);
    testResult('GET /api/admin/doctors/:id', detailResponse.success);
    if (detailResponse.success) {
      const hasProfile = detailResponse.data?.data?._id === doctorId;
      testResult('Response includes doctor data', hasProfile);
    }
  }

  // Step 6: Test POST /api/admin/doctors (Create doctor) - Skip for now
  log('\n\nSTEP 6: Testing Create Doctor...', 'blue');
  log('   (Skipping - requires valid file upload)', 'yellow');

  // Step 7: Test PUT /api/admin/doctors/:id (Update doctor)
  log('\n\nSTEP 7: Testing Update Doctor...', 'blue');
  if (listResponse.success && listResponse.data?.data?.length > 0) {
    const doctorId = listResponse.data.data[0]._id;
    const updateResponse = await apiCall('PUT', `/api/admin/doctors/${doctorId}`, {
      personalInfo: {
        phone: '0123456789'
      }
    });
    testResult('PUT /api/admin/doctors/:id', updateResponse.success, updateResponse.message);
  }

  // Step 8: Test PATCH /api/admin/doctors/:id/disable (Disable doctor)
  log('\n\nSTEP 8: Testing Disable Doctor...', 'blue');
  if (listResponse.success && listResponse.data?.data?.length > 0) {
    const doctorId = listResponse.data.data[0]._id;
    const disableResponse = await apiCall('PATCH', `/api/admin/doctors/${doctorId}/disable`, {});
    testResult('PATCH /api/admin/doctors/:id/disable', disableResponse.success, disableResponse.message);
  }

  // Step 9: Test PATCH /api/admin/doctors/:id/enable (Enable doctor)
  log('\n\nSTEP 9: Testing Enable Doctor...', 'blue');
  if (listResponse.success && listResponse.data?.data?.length > 0) {
    const doctorId = listResponse.data.data[0]._id;
    const enableResponse = await apiCall('PATCH', `/api/admin/doctors/${doctorId}/enable`, {});
    testResult('PATCH /api/admin/doctors/:id/enable', enableResponse.success, enableResponse.message);
  }

  // Step 10: Test GET /api/admin/doctors/:id/stats (Doctor individual stats)
  log('\n\nSTEP 10: Testing Doctor Individual Stats...', 'blue');
  if (listResponse.success && listResponse.data?.data?.length > 0) {
    const doctorId = listResponse.data.data[0]._id;
    const doctorStatsResponse = await apiCall('GET', `/api/admin/doctors/${doctorId}/stats`);
    testResult('GET /api/admin/doctors/:id/stats', doctorStatsResponse.success);
  }

  // Step 11: Test specialty endpoints
  log('\n\nSTEP 11: Testing Specialty Management...', 'blue');
  
  // Get a doctor and a specialty
  if (listResponse.success && listResponse.data?.data?.length > 0 && specialtiesResponse.success) {
    const doctorId = listResponse.data.data[0]._id;
    const specialtyId = specialtiesResponse.data.data[0]._id;
    
    if (specialtyId) {
      // Test add specialty
      const addResponse = await apiCall('POST', `/api/admin/doctors/${doctorId}/specialties`, {
        specialtyId: specialtyId
      });
      testResult('POST /api/admin/doctors/:id/specialties', addResponse.success, addResponse.message);
      
      // Test remove specialty (if add succeeded)
      if (addResponse.success) {
        const removeResponse = await apiCall('DELETE', `/api/admin/doctors/${doctorId}/specialties/${specialtyId}`);
        testResult('DELETE /api/admin/doctors/:id/specialties/:sid', removeResponse.success, removeResponse.message);
      }
    }
  }

  // Step 12: Test public endpoints
  log('\n\nSTEP 12: Testing Public Filter Endpoints...', 'blue');
  
  const pubSpecialResponse = await apiCall('GET', '/api/public/specialties');
  testResult('GET /api/public/specialties', pubSpecialResponse.success);
  
  const pubDeptResponse = await apiCall('GET', '/api/public/departments');
  testResult('GET /api/public/departments', pubDeptResponse.success);

  // Final report
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║  Test Results Summary                                  ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝\n', 'cyan');
  
  log(`✅ Passed: ${tests.passed}`, 'green');
  log(`❌ Failed: ${tests.failed}`, tests.failed > 0 ? 'red' : 'green');
  
  if (tests.errors.length > 0) {
    log('\n📋 Failed Tests Details:', 'yellow');
    tests.errors.forEach((error, i) => {
      log(`${i + 1}. ${error.test}`, 'yellow');
      if (error.message) {
        log(`   Error: ${error.message}`, 'yellow');
      }
    });
  }

  log(`\n📊 Total Tests: ${tests.passed + tests.failed}`, 'blue');
  log(`✅ Success Rate: ${Math.round((tests.passed / (tests.passed + tests.failed)) * 100)}%\n`, 
      tests.failed === 0 ? 'green' : 'yellow');

  process.exit(tests.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
