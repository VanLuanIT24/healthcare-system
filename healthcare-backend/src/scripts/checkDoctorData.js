const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/user.model');
const Department = require('../models/department.model');

async function checkDoctorData() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare_db';
        console.log('Connecting to MongoDB...', mongoUri);
        await mongoose.connect(mongoUri);

        const doctors = await User.find({ role: 'DOCTOR' });
        const departments = await Department.find();

        console.log(`\nFound ${doctors.length} doctors.`);
        console.log(`Found ${departments.length} departments.`);

        console.log('\n--- DEPARTMENTS ---');
        const deptMap = {};
        departments.forEach(d => {
            console.log(`ID: ${d._id} | Name: ${d.name}`);
            deptMap[d._id.toString()] = d.name;
        });

        console.log('\n--- DOCTORS ---');
        let missingDeptCount = 0;
        doctors.forEach(d => {
            const deptId = d.departmentId || (d.professionalInfo ? d.professionalInfo.department : null) || (d.department ? d.department._id : null);

            let deptName = 'Unknown';
            if (deptId && deptMap[deptId.toString()]) {
                deptName = deptMap[deptId.toString()];
            } else if (deptId) {
                deptName = 'ID Not Found in Depts';
            } else {
                deptName = 'MISSING';
                missingDeptCount++;
            }

            console.log(`Dr. ${d.personalInfo?.fullName || d.email}`);
            console.log(`   Dept Field: ${deptId}`);
            console.log(`   Resolved Dept: ${deptName}`);
            console.log('-----------------------------------');
        });

        console.log(`\nSummary: ${missingDeptCount} doctors have missing department linkage.`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkDoctorData();
