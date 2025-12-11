// Quick billing test
const BASE_URL = 'http://localhost:5000/api';

async function test() {
  try {
    // Login
    console.log('1. Logging in...');
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
      console.error('Login failed:', loginData);
      return;
    }
    console.log('✅ Logged in');
    const token = loginData.data.tokens.accessToken;

    // Create patient
    console.log('\n2. Creating patient...');
    const patientRes = await fetch(`${BASE_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Patient',
        dateOfBirth: '1990-01-01',
        gender: 'MALE',
        phone: '0900000111',
        email: `testpatient${Date.now()}@test.com`,
        address: {
          street: '123 Test St',
          city: 'Hanoi',
          district: 'Ba Dinh',
          ward: 'Ward 1',
          country: 'Vietnam'
        }
      })
    });
    const patientData = await patientRes.json();
    if (!patientData.success) {
      console.error('Patient creation failed:', patientData);
      return;
    }
    console.log('✅ Patient created:', patientData.data.data._id);
    const patientId = patientData.data.data._id;

    // Create bill
    console.log('\n3. Creating bill...');
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
    
    const billText = await billRes.text();
    console.log('Response status:', billRes.status);
    console.log('Response:', billText);
    
    try {
      const billData = JSON.parse(billText);
      if (billData.success) {
        console.log('✅ Bill created:', billData.data._id);
      } else {
        console.error('❌ Bill creation failed:', billData);
      }
    } catch (e) {
      console.error('Failed to parse response:', e.message);
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

test();
