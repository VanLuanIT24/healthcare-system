/**
 * Test script to verify doctors API works correctly
 * Run with: node test-doctors-api.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

// Get auth token from environment or hardcoded
const TOKEN = process.env.AUTH_TOKEN || 'your-admin-token-here';

async function testDoctorsAPI() {
  console.log('\n🔍 Testing Doctors API...\n');

  try {
    // Test 1: Get all doctors
    console.log('📋 Test 1: Fetch all doctors');
    const res1 = await axios.get(`${BASE_URL}/doctors`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    console.log('✅ Response status:', res1.status);
    console.log('📊 Response structure:');
    console.log('   - success:', res1.data.success);
    console.log('   - data is array:', Array.isArray(res1.data.data));
    console.log('   - data length:', res1.data.data?.length);
    console.log('   - pagination:', res1.data.pagination);

    if (res1.data.data?.length > 0) {
      const firstDoctor = res1.data.data[0];
      console.log('\n📝 First doctor data structure:');
      console.log('   - _id:', firstDoctor._id);
      console.log('   - email:', firstDoctor.email);
      console.log('   - personalInfo:', firstDoctor.personalInfo);
      console.log('   - professionalInfo:', firstDoctor.professionalInfo);
      console.log('   - specialties:', firstDoctor.specialties);
      console.log('   - department:', firstDoctor.department);
      console.log('   - status:', firstDoctor.status);
      console.log('   - yearsOfExperience:', firstDoctor.yearsOfExperience);
    }

    // Test 2: Get doctors with pagination
    console.log('\n\n📋 Test 2: Fetch with pagination (page=1, limit=5)');
    const res2 = await axios.get(`${BASE_URL}/doctors?page=1&limit=5`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    console.log('✅ Response:');
    console.log('   - page:', res2.data.pagination?.page);
    console.log('   - limit:', res2.data.pagination?.limit);
    console.log('   - total:', res2.data.pagination?.total);
    console.log('   - pages:', res2.data.pagination?.pages);
    console.log('   - returned items:', res2.data.data?.length);

    // Test 3: Search doctors
    if (res1.data.data?.length > 0) {
      const firstName = res1.data.data[0].personalInfo?.firstName;
      console.log(`\n\n📋 Test 3: Search by name (${firstName})`);
      
      const res3 = await axios.get(`${BASE_URL}/doctors?search=${firstName}`, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      });

      console.log('✅ Search results:');
      console.log('   - found:', res3.data.data?.length);
      console.log('   - total matches:', res3.data.pagination?.total);
    }

    // Test 4: Filter by status
    console.log('\n\n📋 Test 4: Filter by status (ACTIVE)');
    const res4 = await axios.get(`${BASE_URL}/doctors?status=ACTIVE`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    console.log('✅ Active doctors:');
    console.log('   - count:', res4.data.data?.length);
    console.log('   - total:', res4.data.pagination?.total);

    // Test 5: Get single doctor
    if (res1.data.data?.length > 0) {
      const doctorId = res1.data.data[0]._id;
      console.log(`\n\n📋 Test 5: Get single doctor (${doctorId})`);

      try {
        const res5 = await axios.get(`${BASE_URL}/doctors/${doctorId}`, {
          headers: {
            'Authorization': `Bearer ${TOKEN}`
          }
        });

        console.log('✅ Doctor details:');
        console.log('   - success:', res5.data.success);
        console.log('   - doctor found:', !!res5.data.data);
      } catch (err) {
        console.log('⚠️  Error getting single doctor:', err.response?.data?.message || err.message);
      }
    }

    console.log('\n\n✨ All tests completed!\n');

  } catch (error) {
    console.error('❌ Error testing API:', error.response?.data || error.message);
  }
}

// Run tests
testDoctorsAPI();
