// src/scripts/seedDefaultSchedules.js
// Script tạo lịch làm việc mặc định (giờ hành chính) cho tất cả bác sĩ

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');

// Import models
const User = require('../models/user.model');
const DoctorSchedule = require('../models/doctorSchedule.model');

// Cấu hình lịch làm việc mặc định - Giờ hành chính
const DEFAULT_SCHEDULE_CONFIG = {
  // Ca sáng: 7:30 - 11:30
  morningStart: '07:30',
  morningEnd: '11:30',
  // Ca chiều: 13:30 - 17:00  
  afternoonStart: '13:30',
  afternoonEnd: '17:00',
  // Nghỉ trưa: 11:30 - 13:30
  breakStart: '11:30',
  breakEnd: '13:30',
  // Thời gian mỗi slot khám: 30 phút
  slotDuration: 30,
  // Số bệnh nhân tối đa mỗi slot
  maxPatients: 1,
  // Các ngày làm việc: Thứ 2 - Thứ 6 (1-5)
  workingDays: [1, 2, 3, 4, 5]
};

async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare';
    console.log('🔗 Đang kết nối MongoDB...');
    console.log(`   URI: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Đã kết nối MongoDB');

    // Xóa index cũ có thể gây conflict
    try {
      await mongoose.connection.db.collection('doctorschedules').dropIndex('doctorId_1_date_1');
      console.log('🗑️ Đã xóa index cũ doctorId_1_date_1');
    } catch (e) {
      // Index không tồn tại, bỏ qua
    }
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error);
    process.exit(1);
  }
}

async function seedDefaultSchedules() {
  try {
    console.log('\n📅 BẮT ĐẦU TẠO LỊCH LÀM VIỆC MẶC ĐỊNH\n');
    console.log('⏰ Cấu hình giờ hành chính:');
    console.log(`   - Ca sáng: ${DEFAULT_SCHEDULE_CONFIG.morningStart} - ${DEFAULT_SCHEDULE_CONFIG.morningEnd}`);
    console.log(`   - Nghỉ trưa: ${DEFAULT_SCHEDULE_CONFIG.breakStart} - ${DEFAULT_SCHEDULE_CONFIG.breakEnd}`);
    console.log(`   - Ca chiều: ${DEFAULT_SCHEDULE_CONFIG.afternoonStart} - ${DEFAULT_SCHEDULE_CONFIG.afternoonEnd}`);
    console.log(`   - Thời gian mỗi slot: ${DEFAULT_SCHEDULE_CONFIG.slotDuration} phút`);
    console.log(`   - Ngày làm việc: Thứ 2 - Thứ 6\n`);

    // Lấy tất cả bác sĩ
    const doctors = await User.find({ 
      role: 'DOCTOR',
      isActive: true 
    }).select('_id personalInfo.fullName professionalInfo.department');

    console.log(`📋 Tìm thấy ${doctors.length} bác sĩ\n`);

    if (doctors.length === 0) {
      console.log('⚠️ Không có bác sĩ nào trong hệ thống!');
      return;
    }

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const doctor of doctors) {
      const doctorName = doctor.personalInfo?.fullName || doctor._id;
      console.log(`\n👨‍⚕️ Xử lý bác sĩ: ${doctorName}`);

      for (const dayOfWeek of DEFAULT_SCHEDULE_CONFIG.workingDays) {
        const dayName = getDayName(dayOfWeek);
        
        try {
          // Kiểm tra xem đã có lịch cho ngày này chưa
          const existingSchedule = await DoctorSchedule.findOne({
            doctor: doctor._id,
            scheduleType: 'REGULAR',
            dayOfWeek: dayOfWeek
          });

          if (existingSchedule) {
            console.log(`   ⏭️ ${dayName}: Đã có lịch, bỏ qua`);
            skipped++;
            continue;
          }

          // Tạo lịch mới
          const schedule = new DoctorSchedule({
            doctor: doctor._id,
            scheduleType: 'REGULAR',
            dayOfWeek: dayOfWeek,
            startTime: DEFAULT_SCHEDULE_CONFIG.morningStart,
            endTime: DEFAULT_SCHEDULE_CONFIG.afternoonEnd,
            breakStart: DEFAULT_SCHEDULE_CONFIG.breakStart,
            breakEnd: DEFAULT_SCHEDULE_CONFIG.breakEnd,
            slotDuration: DEFAULT_SCHEDULE_CONFIG.slotDuration,
            maxPatientsPerSlot: DEFAULT_SCHEDULE_CONFIG.maxPatients,
            isActive: true,
            // Không gán department nếu không phải ObjectId hợp lệ
            room: `Phòng khám ${Math.floor(Math.random() * 20) + 1}`,
            notes: 'Lịch làm việc giờ hành chính (tạo tự động)'
          });

          await schedule.save();
          console.log(`   ✅ ${dayName}: Đã tạo lịch`);
          created++;
        } catch (error) {
          console.error(`   ❌ ${dayName}: Lỗi - ${error.message}`);
          errors++;
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 KẾT QUẢ:');
    console.log(`   ✅ Đã tạo: ${created} lịch`);
    console.log(`   ⏭️ Bỏ qua: ${skipped} lịch (đã tồn tại)`);
    console.log(`   ❌ Lỗi: ${errors} lịch`);
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Lỗi khi tạo lịch:', error);
    throw error;
  }
}

function getDayName(dayOfWeek) {
  const days = {
    0: 'Chủ nhật',
    1: 'Thứ 2',
    2: 'Thứ 3',
    3: 'Thứ 4',
    4: 'Thứ 5',
    5: 'Thứ 6',
    6: 'Thứ 7'
  };
  return days[dayOfWeek] || `Ngày ${dayOfWeek}`;
}

async function main() {
  try {
    await connectDB();
    await seedDefaultSchedules();
    console.log('✅ Hoàn thành tạo lịch mặc định!');
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB');
    process.exit(0);
  }
}

// Chạy script
main();
