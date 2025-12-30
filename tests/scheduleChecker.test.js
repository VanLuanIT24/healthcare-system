// scheduleChecker.test.js - Các test case cho schedule checker utilities

import {
    calculateWorkStats,
    checkScheduleConflict,
    generateAvailableSlots,
    getAvailableDays
} from '@/services/utils/scheduleChecker';

describe('Schedule Checker Utilities', () => {
  // Test data: Bác sĩ làm việc Thứ 2-5 từ 8:00-17:00
  const mockDoctorSchedules = [
    { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '17:00' },
    { dayOfWeek: 'TUESDAY', startTime: '08:00', endTime: '17:00' },
    { dayOfWeek: 'WEDNESDAY', startTime: '08:00', endTime: '17:00' },
    { dayOfWeek: 'THURSDAY', startTime: '08:00', endTime: '17:00' },
  ];

  describe('checkScheduleConflict', () => {
    test('Kiểm tra giờ nằm trong thời gian làm việc', () => {
      const result = checkScheduleConflict('09:00', 'MONDAY', mockDoctorSchedules, 30);
      expect(result.available).toBe(true);
      expect(result.message).toContain('rảnh');
    });

    test('Kiểm tra giờ ngoài thời gian làm việc', () => {
      const result = checkScheduleConflict('18:00', 'MONDAY', mockDoctorSchedules, 30);
      expect(result.available).toBe(false);
      expect(result.message).toContain('không nằm trong giờ');
    });

    test('Kiểm tra ngày không làm việc', () => {
      const result = checkScheduleConflict('09:00', 'SATURDAY', mockDoctorSchedules, 30);
      expect(result.available).toBe(false);
      expect(result.reason).toBe('NO_SCHEDULE');
    });

    test('Kiểm tra giờ bắt đầu buổi làm việc', () => {
      const result = checkScheduleConflict('08:00', 'MONDAY', mockDoctorSchedules, 30);
      expect(result.available).toBe(true);
    });

    test('Kiểm tra giờ kết thúc buổi làm việc', () => {
      const result = checkScheduleConflict('16:30', 'MONDAY', mockDoctorSchedules, 30);
      expect(result.available).toBe(true);
    });

    test('Kiểm tra thời gian vượt quá giờ kết thúc', () => {
      const result = checkScheduleConflict('16:45', 'MONDAY', mockDoctorSchedules, 30);
      expect(result.available).toBe(false);
    });
  });

  describe('generateAvailableSlots', () => {
    test('Tạo danh sách khung giờ từ 8:00-17:00 (30 phút)', () => {
      const daySchedules = [mockDoctorSchedules[0]]; // MONDAY 8:00-17:00
      const slots = generateAvailableSlots(daySchedules, 30);

      expect(slots.length).toBe(18); // 9 giờ * 2 = 18 khung
      expect(slots[0].time).toBe('08:00');
      expect(slots[slots.length - 1].time).toBe('16:30');
    });

    test('Tạo danh sách khung giờ từ 8:00-12:00 (30 phút)', () => {
      const shortSchedules = [{ dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '12:00' }];
      const slots = generateAvailableSlots(shortSchedules, 30);

      expect(slots.length).toBe(8); // 4 giờ * 2 = 8 khung
      expect(slots[slots.length - 1].time).toBe('11:30');
    });

    test('Tạo danh sách khung giờ với slot duration 60 phút', () => {
      const daySchedules = [mockDoctorSchedules[0]]; // MONDAY 8:00-17:00
      const slots = generateAvailableSlots(daySchedules, 60);

      expect(slots.length).toBe(9); // 9 giờ = 9 khung
      expect(slots[0].time).toBe('08:00');
      expect(slots[1].time).toBe('09:00');
    });

    test('Danh sách khung giờ rỗi khi schedule rỗi', () => {
      const slots = generateAvailableSlots([], 30);
      expect(slots).toEqual([]);
    });
  });

  describe('getAvailableDays', () => {
    test('Lấy danh sách ngày bác sĩ rảnh trong 7 ngày tới', () => {
      // Giả sử hôm nay là thứ 2
      const days = getAvailableDays(mockDoctorSchedules, 7);

      // Nên có: Thứ 2, Thứ 3, Thứ 4, Thứ 5 (bác sĩ làm)
      const workingDays = days.filter(d => 
        ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'].includes(d.dayOfWeek)
      );
      expect(workingDays.length).toBeGreaterThan(0);
    });

    test('Lấy danh sách ngày trong 14 ngày tới', () => {
      const days = getAvailableDays(mockDoctorSchedules, 14);
      expect(days.length).toBeGreaterThan(4); // Ít nhất 4 ngày làm việc
    });

    test('Danh sách ngày có thuộc tính isToday', () => {
      const days = getAvailableDays(mockDoctorSchedules, 7);
      const hasToday = days.some(d => d.isToday === true || d.isToday === false);
      expect(hasToday).toBe(true);
    });

    test('Danh sách ngày có format display DD/MM/YYYY', () => {
      const days = getAvailableDays(mockDoctorSchedules, 7);
      if (days.length > 0) {
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        expect(regex.test(days[0].display)).toBe(true);
      }
    });
  });

  describe('calculateWorkStats', () => {
    test('Tính tổng giờ làm việc mỗi tuần', () => {
      const stats = calculateWorkStats(mockDoctorSchedules);
      expect(stats.totalHoursPerWeek).toBe(36); // 9 giờ * 4 ngày
    });

    test('Tính số ngày làm việc mỗi tuần', () => {
      const stats = calculateWorkStats(mockDoctorSchedules);
      expect(stats.daysPerWeek).toBe(4);
    });

    test('Tính trung bình giờ mỗi ngày', () => {
      const stats = calculateWorkStats(mockDoctorSchedules);
      expect(stats.averageHoursPerDay).toBe(9); // 36 / 4 = 9
    });

    test('Tính giờ làm việc mỗi ngày', () => {
      const stats = calculateWorkStats(mockDoctorSchedules);
      expect(stats.hoursPerDay['MONDAY']).toBe(9);
      expect(stats.hoursPerDay['FRIDAY']).toBeUndefined();
    });

    test('Xử lý schedule rỗi', () => {
      const stats = calculateWorkStats([]);
      expect(stats.totalHoursPerWeek).toBe(0);
      expect(stats.daysPerWeek).toBe(0);
      expect(stats.averageHoursPerDay).toBe(0);
    });
  });

  // Integration tests
  describe('Integration Tests', () => {
    test('Quy trình đặt lịch hoàn chỉnh', () => {
      // 1. Lấy ngày bác sĩ rảnh
      const availableDays = getAvailableDays(mockDoctorSchedules, 7);
      expect(availableDays.length).toBeGreaterThan(0);

      // 2. Bệnh nhân chọn ngày thứ 2
      const selectedDay = availableDays[0];
      const dayOfWeek = selectedDay.dayOfWeek;

      // 3. Tạo danh sách khung giờ cho ngày đó
      const daySchedules = mockDoctorSchedules.filter(s => s.dayOfWeek === dayOfWeek);
      const slots = generateAvailableSlots(daySchedules, 30);
      expect(slots.length).toBeGreaterThan(0);

      // 4. Bệnh nhân chọn giờ đầu tiên
      const selectedTime = slots[0].time;

      // 5. Kiểm tra xung đột
      const checkResult = checkScheduleConflict(selectedTime, dayOfWeek, mockDoctorSchedules, 30);
      expect(checkResult.available).toBe(true);
    });

    test('Xử lý lỗi khi bác sĩ không có lịch làm việc', () => {
      const result = checkScheduleConflict('09:00', 'SATURDAY', mockDoctorSchedules, 30);
      expect(result.available).toBe(false);
      expect(result.reason).toBe('NO_SCHEDULE');
      expect(result.message).toContain('không làm việc');
    });
  });
});

// ==============================================
// MANUAL TEST CASES (chạy trong browser console)
// ==============================================
console.log(`
  ╔════════════════════════════════════════════════════════╗
  ║   SCHEDULE CHECKER MANUAL TEST CASES                  ║
  ║   Chạy các test này trong browser console             ║
  ╚════════════════════════════════════════════════════════╝

  // TEST 1: Kiểm tra xung đột lịch làm việc
  console.log('TEST 1: Kiểm tra xung đột lịch làm việc');
  const schedules = [
    { dayOfWeek: 'Thứ 2', startTime: '08:00', endTime: '17:00' }
  ];
  const result1 = checkScheduleConflict('09:00', 'Thứ 2', schedules, 30);
  console.log('Giờ 09:00 Thứ 2:', result1.available ? '✓ Rảnh' : '✗ Bận');

  // TEST 2: Tạo danh sách khung giờ
  console.log('\\nTEST 2: Tạo danh sách khung giờ');
  const slots = generateAvailableSlots(schedules, 30);
  console.log('Khung giờ:', slots.map(s => s.time).join(', '));

  // TEST 3: Lấy danh sách ngày rảnh
  console.log('\\nTEST 3: Lấy danh sách ngày rảnh');
  const weekSchedules = [
    { dayOfWeek: 'Thứ 2', startTime: '08:00', endTime: '17:00' },
    { dayOfWeek: 'Thứ 3', startTime: '08:00', endTime: '17:00' },
    { dayOfWeek: 'Thứ 4', startTime: '08:00', endTime: '17:00' },
  ];
  const days = getAvailableDays(weekSchedules, 7);
  console.log('Ngày rảnh:', days.map(d => d.display).join(', '));

  // TEST 4: Thống kê lịch làm việc
  console.log('\\nTEST 4: Thống kê lịch làm việc');
  const stats = calculateWorkStats(weekSchedules);
  console.log('Tổng giờ/tuần:', stats.totalHoursPerWeek);
  console.log('Số ngày/tuần:', stats.daysPerWeek);
  console.log('Trung bình giờ/ngày:', stats.averageHoursPerDay);
`);
