// tests/remaining-functions-test.js
/**
 * 🧪 COMPLETE API TESTING - Test tất cả 59 hàm còn lại
 * Bao gồm: Admin, Auth, Billing, Medical Records, Patient, User Management
 */

const BASE_URL = 'http://localhost:5000/api';

const testData = {
  tokens: {},
  users: {},
  patients: {},
  appointments: {},
  medications: {},
  bills: {},
  medicalRecords: {},
  sessions: {}
};

let passedTests = 0;
let failedTests = 0;

function logTest(testName, passed, details = '', response = null) {
  if (passed) {
    passedTests++;
    console.log(`✅ ${testName}`);
    if (details) console.log(`   ${details}`);
  } else {
    failedTests++;
    console.log(`❌ ${testName}`);
    if (details) console.log(`   ${details}`);
    if (response && !passed) {
      const error = response.data?.error || response.data?.message || JSON.stringify(response.data);
      console.log(`   Error: ${error}`);
    }
  }
}

async function callAPI(method, endpoint, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options = { method, headers };
  if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Helper for multipart/form-data uploads
async function callAPIWithFile(method, endpoint, fileField, fileBuffer, fileName, token = null) {
  try {
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    
    // Append buffer with options
    formData.append(fileField, fileBuffer, {
      filename: fileName,
      contentType: 'image/png'
    });
    
    const headers = {
      ...formData.getHeaders()
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    // Use node http/https to properly stream form-data
    const https = await import('https');
    const http = await import('http');
    const { URL } = await import('url');
    
    return new Promise((resolve) => {
      const url = new URL(`${BASE_URL}${endpoint}`);
      const protocol = url.protocol === 'https:' ? https : http;
      
      const req = protocol.request({
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: headers
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({
              success: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              data: parsed
            });
          } catch (e) {
            resolve({
              success: false,
              error: 'Failed to parse response: ' + data
            });
          }
        });
      });
      
      req.on('error', (error) => {
        resolve({
          success: false,
          error: error.message
        });
      });
      
      formData.pipe(req);
    });
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ==========================================
// SETUP
// ==========================================
async function setup() {
  console.log('\n🚀 ===== SETUP =====\n');
  
  // Login SuperAdmin
  const loginRes = await callAPI('POST', '/auth/login', {
    email: 'superadmin@healthcare.vn',
    password: 'SuperSecurePassword123!'
  });
  
  if (!loginRes.success) {
    console.error('❌ Setup failed: Cannot login');
    console.error('Login response:', JSON.stringify(loginRes, null, 2));
    process.exit(1);
  }
  
  testData.tokens.superAdmin = loginRes.data.data.tokens.accessToken;
  testData.tokens.refreshToken = loginRes.data.data.tokens.refreshToken;
  console.log('✅ SuperAdmin logged in\n');
  
  // Create Doctor
  const doctorEmail = `doctor.test.${Date.now()}@healthcare.vn`;
  const doctorRes = await callAPI('POST', '/users', {
    email: doctorEmail,
    password: 'Doctor@123456',
    role: 'DOCTOR',
    personalInfo: {
      firstName: 'Dr. Test',
      lastName: 'Doctor',
      dateOfBirth: '1980-01-01',
      gender: 'MALE',
      phone: '+84901111111',
      address: { street: '123', city: 'HCM' }
    },
    professionalInfo: {
      specialization: 'Internal Medicine',
      licenseNumber: 'MD001',
      department: 'Nội Tổng Quát',
      qualifications: ['MD', 'PhD']
    }
  }, testData.tokens.superAdmin);
  
  if (doctorRes.success) {
    testData.users.doctor = { _id: doctorRes.data.data._id, email: doctorEmail };
    console.log('✅ Doctor created:', testData.users.doctor._id);
  }
  
  // Create Patient (FEMALE for obstetric history test)
  const patientRes = await callAPI('POST', '/patients/register', {
    email: `patient.test.${Date.now()}@gmail.com`,
    password: 'Patient@123456',
    firstName: 'Test',
    lastName: 'Patient',
    dateOfBirth: '1985-06-15',
    gender: 'FEMALE',
    phone: '+84912345678',
    address: {
      street: '123 Nguyễn Huệ',
      city: 'HCM',
      district: 'Q1',
      ward: 'P1'
    }
  }, testData.tokens.superAdmin);
  
  if (patientRes.success && patientRes.data.data) {
    const patient = patientRes.data.data;  // Nested data structure
    testData.patients.patient1 = {
      id: patient.patientId,
      _id: patient._id,
      userId: patient.userId ? (patient.userId._id || patient.userId) : null
    };
    console.log('✅ Patient created:', testData.patients.patient1.id);
  } else {
    console.error('❌ Patient creation failed:', patientRes);
  }
  
  // Create Medication
  const medRes = await callAPI('POST', '/medications', {
    name: 'Test Medication',
    genericName: 'Test Generic',
    type: 'TABLET',
    strength: { value: 500, unit: 'mg' },
    category: 'ANALGESIC',
    stock: { current: 1000, minimum: 10, maximum: 5000, unit: 'units', reorderLevel: 50 },
    pricing: { costPrice: 1000, sellingPrice: 2000, insurancePrice: 1800 }
  }, testData.tokens.superAdmin);
  
  if (medRes.success) {
    testData.medications.med1 = { _id: medRes.data.data._id };
    console.log('✅ Medication created:', testData.medications.med1._id);
  }
  
  // Create Appointment
  const appointmentDate = new Date();
  appointmentDate.setDate(appointmentDate.getDate() + 1);
  appointmentDate.setHours(10, 0, 0, 0);
  
  const apptRes = await callAPI('POST', '/appointments', {
    patientId: testData.patients.patient1.id,
    doctorId: testData.users.doctor._id,
    appointmentDate: appointmentDate.toISOString(),
    type: 'FOLLOW_UP',
    department: 'Nội Tổng Quát',
    reason: 'Test appointment'
  }, testData.tokens.superAdmin);
  
  if (apptRes.success) {
    testData.appointments.appt1 = { _id: apptRes.data.data._id };
    console.log('✅ Appointment created:', testData.appointments.appt1._id);
  }
  
  console.log('\n✅ Setup complete!\n');
}

// ==========================================
// 1. ADMIN CONTROLLER (7 hàm)
// ==========================================
async function testAdminController() {
  console.log('\n📊 ===== ADMIN CONTROLLER TESTS (7 functions) =====\n');
  
  const token = testData.tokens.superAdmin;
  
  // 1. Get Dashboard Stats
  const dashboardRes = await callAPI('GET', '/admin/dashboard/stats', null, token);
  logTest('ADMIN-1: Get Dashboard Stats', dashboardRes.success, '', dashboardRes);
  
  // 2. Get Revenue Chart
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);
  const endDate = new Date();
  
  const revenueRes = await callAPI('GET', `/admin/dashboard/revenue-chart?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, null, token);
  logTest('ADMIN-2: Get Revenue Chart', revenueRes.success, '', revenueRes);
  
  // 3. Get Department Stats
  const deptStatsRes = await callAPI('GET', '/admin/dashboard/department-stats', null, token);
  logTest('ADMIN-3: Get Department Stats', deptStatsRes.success, '', deptStatsRes);
  
  // 4. Get Patient Distribution
  const patientDistRes = await callAPI('GET', '/admin/dashboard/patient-distribution', null, token);
  logTest('ADMIN-4: Get Patient Distribution', patientDistRes.success, '', patientDistRes);
  
  // 5. Get Recent Activities
  const activitiesRes = await callAPI('GET', '/admin/dashboard/recent-activities?limit=10', null, token);
  logTest('ADMIN-5: Get Recent Activities', activitiesRes.success, '', activitiesRes);
  
  // 6. Get System Health
  const healthRes = await callAPI('GET', '/admin/system-health', null, token);
  logTest('ADMIN-6: Get System Health', healthRes.success, '', healthRes);
  
  console.log(`\n✅ Admin Tests: ${passedTests}/${failedTests + passedTests}\n`);
}

// ==========================================
// 2. AUTH CONTROLLER (10 hàm chưa test)
// ==========================================
async function testAuthController() {
  console.log('\n🔐 ===== AUTH CONTROLLER TESTS (10 functions) =====\n');
  
  const token = testData.tokens.superAdmin;
  
  // 1. Register User
  const registerEmail = `newuser.${Date.now()}@healthcare.vn`;
  const registerRes = await callAPI('POST', '/auth/register', {
    email: registerEmail,
    password: 'NewUser@123456',
    confirmPassword: 'NewUser@123456',
    role: 'NURSE',
    personalInfo: {
      firstName: 'New',
      lastName: 'User',
      dateOfBirth: '1990-01-01',
      gender: 'FEMALE',
      phone: '+84909999999'
    }
  });
  logTest('AUTH-1: Register User', registerRes.success, '', registerRes);
  
  if (registerRes.success) {
    testData.users.newUser = { _id: registerRes.data.data._id, email: registerEmail };
  }
  
  // 2. Change Password
  const changePassRes = await callAPI('POST', '/auth/change-password', {
    currentPassword: 'SuperSecurePassword123!',
    newPassword: 'NewSuperPassword123!',
    confirmPassword: 'NewSuperPassword123!'
  }, token);
  logTest('AUTH-2: Change Password', changePassRes.success, '', changePassRes);
  
  // Đổi lại password để tiếp tục test
  if (changePassRes.success) {
    await callAPI('POST', '/auth/change-password', {
      currentPassword: 'NewSuperPassword123!',
      newPassword: 'SuperSecurePassword123!',
      confirmPassword: 'SuperSecurePassword123!'
    }, token);
  }
  
  // 3. Forgot Password
  const forgotPassRes = await callAPI('POST', '/auth/forgot-password', {
    email: 'superadmin@healthcare.vn'
  });
  logTest('AUTH-3: Forgot Password', forgotPassRes.success, '', forgotPassRes);
  
  // 4. Get User Sessions
  const sessionsRes = await callAPI('GET', '/auth/sessions', null, token);
  logTest('AUTH-4: Get User Sessions', sessionsRes.success, '', sessionsRes);
  
  if (sessionsRes.success && sessionsRes.data.data?.sessions?.length > 0) {
    testData.sessions.session1 = sessionsRes.data.data.sessions[0]._id;
  }
  
  // 5. Health Check
  const healthRes = await callAPI('GET', '/auth/health', null, token);
  logTest('AUTH-5: Health Check', healthRes.success || healthRes.status === 200, '', healthRes);
  
  // 6. Logout
  const logoutRes = await callAPI('POST', '/auth/logout', {
    refreshToken: testData.tokens.refreshToken
  }, token);
  logTest('AUTH-6: Logout', logoutRes.success, '', logoutRes);
  
  // Login lại để tiếp tục test
  const reloginRes = await callAPI('POST', '/auth/login', {
    email: 'superadmin@healthcare.vn',
    password: 'SuperSecurePassword123!'
  });
  
  if (reloginRes.success) {
    testData.tokens.superAdmin = reloginRes.data.data.tokens.accessToken;
    testData.tokens.refreshToken = reloginRes.data.data.tokens.refreshToken;
  }
  
  // 7. Revoke Session - Create a fresh session
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s to avoid rate limit
  const extraLoginRes = await callAPI('POST', '/auth/login', {
    email: 'superadmin@healthcare.vn',
    password: 'SuperSecurePassword123!'
  });
  
  if (extraLoginRes.success) {
    // Use the sessionId from the new login
    const newSessionId = extraLoginRes.data.data?.sessionId;
    
    if (newSessionId) {
      // Revoke this newly created session
      const revokeRes = await callAPI('POST', `/auth/sessions/revoke`, { sessionId: newSessionId }, testData.tokens.superAdmin);
      logTest('AUTH-7: Revoke Session', revokeRes.success, '', revokeRes);
    } else {
      logTest('AUTH-7: Revoke Session', false, 'Session ID not found in login response');
    }
  } else {
    logTest('AUTH-7: Revoke Session', false, 'Could not create extra session');
  }
  
  // 8. Logout All Sessions
  const logoutAllRes = await callAPI('POST', '/auth/sessions/logout-all', {}, testData.tokens.superAdmin);
  logTest('AUTH-8: Logout All Sessions', logoutAllRes.success, '', logoutAllRes);
  
  // Login lại sau khi logout all
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s after logout all
  const finalLoginRes = await callAPI('POST', '/auth/login', {
    email: 'superadmin@healthcare.vn',
    password: 'SuperSecurePassword123!'
  });
  
  if (finalLoginRes.success) {
    testData.tokens.superAdmin = finalLoginRes.data.data.tokens.accessToken;
  }
  
  console.log(`\n✅ Auth Tests: ${passedTests}/${failedTests + passedTests}\n`);
}

// ==========================================
// 3. BILLING CONTROLLER (9 hàm)
// ==========================================
async function testBillingController() {
  console.log('\n💰 ===== BILLING CONTROLLER TESTS (9 functions) =====\n');
  
  if (!testData.patients.patient1) {
    console.log('⚠️ Skipping billing tests - missing patient\n');
    return;
  }
  
  const token = testData.tokens.superAdmin;
  const patientMongoId = String(testData.patients.patient1._id);  // Ensure it's a string
  console.log('💰 [DEBUG] Patient MongoDB ID for billing:', patientMongoId);
  
  // 1. Create Bill - Test with actual patient _id from DB
  console.log('💰 Testing bill creation with patient:', testData.patients.patient1);
  
  const billRes = await callAPI('POST', `/billing/patients/${patientMongoId}/bills`, {
    items: [
      {
        description: 'Phí khám bệnh',
        category: 'CONSULTATION',
        unitPrice: 200000,
        quantity: 1
      },
      {
        description: 'Xét nghiệm máu',
        category: 'LAB_TEST',
        unitPrice: 150000,
        quantity: 1
      }
    ],
    taxRate: 0,
    notes: 'Hóa đơn khám bệnh'
  }, token);
  
  console.log('💰 Bill creation response:', { 
    success: billRes.success, 
    status: billRes.status,
    error: billRes.error,
    hasData: !!billRes.data 
  });
  
  if (billRes.success && billRes.data) {
    const billData = billRes.data.data || billRes.data;
    testData.bills.bill1 = { _id: billData._id, billId: billData.billId };
    logTest('BILL-1: Create Bill', true, `ID: ${testData.bills.bill1.billId}`);
  } else {
    logTest('BILL-1: Create Bill', false, '', billRes);
  }
  
  if (!testData.bills.bill1) {
    console.log('⚠️ Skipping remaining billing tests\n');
    return;
  }
  
  const billId = testData.bills.bill1._id;
  
  // 2. Get Bill
  const getBillRes = await callAPI('GET', `/billing/bills/${billId}`, null, token);
  logTest('BILL-2: Get Bill', getBillRes.success, '', getBillRes);
  
  // 3. Update Bill
  const updateBillRes = await callAPI('PUT', `/billing/bills/${billId}`, {
    notes: 'Giảm giá 10k',
    taxRate: 0
  }, token);
  logTest('BILL-3: Update Bill', updateBillRes.success, '', updateBillRes);
  
  // 4. Get Patient Bills
  const patientBillsRes = await callAPI('GET', `/billing/patients/${patientMongoId}/bills`, null, token);
  logTest('BILL-4: Get Patient Bills', patientBillsRes.success, '', patientBillsRes);
  
  // 5. Process Payment
  const paymentRes = await callAPI('POST', `/billing/bills/${billId}/payments`, {
    paymentMethod: 'CASH',
    amount: 340000,
    notes: 'Thanh toán tiền mặt'
  }, token);
  logTest('BILL-5: Process Payment', paymentRes.success, '', paymentRes);
  
  // 6. Get Payment History
  const historyRes = await callAPI('GET', `/billing/patients/${patientMongoId}/payments`, null, token);
  logTest('BILL-6: Get Payment History', historyRes.success, '', historyRes);
  
  // 7. Get Revenue Stats
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);
  const endDate = new Date();
  
  const revenueRes = await callAPI('GET', `/billing/revenue/stats?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, null, token);
  logTest('BILL-7: Get Revenue Stats', revenueRes.success, '', revenueRes);
  
  // 8. Void Bill - Create new bill to void (can't void paid bill)
  const billToVoidRes = await callAPI('POST', `/billing/patients/${patientMongoId}/bills`, {
    items: [{
      description: 'Test bill for void',
      category: 'OTHER',
      unitPrice: 100000,
      quantity: 1
    }],
    taxRate: 0,
    notes: 'Bill to be voided'
  }, token);
  
  if (billToVoidRes.success && billToVoidRes.data) {
    const voidBillData = billToVoidRes.data.data || billToVoidRes.data;
    const voidBillId = voidBillData._id;
    
    console.log('💰 [DEBUG] Void bill ID:', voidBillId);
    console.log('💰 [DEBUG] Void request body:', { reason: 'Test void bill - This is a test reason for voiding' });
    
    const voidBillRes = await callAPI('PATCH', `/billing/bills/${voidBillId}/void`, {
      reason: 'Test void bill - This is a test reason for voiding'
    }, token);
    
    console.log('💰 [DEBUG] Void response:', JSON.stringify(voidBillRes, null, 2));
    logTest('BILL-8: Void Bill', voidBillRes.success, '', voidBillRes);
  } else {
    logTest('BILL-8: Void Bill', false, 'Cannot create bill to void', billToVoidRes);
  }
  
  console.log(`\n✅ Billing Tests: ${passedTests}/${failedTests + passedTests}\n`);
}

// ==========================================
// 4. APPOINTMENT CONTROLLER (9 hàm chưa test)
// ==========================================
async function testAppointmentController() {
  console.log('\n📅 ===== APPOINTMENT CONTROLLER TESTS (9 functions) =====\n');
  
  if (!testData.patients.patient1 || !testData.users.doctor) {
    console.log('⚠️ Skipping appointment tests - missing data\n');
    return;
  }
  
  const token = testData.tokens.superAdmin;
  const patientMongoId = testData.patients.patient1._id;  // Use MongoDB _id for appointments
  const doctorId = testData.users.doctor._id;
  
  // 1. Reschedule Appointment
  if (testData.appointments.appt1) {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 2);
    newDate.setHours(14, 0, 0, 0);
    
    const rescheduleRes = await callAPI('PUT', `/appointments/${testData.appointments.appt1._id}/reschedule`, {
      appointmentDate: newDate.toISOString(),
      reason: 'Bệnh nhân yêu cầu đổi lịch'
    }, token);
    logTest('APPT-1: Reschedule Appointment', rescheduleRes.success, '', rescheduleRes);
  }
  
  // 2. Search Appointments
  const searchRes = await callAPI('GET', `/appointments/search/advanced?patientId=${patientMongoId}`, null, token);
  logTest('APPT-2: Search Appointments', searchRes.success, '', searchRes);
  
  // 3. Get Department Appointments
  const deptRes = await callAPI('GET', '/appointments/department/Nội Tổng Quát', null, token);
  logTest('APPT-3: Get Department Appointments', deptRes.success, '', deptRes);
  
  // 4. Create Schedule
  const scheduleDate = new Date();
  scheduleDate.setDate(scheduleDate.getDate() + 7);
  
  const createScheduleRes = await callAPI('POST', '/appointments/schedules', {
    doctorId: doctorId,
    date: scheduleDate.toISOString(),
    timeSlots: [
      { startTime: '08:00', endTime: '09:00', isAvailable: true },
      { startTime: '09:00', endTime: '10:00', isAvailable: true },
      { startTime: '10:00', endTime: '11:00', isAvailable: true }
    ]
  }, token);
  
  let scheduleId = null;
  if (createScheduleRes.success && createScheduleRes.data) {
    // Try multiple possible paths for schedule ID
    scheduleId = createScheduleRes.data.data?._id || 
                 createScheduleRes.data.data?.id ||
                 createScheduleRes.data.data?.scheduleId ||
                 createScheduleRes.data._id;
    testData.schedules = { schedule1: scheduleId };
    console.log('📅 [APPT] Schedule created, ID:', scheduleId);
  }
  logTest('APPT-4: Create Schedule', createScheduleRes.success, scheduleId ? `ID: ${scheduleId}` : '', createScheduleRes);
  
  // 5. Get Doctor Schedule
  const getScheduleRes = await callAPI('GET', `/appointments/schedules/doctor/${doctorId}?date=${scheduleDate.toISOString().split('T')[0]}`, null, token);
  
  // Try to get schedule ID from GET if not from POST
  if (!scheduleId && getScheduleRes.success && getScheduleRes.data?.data) {
    const schedules = Array.isArray(getScheduleRes.data.data) ? getScheduleRes.data.data : [getScheduleRes.data.data];
    if (schedules.length > 0) {
      scheduleId = schedules[0]._id || schedules[0].id || schedules[0].scheduleId;
      testData.schedules = { schedule1: scheduleId };
      console.log('📅 [APPT] Schedule from GET, ID:', scheduleId);
    }
  }
  logTest('APPT-5: Get Doctor Schedule', getScheduleRes.success, '', getScheduleRes);
  
  // 6. Update Schedule
  if (scheduleId && testData.users.doctor) {
    const updateScheduleRes = await callAPI('PUT', `/appointments/schedules/${scheduleId}`, {
      doctorId: testData.users.doctor._id,
      date: scheduleDate.toISOString(),
      changes: {
        cancellations: [],
        reschedules: []
      },
      timeSlots: [
        { startTime: '08:00', endTime: '09:00', isAvailable: false },
        { startTime: '09:00', endTime: '10:00', isAvailable: true }
      ]
    }, token);
    logTest('APPT-6: Update Schedule', updateScheduleRes.success, '', updateScheduleRes);
  } else {
    logTest('APPT-6: Update Schedule', false, scheduleId ? 'No doctor data' : 'No schedule ID available');
  }
  
  // 7. Send Appointment Reminder (nếu có appointment)
  if (testData.appointments.appt1) {
    const reminderRes = await callAPI('POST', `/appointments/${testData.appointments.appt1._id}/reminder`, {}, token);
    logTest('APPT-7: Send Appointment Reminder', reminderRes.success, '', reminderRes);
  }
  
  // 8. Send Scheduled Reminders
  const scheduledRemindersRes = await callAPI('POST', '/appointments/reminders/send-scheduled', {}, token);
  logTest('APPT-8: Send Scheduled Reminders', scheduledRemindersRes.success, '', scheduledRemindersRes);
  
  console.log(`\n✅ Appointment Tests: ${passedTests}/${failedTests + passedTests}\n`);
}

// ==========================================
// 5. MEDICAL RECORD CONTROLLER (12 hàm chưa test)
// ==========================================
async function testMedicalRecordController() {
  console.log('\n📋 ===== MEDICAL RECORD CONTROLLER TESTS (12 functions) =====\n');
  
  if (!testData.patients.patient1 || !testData.users.doctor) {
    console.log('⚠️ Skipping medical record tests - missing data\n');
    return;
  }
  
  const token = testData.tokens.superAdmin;
  const patientMongoId = testData.patients.patient1._id;  // Use Patient MongoDB _id for fetching records
  const patientUserId = testData.patients.patient1.userId;  // Use User ID for vital signs
  const doctorId = testData.users.doctor._id;
  
  // Initialize if not exists
  if (!testData.medicalRecords) {
    testData.medicalRecords = {};
  }
  
  console.log('📋 [MR TEST] Medical record from PAT-3:', testData.medicalRecords.record1 ? `EXISTS (${testData.medicalRecords.record1._id})` : 'MISSING');
  
  // Tạo medical record nếu chưa có
  if (!testData.medicalRecords.record1) {
    console.log('📋 [MR TEST] Creating new medical record...');
    const recordRes = await callAPI('POST', '/medical-records', {
      patientId: patientUserId,
      doctorId: doctorId,
      department: 'Nội Tổng Quát',
      visitType: 'OUTPATIENT',
      chiefComplaint: 'Khám sức khỏe',
      historyOfPresentIllness: 'Bệnh nhân đến khám sức khỏe định kỳ'
    }, token);
    
    if (recordRes.success) {
      testData.medicalRecords.record1 = { _id: recordRes.data.data.recordId };
      console.log('✅ [MR TEST] Created record with recordId:', testData.medicalRecords.record1._id);
    } else {
      console.log('❌ [MR TEST] Failed to create:', recordRes.data?.error || recordRes.error);
    }
  }
  
  if (!testData.medicalRecords.record1) {
    console.log('⚠️ Cannot create medical record\n');
    return;
  }
  
  const recordId = testData.medicalRecords.record1._id;
  console.log('📋 [MR TEST] Using record ID for tests:', recordId);
  
  // 1. Update Medical Record with proper diagnoses structure
  const updateRes = await callAPI('PUT', `/medical-records/${recordId}`, {
    diagnoses: [{
      diagnosis: 'Khỏe mạnh',
      type: 'PRIMARY',
      certainty: 'CONFIRMED'
    }],
    treatmentPlan: {
      treatment: 'Không cần điều trị',
      notes: 'Bệnh nhân khỏe mạnh'
    }
  }, token);
  console.log('📋 [MR] Update result:', updateRes.success, 'Diagnoses:', updateRes.data?.data?.diagnoses);
  logTest('MR-1: Update Medical Record', updateRes.success, '', updateRes);
  
  // 2. Record Vital Signs - Service expects User _id (not Patient _id)
  const vitalRes = await callAPI('POST', `/medical-records/patient/${patientUserId}/vital-signs`, {
    bloodPressure: { systolic: 120, diastolic: 80 },
    heartRate: 72,
    temperature: 36.5,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    weight: 70,
    height: 170
  }, token);
  logTest('MR-2: Record Vital Signs', vitalRes.success, '', vitalRes);
  
  // 3. Get Vital Signs History
  const vitalHistoryRes = await callAPI('GET', `/medical-records/patient/${patientUserId}/vital-signs`, null, token);
  logTest('MR-3: Get Vital Signs History', vitalHistoryRes.success, '', vitalHistoryRes);
  
  // 4. Add Medical History
  const addHistoryRes = await callAPI('POST', `/medical-records/patient/${patientUserId}/medical-history`, {
    category: 'CHRONIC_CONDITION',
    condition: 'Tăng huyết áp',
    onsetDate: '2020-01-01',
    status: 'CHRONIC',
    notes: 'Đang điều trị thuốc'
  }, token);
  logTest('MR-4: Add Medical History', addHistoryRes.success, '', addHistoryRes);
  
  // 5. Get Medical History
  const getHistoryRes = await callAPI('GET', `/medical-records/patient/${patientUserId}/medical-history`, null, token);
  logTest('MR-5: Get Medical History', getHistoryRes.success, '', getHistoryRes);
  
  // 6. Add Surgical History
  const surgicalRes = await callAPI('POST', `/medical-records/patient/${patientUserId}/surgical-history`, {
    surgeryType: 'Cắt ruột thừa',
    surgeryDate: '2018-05-15',
    surgeon: 'Dr. Nguyễn Văn A',
    hospital: 'Bệnh viện Chợ Rẫy',
    complications: 'Không có biến chứng',
    notes: 'Hồi phục tốt'
  }, token);
  logTest('MR-6: Add Surgical History', surgicalRes.success, '', surgicalRes);
  
  // 7. Get Surgical History
  const getSurgicalRes = await callAPI('GET', `/medical-records/patient/${patientUserId}/surgical-history`, null, token);
  logTest('MR-7: Get Surgical History', getSurgicalRes.success, '', getSurgicalRes);
  
  // 8. Get Obstetric History
  const obstetricRes = await callAPI('GET', `/medical-records/patient/${patientUserId}/obstetric-history`, null, token);
  logTest('MR-8: Get Obstetric History', obstetricRes.success, '', obstetricRes);
  
  // 9. Record Clinical Findings
  const findingsRes = await callAPI('POST', `/medical-records/${recordId}/clinical-findings`, {
    findings: 'Không có bất thường',
    examination: 'Khám lâm sàng',
    department: 'Nội Tổng Quát',
    chiefComplaint: 'Khám lâm sàng định kỳ',
    recordedBy: doctorId
  }, token);
  logTest('MR-9: Record Clinical Findings', findingsRes.success, '', findingsRes);
  
  // 10. Search Medical Records By Diagnosis
  const searchRes = await callAPI('GET', '/medical-records/search?diagnosis=Khỏe mạnh', null, token);
  logTest('MR-10: Search Medical Records By Diagnosis', searchRes.success, '', searchRes);
  
  // 11. Get Medical Records Stats
  const statsRes = await callAPI('GET', '/medical-records/stats', null, token);
  logTest('MR-11: Get Medical Records Stats', statsRes.success, '', statsRes);
  
  // 12. Archive Medical Record
  const archiveRes = await callAPI('POST', `/medical-records/${recordId}/archive`, {
    reason: 'Test archive'
  }, token);
  logTest('MR-12: Archive Medical Record', archiveRes.success, '', archiveRes);
  
  console.log(`\n✅ Medical Record Tests: ${passedTests}/${failedTests + passedTests}\n`);
}

// ==========================================
// 6. MEDICATION CONTROLLER (9 hàm)
// ==========================================
async function testMedicationController() {
  console.log('\n💊 ===== MEDICATION CONTROLLER TESTS (9 functions) =====\n');
  
  const token = testData.tokens.superAdmin;
  
  // 1. Get All Medications
  const getAllRes = await callAPI('GET', '/medications?page=1&limit=10', null, token);
  logTest('MED-1: Get All Medications', getAllRes.success, '', getAllRes);
  
  // 2. Get Medication By ID
  if (testData.medications.med1) {
    const getByIdRes = await callAPI('GET', `/medications/${testData.medications.med1._id}`, null, token);
    logTest('MED-2: Get Medication By ID', getByIdRes.success, '', getByIdRes);
  } else {
    logTest('MED-2: Get Medication By ID', false, 'No medication available');
  }
  
  // 3. Get Medication Stats
  const statsRes = await callAPI('GET', '/medications/stats', null, token);
  logTest('MED-3: Get Medication Stats', statsRes.success, '', statsRes);
  
  // 4. Create Medication
  const createRes = await callAPI('POST', '/medications', {
    name: `Test Med ${Date.now()}`,
    category: 'ANTIBIOTIC',
    type: 'TABLET',
    stock: {
      current: 500,
      minimum: 50
    }
  }, token);
  let createdMedId = null;
  if (createRes.success && createRes.data.data) {
    createdMedId = createRes.data.data._id;
  }
  logTest('MED-4: Create Medication', createRes.success, '', createRes);
  
  // 5. Update Medication
  if (createdMedId) {
    const updateRes = await callAPI('PUT', `/medications/${createdMedId}`, {
      name: 'Updated Test Med',
      category: 'ANTIBIOTIC'
    }, token);
    logTest('MED-5: Update Medication', updateRes.success, '', updateRes);
  } else {
    logTest('MED-5: Update Medication', false, 'No medication to update');
  }
  
  // 6. Update Stock
  if (createdMedId) {
    const updateStockRes = await callAPI('POST', `/medications/${createdMedId}/stock`, {
      quantity: 100,
      type: 'IN',
      note: 'Test stock update'
    }, token);
    logTest('MED-6: Update Stock', updateStockRes.success, '', updateStockRes);
  } else {
    logTest('MED-6: Update Stock', false, 'No medication available');
  }
  
  // 7. Get Low Stock Medications
  const lowStockRes = await callAPI('GET', '/medications/low-stock', null, token);
  logTest('MED-7: Get Low Stock Medications', lowStockRes.success, '', lowStockRes);
  
  // 8. Search Medications
  const searchRes = await callAPI('GET', '/medications/search?q=Test', null, token);
  logTest('MED-8: Search Medications', searchRes.success, '', searchRes);
  
  // 9. Delete Medication
  if (createdMedId) {
    const deleteRes = await callAPI('DELETE', `/medications/${createdMedId}`, null, token);
    logTest('MED-9: Delete Medication', deleteRes.success, '', deleteRes);
  } else {
    logTest('MED-9: Delete Medication', false, 'No medication to delete');
  }
  
  console.log(`\n✅ Medication Tests: ${passedTests}/${failedTests + passedTests}\n`);
}

// ==========================================
// 7. PATIENT CONTROLLER (14 hàm)
// ==========================================
async function testPatientController() {
  console.log('\n🏥 ===== PATIENT CONTROLLER TESTS (12 functions) =====\n');
  
  if (!testData.patients.patient1) {
    console.log('⚠️ Skipping patient tests - missing patient\n');
    return;
  }
  
  const token = testData.tokens.superAdmin;
  const patientId = testData.patients.patient1.id;  // Use patient ID (BN...) not _id
  
  // 1. Get Patient Demographics
  const demoRes = await callAPI('GET', `/patients/${patientId}/demographics`, null, token);
  logTest('PAT-1: Get Patient Demographics', demoRes.success, '', demoRes);
  
  // 2. Update Patient Demographics
  const updateDemoRes = await callAPI('PUT', `/patients/${patientId}/demographics`, {
    address: {
      street: '456 Updated Street',
      city: 'HCM',
      district: 'Q1',
      ward: 'P1'
    }
  }, token);
  logTest('PAT-2: Update Patient Demographics', updateDemoRes.success, '', updateDemoRes);
  
  // 3. Admit Patient
  if (testData.users.doctor && testData.users.doctor._id) {
    // Dùng bed ID ngẫu nhiên để tránh conflict với test trước
    const bedId = `TEST-${Date.now() % 10000}`;
    const admitPayload = {
      department: 'Nội Tổng Quát',
      room: '101',
      bed: bedId,
      diagnosis: 'Viêm phổi cấp',
      attendingDoctor: testData.users.doctor._id,
      notes: 'Nhập viện điều trị'
    };
    const admitRes = await callAPI('POST', `/patients/${patientId}/admit`, admitPayload, token);
    logTest('PAT-3: Admit Patient', admitRes.success, '', admitRes);
    
    // Try to get medical record created by admission
    if (admitRes.success) {
      const patientUserId = testData.patients.patient1.userId;  // Use User ObjectId for medical records
      console.log('🔍 Fetching medical records for patient User ID:', patientUserId);
      const recordsRes = await callAPI('GET', `/medical-records/patient/${patientUserId}`, null, token);
      const records = recordsRes.data?.data?.medicalRecords || recordsRes.data?.data?.docs || recordsRes.data?.data || [];
      console.log('📋 Medical records response:', { 
        success: recordsRes.success, 
        count: Array.isArray(records) ? records.length : 'not array',
        firstRecordId: Array.isArray(records) && records.length > 0 ? records[0].recordId : 'none',
        firstMongoId: Array.isArray(records) && records.length > 0 ? records[0]._id : 'none'
      });
      if (recordsRes.success && Array.isArray(records) && records.length > 0) {
        testData.medicalRecords = { record1: { _id: records[0].recordId } };
        console.log('✅ Captured medical record ID (recordId):', testData.medicalRecords.record1._id);
      } else {
        console.log('⚠️  No medical records found after admission');
      }
    }
  } else {
    logTest('PAT-3: Admit Patient', false, 'No doctor available');
  }
  
  // 4. Discharge Patient
  const dischargeRes = await callAPI('POST', `/patients/${patientId}/discharge`, {
    dischargeReason: 'Đã khỏi bệnh',
    condition: 'RECOVERED',
    followUpInstructions: 'Về nhà nghỉ ngơi, tái khám sau 7 ngày'
  }, token);
  logTest('PAT-4: Discharge Patient', dischargeRes.success, '', dischargeRes);
  
  // 5. Get Patient Insurance
  const insuranceRes = await callAPI('GET', `/patients/${patientId}/insurance`, null, token);
  logTest('PAT-5: Get Patient Insurance', insuranceRes.success, '', insuranceRes);
  
  // 6. Update Patient Insurance
  const updateInsRes = await callAPI('PUT', `/patients/${patientId}/insurance`, {
    provider: 'BHYT',
    policyNumber: 'DN1234567890',
    effectiveDate: '2025-01-01',
    expirationDate: '2025-12-31'
  }, token);
  logTest('PAT-6: Update Patient Insurance', updateInsRes.success, '', updateInsRes);
  
  // 7. Get Patient Contacts
  const contactsRes = await callAPI('GET', `/patients/${patientId}/contacts`, null, token);
  logTest('PAT-7: Get Patient Contacts', contactsRes.success, '', contactsRes);
  
  // 8. Get Patient Allergies
  const allergiesRes = await callAPI('GET', `/patients/${patientId}/allergies`, null, token);
  logTest('PAT-8: Get Patient Allergies', allergiesRes.success, '', allergiesRes);
  
  // 9. Update Patient Allergies
  const updateAllergiesRes = await callAPI('PUT', `/patients/${patientId}/allergies`, {
    operation: 'ADD',
    allergyData: {
      allergen: 'Penicillin',
      severity: 'SEVERE',
      reaction: 'Phát ban, khó thở',
      onsetDate: '2020-01-01'
    }
  }, token);
  logTest('PAT-9: Update Patient Allergies', updateAllergiesRes.success, '', updateAllergiesRes);
  
  // 10. Get Patient Family History
  const familyHistoryRes = await callAPI('GET', `/patients/${patientId}/family-history`, null, token);
  logTest('PAT-10: Get Patient Family History', familyHistoryRes.success, '', familyHistoryRes);
  
  // 11. Update Patient Family History
  const updateFamilyRes = await callAPI('PUT', `/patients/${patientId}/family-history`, {
    operation: 'ADD',
    historyData: {
      condition: 'Tăng huyết áp',
      relation: 'FATHER',
      ageAtDiagnosis: 50,
      notes: 'Tiền sử bệnh gia đình'
    }
  }, token);
  logTest('PAT-11: Update Patient Family History', updateFamilyRes.success, '', updateFamilyRes);
  
  // 12. Register Patient
  const newPatientEmail = `newpatient.${Date.now()}@test.vn`;
  const registerRes = await callAPI('POST', '/patients/register', {
    email: newPatientEmail,
    password: 'NewPatient@123456',
    firstName: 'New',
    lastName: 'Patient',
    dateOfBirth: '1995-01-01',
    gender: 'MALE',
    phone: '+84909999999',
    address: {
      street: '123 Test Street',
      city: 'Ho Chi Minh City',
      district: 'District 1',
      ward: 'Ward 1'
    }
  }, token);
  logTest('PAT-12: Register Patient', registerRes.success, '', registerRes);
  
  // 13. Search Patients
  const searchPatientsRes = await callAPI('GET', '/patients/search?q=Test', null, token);
  logTest('PAT-13: Search Patients', searchPatientsRes.success, '', searchPatientsRes);
  
  // 14. Get Patient By ID
  if (testData.patients.patient1) {
    const getPatientRes = await callAPI('GET', `/patients/${testData.patients.patient1.id}`, null, token);
    logTest('PAT-14: Get Patient By ID', getPatientRes.success, '', getPatientRes);
  } else {
    logTest('PAT-14: Get Patient By ID', false, 'No patient available');
  }
  
  console.log(`\n✅ Patient Tests: ${passedTests}/${failedTests + passedTests}\n`);
}

// ==========================================
// 8. PRESCRIPTION CONTROLLER (4 hàm chưa test)
// ==========================================
async function testPrescriptionController() {
  console.log('\n💊 ===== PRESCRIPTION CONTROLLER TESTS (4 functions) =====\n');
  
  if (!testData.patients.patient1 || !testData.users.doctor || !testData.medications.med1) {
    console.log('⚠️ Skipping prescription tests - missing data\n');
    return;
  }
  
  const token = testData.tokens.superAdmin;
  const patientId = testData.patients.patient1.userId;
  const doctorId = testData.users.doctor._id;
  
  // Tạo prescription để test
  console.log('💊 [DEBUG] Creating prescription with:', {
    patientId,
    doctorId,
    medicationId: testData.medications.med1._id
  });
  
  // Backend route is /api/prescriptions/patients/:patientId/prescriptions
  const prescRes = await callAPI('POST', `/prescriptions/patients/${patientId}/prescriptions`, {
    doctorId: doctorId,
    medications: [
      {
        medicationId: testData.medications.med1._id,
        dosage: '500mg',
        frequency: '2 lần/ngày',
        duration: '7 ngày',
        totalQuantity: 14,
        instructions: 'Uống sau ăn'
      }
    ],
    diagnosis: 'Test diagnosis',
    notes: 'Test prescription'
  }, token);
  
  console.log('💊 [DEBUG] Prescription creation response:', {
    success: prescRes.success,
    hasData: !!prescRes.data,
    error: prescRes.error || prescRes.data?.error
  });
  
  let prescriptionId = null;
  if (prescRes.success && prescRes.data?.data) {
    // Service returns { prescription, interactionWarning }
    const data = prescRes.data.data;
    prescriptionId = data.prescription?._id || data.prescription?.prescriptionId || data._id || data.prescriptionId;
    console.log('✅ [PRESC] Created prescription:', prescriptionId);
    
    // Save to testData for PRESC-3
    testData.prescriptions = testData.prescriptions || {};
    testData.prescriptions.presc1 = { _id: prescriptionId };
  } else {
    console.log('❌ [PRESC] Failed to create prescription:', prescRes.error || prescRes.data?.error);
  }
  
  // 1. Add Medication to Prescription
  let addedMedicationId = null;
  if (prescriptionId) {
    const addMedRes = await callAPI('POST', `/prescriptions/${prescriptionId}/medications`, {
      medicationId: testData.medications.med1._id,
      dosage: '250mg',
      frequency: '3 lần/ngày',
      duration: '5 ngày',
      quantity: 15,
      instructions: 'Uống trước ăn'
    }, token);
    
    if (addMedRes.success && addMedRes.data?.data) {
      // Get the medication that was just added
      const prescription = addMedRes.data.data;
      const medications = prescription.medications || [];
      if (medications.length > 1) {
        // Get the last added medication (the one we just added, not the original one)
        const lastMed = medications[medications.length - 1];
        // Extract the actual ObjectId - may be nested
        addedMedicationId = lastMed._id || lastMed.id;
        console.log('💊 [PRESC] Added medication item ID:', addedMedicationId);
      }
    }
    
    logTest('PRESC-1: Add Medication to Prescription', addMedRes.success, '', addMedRes);
  } else {
    logTest('PRESC-1: Add Medication to Prescription', false, 'No prescription created');
  }
  
  // 2. Update Medication in Prescription - use the medication that was just added
  if (prescriptionId && addedMedicationId) {
    const updateMedRes = await callAPI('PUT', `/prescriptions/${prescriptionId}/medications/${addedMedicationId}`, {
      dosage: '500mg',
      frequency: '1 lần/ngày',
      duration: '10 ngày',
      quantity: 10
    }, token);
    logTest('PRESC-2: Update Medication in Prescription', updateMedRes.success, '', updateMedRes);
  } else {
    logTest('PRESC-2: Update Medication in Prescription', false, addedMedicationId ? 'No prescription created' : 'No medication added');
  }
  
  // 3. Cancel Prescription - create a new prescription to cancel
  if (patientId && doctorId) {
    // Create a fresh prescription to cancel
    const newPrescRes = await callAPI('POST', `/prescriptions/patients/${patientId}/prescriptions`, {
      doctorId: doctorId,
      medications: [
        {
          medicationId: testData.medications.med1._id,
          dosage: '100mg',
          frequency: '1 lần/ngày',
          duration: '3 ngày',
          totalQuantity: 3,
          instructions: 'Test prescription to cancel'
        }
      ],
      diagnosis: 'Test for cancel',
      notes: 'Will be cancelled'
    }, token);
    
    if (newPrescRes.success && newPrescRes.data?.data) {
      const prescToCancel = newPrescRes.data.data.prescription?._id || newPrescRes.data.data._id;
      
      const cancelRes = await callAPI('DELETE', `/prescriptions/${prescToCancel}/cancel`, {
        reason: 'Test cancellation'
      }, token);
      logTest('PRESC-3: Cancel Prescription', cancelRes.success, '', cancelRes);
    } else {
      logTest('PRESC-3: Cancel Prescription', false, 'Could not create prescription to cancel');
    }
  } else {
    logTest('PRESC-3: Cancel Prescription', false, 'No patient or doctor available');
  }
  
  console.log(`\n✅ Prescription Tests: ${passedTests}/${failedTests + passedTests}\n`);
}

// ==========================================
// 9. USER CONTROLLER (13 hàm chưa test)
// ==========================================
async function testUserController() {
  console.log('\n👥 ===== USER CONTROLLER TESTS (13 functions) =====\n');
  
  const token = testData.tokens.superAdmin;
  
  // Tạo user để test
  const testUserEmail = `testuser.${Date.now()}@healthcare.vn`;
  const createRes = await callAPI('POST', '/users', {
    email: testUserEmail,
    password: 'TestUser@123456',
    role: 'NURSE',
    personalInfo: {
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '1990-01-01',
      gender: 'FEMALE',
      phone: '+84908888888',
      address: { street: '789', city: 'HCM' }
    },
    professionalInfo: {
      licenseNumber: 'NURSE123456',
      specialization: 'General Nursing',
      department: 'Nội Tổng Quát'
    }
  }, token);
  
  let testUserId = null;
  if (createRes.success) {
    testUserId = createRes.data.data._id;
  }
  
  // 1. Disable User
  if (testUserId) {
    const disableRes = await callAPI('PATCH', `/users/${testUserId}/disable`, {
      reason: 'Test disable'
    }, token);
    logTest('USER-1: Disable User', disableRes.success, '', disableRes);
  } else {
    logTest('USER-1: Disable User', false, 'No user created');
  }
  
  // 2. Enable User
  if (testUserId) {
    const enableRes = await callAPI('PATCH', `/users/${testUserId}/enable`, {}, token);
    logTest('USER-2: Enable User', enableRes.success, '', enableRes);
  } else {
    logTest('USER-2: Enable User', false, 'No user created');
  }
  
  // 3. Delete User (soft delete)
  if (testUserId) {
    const deleteRes = await callAPI('DELETE', `/users/${testUserId}`, null, token);
    logTest('USER-3: Delete User', deleteRes.success, '', deleteRes);
  } else {
    logTest('USER-3: Delete User', false, 'No user created');
  }
  
  // 4. List Deleted Users
  const deletedRes = await callAPI('GET', '/users/deleted/list', null, token);
  logTest('USER-4: List Deleted Users', deletedRes.success, '', deletedRes);
  
  // 5. Restore User
  if (testUserId) {
    const restoreRes = await callAPI('PATCH', `/users/${testUserId}/restore`, {}, token);
    logTest('USER-5: Restore User', restoreRes.success, '', restoreRes);
  } else {
    logTest('USER-5: Restore User', false, 'No user created');
  }
  
  // 6. Get User Statistics
  const statsRes = await callAPI('GET', '/users/stats/overview', null, token);
  logTest('USER-6: Get User Statistics', statsRes.success, '', statsRes);
  
  // 7. Get User By Email - Use doctor email since test user was deleted
  const doctorEmail = testData.users.doctor.email;
  const byEmailRes = await callAPI('GET', `/users/email/${encodeURIComponent(doctorEmail)}`, null, token);
  logTest('USER-7: Get User By Email', byEmailRes.success, '', byEmailRes);
  
  // 8. Assign Role
  if (testUserId) {
    const assignRoleRes = await callAPI('PATCH', `/users/${testUserId}/role`, {
      role: 'DOCTOR'
    }, token);
    logTest('USER-8: Assign Role', assignRoleRes.success, '', assignRoleRes);
  } else {
    logTest('USER-8: Assign Role', false, 'No user created');
  }
  
  // 9. Get User Permissions
  if (testUserId) {
    const permissionsRes = await callAPI('GET', `/users/${testUserId}/permissions`, null, token);
    logTest('USER-9: Get User Permissions', permissionsRes.success, '', permissionsRes);
  } else {
    logTest('USER-9: Get User Permissions', false, 'No user created');
  }
  
  // 10. Check User Permission
  if (testUserId) {
    const checkPermRes = await callAPI('POST', `/users/${testUserId}/check-permission`, {
      permission: 'READ_PATIENTS'
    }, token);
    logTest('USER-10: Check User Permission', checkPermRes.success, '', checkPermRes);
  } else {
    logTest('USER-10: Check User Permission', false, 'No user created');
  }
  
  // 11. Upload Profile Picture
  if (testUserId) {
    // Create a fake image buffer (1x1 PNG)
    const fakeImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const uploadRes = await callAPIWithFile('POST', '/users/profile/picture', 'profilePicture', fakeImageBuffer, 'test-avatar.png', token);
    logTest('USER-11: Upload Profile Picture', uploadRes.success, '', uploadRes);
  } else {
    logTest('USER-11: Upload Profile Picture', false, 'No user created');
  }
  
  // 12. Verify Email
  const verifyRes = await callAPI('POST', '/users/verify-email', { token: 'fake-token-12345' }, token);
  logTest('USER-12: Verify Email', verifyRes.success || verifyRes.status === 400, '', verifyRes);
  
  // 13. Resend Verification Email
  if (testUserEmail) {
    const resendRes = await callAPI('POST', '/users/profile/resend-verification', {
      email: testUserEmail
    }, token);
    logTest('USER-13: Resend Verification Email', resendRes.success, '', resendRes);
  } else {
    logTest('USER-13: Resend Verification Email', false, 'No email');
  }
  
  console.log(`\n✅ User Tests: ${passedTests}/${failedTests + passedTests}\n`);
}

// ==========================================
// MAIN
// ==========================================
async function runAllTests() {
  console.log('\n🧪 ===== COMPLETE API TEST - 59 REMAINING FUNCTIONS =====');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Time: ${new Date().toLocaleString('vi-VN')}\n`);
  
  try {
    await setup();
    await testAdminController();
    await testAuthController();
    await testAppointmentController();
    await testBillingController();
    await testMedicationController();
    await testPatientController(); // Run before Medical Record to create records
    await testMedicalRecordController();
    await testPrescriptionController();
    await testUserController();
    
    console.log('\n📊 ===== FINAL RESULTS =====\n');
    const total = passedTests + failedTests;
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passedTests} (${((passedTests/total)*100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${failedTests} (${((failedTests/total)*100).toFixed(1)}%)\n`);
    
    console.log('✅ Test Complete!\n');
    
  } catch (error) {
    console.error('\n❌ Test Error:', error);
    process.exit(1);
  }
}

runAllTests().catch(console.error);
