const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/user.model');
const Department = require('../models/department.model');

async function fixDoctorDepartments() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare_db';
        console.log('Connecting to MongoDB...', mongoUri);
        await mongoose.connect(mongoUri);

        const departments = await Department.find();
        if (departments.length === 0) {
            console.error('No departments found!');
            process.exit(1);
        }

        const thanKinh = departments.find(d => d.name === 'Thần Kinh');
        const timMach = departments.find(d => d.name === 'Tim Mạch');

        // Fallback if names differ slightly
        const neuroId = thanKinh ? thanKinh._id : departments[0]._id;
        const cardioId = timMach ? timMach._id : (departments[1]?._id || departments[0]._id);

        const doctors = await User.find({ role: 'DOCTOR' });
        console.log(`Found ${doctors.length} doctors.`);

        for (let i = 0; i < doctors.length; i++) {
            const doc = doctors[i];

            // Determine target department
            let targetId;
            const currentDept = doc.professionalInfo?.department || '';

            // Preserving logic if applicable
            if (currentDept === 'CARDIOLOGY' || currentDept.includes('Tim')) {
                targetId = cardioId;
            } else if (currentDept === 'NEUROLOGY' || currentDept.includes('Thần')) {
                targetId = neuroId;
            } else {
                // Distribute others: Even index -> Neuro, Odd index -> Cardio.
                // This ensures ample doctors in both.
                targetId = (i % 2 === 0) ? neuroId : cardioId;
            }

            // UPDATE BOTH FIELDS
            // 1. professionalInfo.department (Used by frontend filter line 82)
            // 2. department (Direct reference if model supports it)

            doc.professionalInfo = {
                ...doc.professionalInfo,
                department: targetId.toString() // Store ID as string/ObjectId
            };
            // doc.departmentId = targetId; // Some code uses this?

            // If User model has `department` field as ref
            doc.department = targetId;

            await doc.save();
            console.log(`Updated Dr. ${doc.email} -> ${targetId.toString() === neuroId.toString() ? 'Thần Kinh' : 'Tim Mạch'}`);
        }

        console.log('✅ Doctor Deaprtments Fixed.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixDoctorDepartments();
