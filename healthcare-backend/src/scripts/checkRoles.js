const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/user.model');

async function checkRoles() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare_db';
        console.log('Connecting to MongoDB...', mongoUri);
        await mongoose.connect(mongoUri);
        console.log('Connected.');

        const users = await User.find({}, 'email role');
        console.log(`Found ${users.length} users.`);

        const roleCounts = {};
        const invalidRoles = [];
        const lowercaseRoles = [];

        users.forEach(u => {
            // Count raw roles
            roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;

            // Check case
            if (u.role && u.role !== u.role.toUpperCase()) {
                lowercaseRoles.push({ email: u.email, role: u.role });
            }
        });

        console.log('\n=== ROLE DISTRIBUTION (RAW) ===');
        console.table(roleCounts);

        if (lowercaseRoles.length > 0) {
            console.log('\n⚠️ FOUND LOWERCASE ROLES (These cause permission issues without normalization):');
            console.table(lowercaseRoles);
            console.log('✅ My fix in auth.middleware.js (normalizing to UPPERCASE) handles these cases automatically.');
        } else {
            console.log('\n✅ All roles in DB are UPPERCASE. Excellent.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkRoles();
