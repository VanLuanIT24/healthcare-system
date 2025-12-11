// Direct test of billing API to see actual error response
// Using native fetch API (Node.js 18+)

const BASE_URL = 'http://localhost:5000/api';

async function testBillingAPI() {
  console.log('\n🧪 Testing Billing API Validation...\n');

  // Step 1: Login
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'superadmin@healthcare.vn',
      password: 'SuperSecurePassword123!'
    })
  });
  const loginData = await loginRes.json();
  
  if (!loginData.success) {
    console.error('❌ Login failed:', loginData);
    return;
  }

  const token = loginData.data.tokens.accessToken;
  console.log('✅ Logged in successfully\n');

  // Step 2: Use a valid test patient ID (from earlier test data)
  const patientId = '6936a7902a7edb734200adb7';  // Patient created in main tests
  console.log('✅ Using Patient ID:', patientId, '\n');

  // Step 3: Try to create a bill
  console.log(`🔍 Testing POST /billing/patients/${patientId}/bills\n`);
  
  const billRes = await fetch(`${BASE_URL}/billing/patients/${patientId}/bills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      items: [
        {
          description: 'Phí khám bệnh',
          category: 'CONSULTATION',
          unitPrice: 200000,
          quantity: 1
        }
      ],
      taxRate: 0,
      notes: 'Test bill'
    })
  });

  console.log('📊 Response Status:', billRes.status);
  
  const billData = await billRes.json();
  console.log('\n📦 Response Body:', JSON.stringify(billData, null, 2));
  
  // Check for error details
  if (billData.error && typeof billData.error === 'object') {
    console.log('\n🔍 Error Code:', billData.error.code);
    console.log('🔍 Error Message:', billData.error.message);
    if (billData.error.details) {
      console.log('🔍 Error Details:', JSON.stringify(billData.error.details, null, 2));
    }
  }
}

testBillingAPI().catch(console.error);
