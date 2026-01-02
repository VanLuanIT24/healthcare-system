const mongoose = require('mongoose');
require('dotenv').config();

async function checkDoctor() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const User = require('./src/models/user.model');
    
    // Count all active doctors
    const count = await User.countDocuments({ role: 'DOCTOR', isDeleted: false, status: 'ACTIVE' });
    console.log('\nTotal ACTIVE doctors:', count);

    // List all active doctors sorted by experience
    console.log('\n=== All ACTIVE Doctors (sorted by experience) ===');
    const doctors = await User.find({ role: 'DOCTOR', isDeleted: false, status: 'ACTIVE' })
      .select('personalInfo.firstName personalInfo.lastName professionalInfo.yearsOfExperience email')
      .sort({ 'professionalInfo.yearsOfExperience': -1 });
    
    doctors.forEach((d, i) => {
      const name = `${d.personalInfo?.firstName || ''} ${d.personalInfo?.lastName || ''}`.trim();
      console.log(`${i+1}. ${name || 'N/A'} - ${d.professionalInfo?.yearsOfExperience || 0} years - ${d.email}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkDoctor();
