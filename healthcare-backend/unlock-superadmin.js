// Unlock SuperAdmin script
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model.js');

async function unlockSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');
    
    const user = await User.findOne({ email: 'superadmin@healthcare.vn' });
    
    if (!user) {
      console.log('❌ SuperAdmin not found');
      process.exit(1);
    }
    
    console.log(`📊 Current status: ${user.status}`);
    console.log(`🔒 LockUntil: ${user.lockUntil || 'Not locked'}`);
    console.log(`🔢 Login attempts: ${user.loginAttempts || 0}`);
    
    // Unlock account
    user.lockUntil = undefined;
    user.loginAttempts = 0;
    user.status = 'ACTIVE';
    await user.save();
    
    console.log('✅ SuperAdmin account unlocked successfully!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

unlockSuperAdmin();
