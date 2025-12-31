
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const { ROLES } = require('./src/constants/roles');

async function createTestPatient() {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined');
        }
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected');

        const email = 'testpatient@example.com';
        const password = 'Password123!';

        let user = await User.findOne({ email });
        if (user) {
            console.log('User exists, updating password...');
            user.password = password; // Will be hashed by pre-save hook
            user.role = ROLES.PATIENT;
            user.status = 'ACTIVE';
        } else {
            console.log('Creating new user...');
            user = new User({
                email,
                password,
                role: ROLES.PATIENT,
                personalInfo: {
                    firstName: 'Test',
                    lastName: 'Patient',
                    dateOfBirth: new Date('1990-01-01'),
                    gender: 'MALE'
                },
                status: 'ACTIVE',
                isEmailVerified: true
            });
        }

        await user.save();
        console.log(`User ${email} setup complete with role ${user.role}`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createTestPatient();
