
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const Patient = require('./src/models/patient.model');
const { signAccessToken } = require('./src/utils/jwt');
const { ROLES } = require('./src/constants/roles');
const fs = require('fs');

async function verify() {
    try {
        // 1. Connect DB
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 2. Get Doctor
        let doctor = await User.findOne({ role: ROLES.DOCTOR });
        if (!doctor) {
            console.log('No doctor found, creating temp doctor...');
            doctor = await User.create({
                email: 'temp_doc_verify@example.com',
                password: 'Password123!',
                role: ROLES.DOCTOR,
                personalInfo: {
                    firstName: 'Temp',
                    lastName: 'Doc',
                    dateOfBirth: new Date('1980-01-01'),
                    gender: 'FEMALE',
                    phone: '0123456789'
                },
                status: 'ACTIVE',
                isEmailVerified: true
            });
        }
        const token = signAccessToken(doctor);
        console.log('Got token for doctor:', doctor.email);

        // 3. Get Patient User
        let patientUser = await User.findOne({ role: ROLES.PATIENT, email: 'temp_pat_verify@example.com' });
        if (!patientUser) {
            patientUser = await User.create({
                email: 'temp_pat_verify@example.com',
                password: 'Password123!',
                role: ROLES.PATIENT,
                personalInfo: {
                    firstName: 'Temp',
                    lastName: 'Pat',
                    dateOfBirth: new Date('1990-01-01'),
                    gender: 'MALE',
                    phone: '0987654321',
                    address: { street: 'Test St', city: 'Test City' }
                },
                status: 'ACTIVE',
                isEmailVerified: true
            });
        }

        // Ensure Patient Profile exists
        let patientProfile = await Patient.findOne({ userId: patientUser._id });
        if (!patientProfile) {
            console.log('Creating Patient Profile...');
            patientProfile = await Patient.create({
                userId: patientUser._id,
                patientId: `P${Date.now()}`,
                createdBy: doctor._id,
                emergencyInfo: {
                    contactName: 'Emergency',
                    contactPhone: '123'
                },
                allergies: []
            });
            console.log('Patient profile created:', patientProfile.patientId);
        }

        // 4. Payload validation test
        const payloadStrings = {
            patientId: patientUser._id.toString(),
            diagnosis: "Test Diagnosis Free Text Strings",
            medications: [
                {
                    name: "Paracetamol Free Text",
                    dosage: "500mg",
                    frequency: "2 times daily",
                    duration: "5 days",
                    instructions: "Take after food"
                }
            ],
            notes: "Test notes"
        };


        console.log('Sending payload:', JSON.stringify(payloadStrings, null, 2));

        // 5. Send Request
        const response = await fetch('http://localhost:5000/api/prescriptions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payloadStrings)
        });

        const data = await response.json();

        // Log to file to avoid truncation
        fs.writeFileSync('verify_output.json', JSON.stringify({ status: response.status, body: data }, null, 2));

        console.log('Response Status:', response.status);
        console.log('Response saved to verify_output.json');

        if (response.status === 201 && data.success) {
            console.log('✓ VERIFICATION SUCCESSFUL: Prescription created with free-text medication.');
            process.exit(0);
        } else {
            console.error('✗ VERIFICATION FAILED');
            process.exit(1);
        }

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

verify();
