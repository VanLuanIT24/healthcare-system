// Test API
const axios = require('axios');

// Fake token - test SUPER_ADMIN
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzZlNDMzYTAwMDAwMDAwMDAwMDAwMDEiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3Mzc3NzAwMDB9.test';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 5000
});

instance.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

instance.interceptors.response.use(
  response => {
    console.log('✅ Response:', response.status, response.data);
    return response;
  },
  error => {
    console.log('❌ Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Test
console.log('Testing /admin/users/stats...');
instance.get('/admin/users/stats')
  .catch(e => console.log('Failed:', e.message));
