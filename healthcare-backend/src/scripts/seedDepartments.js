const mongoose = require('mongoose');
require('dotenv').config();
const Department = require('../models/department.model');

async function seedDepartments() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare_db';
    console.log('Connecting to MongoDB...', mongoUri);
    await mongoose.connect(mongoUri);

    const departmentsData = [
      { code: 'DEP_CARDIO', name: 'Tim Mạch', description: 'Khoa Tim Mạch', type: 'outpatient' },
      { code: 'DEP_NEURO', name: 'Thần Kinh', description: 'Khoa Thần Kinh', type: 'outpatient' },
      { code: 'DEP_PEDIA', name: 'Nhi Khoa', description: 'Khoa Nhi', type: 'outpatient' },
      { code: 'DEP_GEN', name: 'Đa Khoa', description: 'Khoa Khám Bệnh Đa Khoa', type: 'outpatient' },
      { code: 'DEP_SURG', name: 'Ngoại Khoa', description: 'Khoa Ngoại', type: 'inpatient' },
      { code: 'DEP_ENT', name: 'Tai Mũi Họng', description: 'Khoa Tai Mũi Họng', type: 'outpatient' },
      { code: 'DEP_EYE', name: 'Nhãn Khoa', description: 'Khoa Mắt', type: 'outpatient' },
      { code: 'DEP_DENT', name: 'Răng Hàm Mặt', description: 'Khoa Răng Hàm Mặt', type: 'outpatient' }
    ];

    console.log('Seeding departments...');
    for (const depData of departmentsData) {
      const existingReq = await Department.findOne({ code: depData.code });
      if (!existingReq) {
        await Department.create(depData);
        console.log(`Created department: ${depData.name}`);
      } else {
        console.log(`Department already exists: ${depData.name}`);
      }
    }

    console.log('✅ Departments Seeding Done.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding departments:', error);
    process.exit(1);
  }
}

seedDepartments();
