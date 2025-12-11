// Check lock status
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model.js');

async function checkLock() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const user = await User.findOne({ email: 'superadmin@healthcare.vn' });
    
    if (!user) {
      console.log('❌ SuperAdmin not found');
      process.exit(1);
    }
    
    console.log('\n📊 SuperAdmin Status:');
    console.log(`Email: ${user.email}`);
    console.log(`Status: ${user.status}`);
    console.log(`Login Attempts: ${user.loginAttempts || 0}`);
    console.log(`LockUntil: ${user.lockUntil || 'Not locked'}`);
    console.log(`Is Locked: ${user.lockUntil && user.lockUntil > Date.now() ? 'YES' : 'NO'}`);
    console.log(`Current Time: ${new Date()}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkLock();
