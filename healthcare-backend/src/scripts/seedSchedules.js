const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/user.model');

// Define DoctorSchedule Schema locally as it's not exported globally
const doctorScheduleSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    timeSlots: [
        {
            startTime: String,
            endTime: String,
            isAvailable: { type: Boolean, default: true }
        }
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

// Avoid OverwriteModelError
const DoctorSchedule = mongoose.models.DoctorSchedule || mongoose.model('DoctorSchedule', doctorScheduleSchema);

async function seedSchedules() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare_db';
        console.log('Connecting to MongoDB...', mongoUri);
        await mongoose.connect(mongoUri);

        const doctors = await User.find({ role: 'DOCTOR' });
        console.log(`Found ${doctors.length} doctors.`);

        if (doctors.length === 0) {
            console.log('No doctors found. Please run seedDatabase.js first.');
            process.exit(0);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysToSeed = 30;
        let seededCount = 0;

        for (const doc of doctors) {
            console.log(`Checking schedule for Dr. ${doc.name || doc.email}...`);

            for (let i = 0; i < daysToSeed; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() + i);

                // Check availability
                const exists = await DoctorSchedule.findOne({ doctorId: doc._id, date });
                if (!exists) {
                    // Create default 8:00 - 17:00 schedule
                    const timeSlots = [];
                    for (let h = 8; h < 17; h++) {
                        // 8:00 - 8:30
                        timeSlots.push({
                            startTime: `${h.toString().padStart(2, '0')}:00`,
                            endTime: `${h.toString().padStart(2, '0')}:30`,
                            isAvailable: true
                        });
                        // 8:30 - 9:00
                        timeSlots.push({
                            startTime: `${h.toString().padStart(2, '0')}:30`,
                            endTime: `${(h + 1).toString().padStart(2, '0')}:00`,
                            isAvailable: true
                        });
                    }

                    await DoctorSchedule.create({
                        doctorId: doc._id,
                        date,
                        timeSlots,
                        createdBy: doc._id // Self-created
                    });
                    seededCount++;
                }
            }
        }

        console.log(`✅ Seeded ${seededCount} schedule entries.`);
        console.log('Use this script to populate schedules so the "No available slots" message goes away.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding schedules:', error);
        process.exit(1);
    }
}

seedSchedules();
