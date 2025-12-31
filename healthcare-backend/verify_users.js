
const mongoose = require('mongoose');
const adminService = require('./src/services/admin.service');
const dotenv = require('dotenv');
const result = dotenv.config({ path: './.env' });

if (result.error) {
    console.error('Error loading .env:', result.error);
}

console.log('Environment keys:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('DB')));
const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
console.log('URI loaded:', !!uri);
if (!uri) {
    console.error('URI is undefined. Available keys above.');
    process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(uri);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();
    try {
        const result = await adminService.getUsers({ page: 1, limit: 10 });
        console.log('Total users:', result.total);
        console.log('Items:', result.items.map(u => ({ email: u.email, role: u.role, isDeleted: u.isDeleted })));
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
