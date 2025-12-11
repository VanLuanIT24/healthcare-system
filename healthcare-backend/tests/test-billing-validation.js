// Quick test of billing validation schemas
const { billingSchemas } = require('../src/validations/billing.validation');

// Test data
const testPatientId = '6936a7902a7edb734200adb7';

// Test patientId schema
console.log('\n🔍 Testing patientId schema...');
console.log('Schema:', JSON.stringify(billingSchemas.patientId.describe(), null, 2));

// Test 1: With correct patientId field
const patientIdResult = billingSchemas.patientId.validate({ patientId: testPatientId }, {
  abortEarly: false,
  stripUnknown: true,
  allowUnknown: true
});
console.log('\n✅ Test 1 - Patient ID Validation Result:');
console.log('Error:', patientIdResult.error ? patientIdResult.error.details : 'None');
console.log('Value:', patientIdResult.value);

// Test 2: With wrong field name (id instead of patientId)
const wrongFieldResult = billingSchemas.patientId.validate({ id: testPatientId }, {
  abortEarly: false,
  stripUnknown: true,
  allowUnknown: true
});
console.log('\n✅ Test 2 - Wrong Field Name Result:');
console.log('Error:', wrongFieldResult.error ? wrongFieldResult.error.details : 'None');
console.log('Value:', wrongFieldResult.value);

// Test billId schema
console.log('\n🔍 Testing billId schema...');
const testBillId = '6936a7902a7edb734200adb8';
const billIdResult = billingSchemas.billId.validate({ billId: testBillId });
console.log('\n✅ Bill ID Validation Result:');
console.log('Error:', billIdResult.error);
console.log('Value:', billIdResult.value);

console.log('\n✅ All validation tests complete!');
