// Test script to verify MongoDB user data
const mongoose = require('mongoose');
const User = require('./src/models/user.model');

async function checkUserData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB\n');

    // Get first user
    const user = await User.findOne({ isDeleted: false })
      .select('-password')
      .populate('createdBy', 'personalInfo email')
      .populate('lastModifiedBy', 'personalInfo email', { strictPopulate: false })
      .lean();

    if (!user) {
      console.log('❌ No user found in database');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('✅ User found in database:');
    console.log('\n📋 User ID:', user._id);
    console.log('📧 Email:', user.email);
    console.log('👤 Role:', user.role);
    console.log('✅ Active:', user.isActive);

    console.log('\n📝 Personal Info:');
    console.log('  - Name:', user.personalInfo?.firstName, user.personalInfo?.lastName);
    console.log('  - Phone:', user.personalInfo?.phone);
    console.log('  - Gender:', user.personalInfo?.gender);
    console.log('  - DOB:', user.personalInfo?.dateOfBirth);
    console.log('  - Address:', user.personalInfo?.address);

    console.log('\n💼 Professional Info:');
    console.log('  - Department:', user.professionalInfo?.department);
    console.log('  - Position:', user.professionalInfo?.position);
    console.log('  - License:', user.professionalInfo?.licenseNumber);

    console.log('\n⚙️ Settings:');
    console.log('  - Language:', user.settings?.language);
    console.log('  - Theme:', user.settings?.theme);

    console.log('\n📁 Other Fields:');
    console.log('  - Has documents:', Array.isArray(user.documents) ? user.documents.length : 0);
    console.log('  - Created At:', user.createdAt);
    console.log('  - Updated At:', user.updatedAt);

    console.log('\n✅ Data retrieved successfully!\n');
    
    // Count total users
    const totalUsers = await User.countDocuments({ isDeleted: false });
    console.log(`📊 Total active users: ${totalUsers}\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUserData();
