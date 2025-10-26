// scripts/get-superadmin-token.js
require('dotenv').config();
const mongoose = require('mongoose');
const { generateTokenPair } = require('../utils/jwt.js');
const User = require('../models/user.model.js');

class SuperAdminTokenGenerator {
  constructor() {
    this.superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  }

  async connectDB() {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅ Connected to database');
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  async disconnectDB() {
    await mongoose.disconnect();
    console.log('✅ Disconnected from database');
  }

  async getSuperAdminToken() {
    try {
      await this.connectDB();

      // Tìm Super Admin
      const superAdmin = await User.findOne({ 
        email: this.superAdminEmail,
        role: 'SUPER_ADMIN'
      });

      if (!superAdmin) {
        throw new Error('Super Admin not found. Run: npm run admin:create');
      }

      // Kiểm tra trạng thái
      if (superAdmin.status !== 'ACTIVE') {
        throw new Error(`Super Admin account is ${superAdmin.status}`);
      }

      // Tạo tokens
      const tokens = generateTokenPair(superAdmin);

      console.log('\n🎯 SUPER ADMIN TOKEN INFORMATION:');
      console.log('================================');
      console.log(`📧 Email: ${superAdmin.email}`);
      console.log(`👤 Name: ${superAdmin.personalInfo.firstName} ${superAdmin.personalInfo.lastName}`);
      console.log(`🎯 Role: ${superAdmin.role}`);
      console.log(`📊 Status: ${superAdmin.status}`);
      console.log('================================\n');

      console.log('🔐 ACCESS TOKEN:');
      console.log(tokens.accessToken);
      console.log('\n🔄 REFRESH TOKEN:');
      console.log(tokens.refreshToken);
      console.log('\n⏰ EXPIRES IN:', tokens.expiresIn, 'seconds');

      return tokens;

    } catch (error) {
      console.error('❌ Error:', error.message);
      throw error;
    } finally {
      await this.disconnectDB();
    }
  }

  displayUsageInfo() {
    console.log('\n📖 HOW TO USE THE TOKEN:');
    console.log('================================');
    console.log('1. Add to Authorization header:');
    console.log('   Authorization: Bearer <access_token>');
    console.log('\n2. Example with curl:');
    console.log('   curl -H "Authorization: Bearer ' + 'YOUR_TOKEN_HERE'.substring(0, 20) + '..." \\');
    console.log('        http://localhost:5000/api/users');
    console.log('\n3. Token will expire in 15 minutes');
    console.log('4. Use refresh token to get new access token');
    console.log('================================\n');
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new SuperAdminTokenGenerator();
  generator.getSuperAdminToken()
    .then(tokens => {
      generator.displayUsageInfo();
      
      // Copy token to clipboard (optional)
      if (process.platform === 'darwin') {
        const { exec } = require('child_process');
        exec(`echo "${tokens.accessToken}" | pbcopy`);
        console.log('📋 Token copied to clipboard!');
      }
    })
    .catch(error => {
      console.error('❌ Failed to get token:', error.message);
      process.exit(1);
    });
}

module.exports = SuperAdminTokenGenerator;