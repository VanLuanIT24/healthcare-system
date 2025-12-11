// Reset SuperAdmin password
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model.js');
const { hashPassword } = require('./src/utils/hash.js');

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');
    
    const user = await User.findOne({ email: 'superadmin@healthcare.vn' });
    
    if (!user) {
      console.log('❌ SuperAdmin not found');
      process.exit(1);
    }
    
    const newPassword = process.env.SUPER_ADMIN_PASSWORD;
    const hashedPassword = await hashPassword(newPassword);
    
    user.password = hashedPassword;
    user.lockUntil = undefined;
    user.loginAttempts = 0;
    user.status = 'ACTIVE';
    await user.save();
    
    console.log('✅ SuperAdmin password reset successfully!');
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Password: ${newPassword}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
