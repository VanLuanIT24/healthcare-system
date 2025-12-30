// src/services/utils/scheduleChecker.js - Tiện ích kiểm tra xung đột lịch làm việc bác sĩ

import dayjs from 'dayjs';

/**
 * Kiểm tra xem thời gian hẹn có xung đột với lịch làm việc bác sĩ không
 * @param {string} appointmentTime - Giờ bắt đầu hẹn (HH:mm)
 * @param {string} dayOfWeek - Ngày trong tuần (MONDAY-SUNDAY hoặc 0-6)
 * @param {Array} doctorSchedules - Danh sách lịch làm việc của bác sĩ
 * @param {number} appointmentDuration - Thời lượng hẹn (phút, mặc định 30)
 * @returns {Object} { available: boolean, message: string, suggestedSlots: Array }
 */
export const checkScheduleConflict = (
  appointmentTime,
  dayOfWeek,
  doctorSchedules = [],
  appointmentDuration = 30
) => {
  try {
    // Convert dayOfWeek to day number (0=Sun, 1=Mon, ..., 6=Sat)
    const getDayNumber = (day) => {
      if (typeof day === 'number') return day;
      const dayMap = {
        'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4,
        'FRIDAY': 5, 'SATURDAY': 6, 'SUNDAY': 0,
        'Thứ 2': 1, 'Thứ 3': 2, 'Thứ 4': 3, 'Thứ 5': 4,
        'Thứ 6': 5, 'Thứ 7': 6, 'Chủ nhật': 0
      };
      return dayMap[day] || parseInt(day);
    };

    const appointmentDayNum = getDayNumber(dayOfWeek);
    const [appHour, appMin] = appointmentTime.split(':').map(Number);
    const appStartMinutes = appHour * 60 + appMin;
    const appEndMinutes = appStartMinutes + appointmentDuration;

    // Tìm lịch làm việc của bác sĩ trong ngày đó
    const daySchedules = doctorSchedules.filter(schedule => {
      const scheduleDayNum = getDayNumber(schedule.dayOfWeek);
      return scheduleDayNum === appointmentDayNum;
    });

    // Nếu không có lịch làm việc trong ngày này
    if (daySchedules.length === 0) {
      return {
        available: false,
        message: `Bác sĩ không làm việc vào ${getDayName(appointmentDayNum)}. Vui lòng chọn ngày khác.`,
        suggestedSlots: [],
        reason: 'NO_SCHEDULE'
      };
    }

    // Kiểm tra xung đột với mỗi khoảng làm việc
    for (const schedule of daySchedules) {
      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);
      
      const workStartMinutes = startHour * 60 + startMin;
      const workEndMinutes = endHour * 60 + endMin;

      // Kiểm tra xem thời gian hẹn có nằm trong giờ làm việc không
      if (appStartMinutes >= workStartMinutes && appEndMinutes <= workEndMinutes) {
        return {
          available: true,
          message: 'Bác sĩ rảnh rỗi vào thời gian này',
          suggestedSlots: [],
          reason: 'AVAILABLE',
          schedule: schedule
        };
      }
    }

    // Nếu không nằm trong giờ làm việc, gợi ý các khung giờ trống
    const suggestedSlots = generateAvailableSlots(daySchedules, appointmentDuration);

    return {
      available: false,
      message: `Thời gian ${appointmentTime} không nằm trong giờ làm việc của bác sĩ. Vui lòng chọn giờ khác.`,
      suggestedSlots: suggestedSlots,
      reason: 'OUTSIDE_WORKING_HOURS'
    };
  } catch (error) {
    console.error('Error checking schedule conflict:', error);
    return {
      available: false,
      message: 'Lỗi kiểm tra lịch làm việc',
      suggestedSlots: [],
      reason: 'ERROR'
    };
  }
};

/**
 * Kiểm tra xem lịch hẹn có xung đột với các hẹn khác không
 * @param {string} appointmentTime - Giờ bắt đầu hẹn (HH:mm)
 * @param {string} appointmentDate - Ngày hẹn (YYYY-MM-DD)
 * @param {Array} existingAppointments - Danh sách các hẹn hiện tại
 * @param {number} appointmentDuration - Thời lượng hẹn (phút, mặc định 30)
 * @returns {Object} { conflict: boolean, message: string }
 */
export const checkAppointmentConflict = (
  appointmentTime,
  appointmentDate,
  existingAppointments = [],
  appointmentDuration = 30
) => {
  try {
    const [appHour, appMin] = appointmentTime.split(':').map(Number);
    const appStartMinutes = appHour * 60 + appMin;
    const appEndMinutes = appStartMinutes + appointmentDuration;

    for (const appt of existingAppointments) {
      if (appt.appointmentDate.substring(0, 10) === appointmentDate) {
        const [existHour, existMin] = appt.appointmentDate.split('T')[1].split(':').map(Number);
        const existStartMinutes = existHour * 60 + existMin;
        const existEndMinutes = existStartMinutes + (appt.duration || 30);

        // Kiểm tra xung đột: nếu thời gian hẹn mới trùng lặp với hẹn hiện tại
        if (
          (appStartMinutes < existEndMinutes && appEndMinutes > existStartMinutes)
        ) {
          return {
            conflict: true,
            message: `Bác sĩ đã có lịch hẹn vào lúc ${appt.appointmentDate.split('T')[1].substring(0, 5)}. Vui lòng chọn giờ khác.`,
            conflictingAppointment: appt
          };
        }
      }
    }

    return {
      conflict: false,
      message: 'Thời gian hẹn không xung đột'
    };
  } catch (error) {
    console.error('Error checking appointment conflict:', error);
    return {
      conflict: false,
      message: 'Không thể kiểm tra xung đột'
    };
  }
};

/**
 * Tạo danh sách các khung giờ trống trong ngày
 * @param {Array} schedules - Danh sách lịch làm việc trong ngày
 * @param {number} slotDuration - Thời lượng mỗi khung giờ (phút)
 * @returns {Array} Danh sách các khung giờ trống
 */
export const generateAvailableSlots = (schedules = [], slotDuration = 30) => {
  const slots = [];

  for (const schedule of schedules) {
    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes + slotDuration <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

      slots.push({
        time: timeStr,
        hours: hours,
        minutes: minutes,
        available: true,
        schedule: schedule
      });

      currentMinutes += slotDuration;
    }
  }

  return slots;
};

/**
 * Lấy danh sách các ngày rảnh trong tuần tiếp theo
 * @param {Array} doctorSchedules - Danh sách lịch làm việc của bác sĩ
 * @param {number} daysAhead - Số ngày cần kiểm tra (mặc định 7)
 * @returns {Array} Danh sách các ngày rảnh
 */
export const getAvailableDays = (doctorSchedules = [], daysAhead = 7) => {
  const availableDays = [];
  const today = dayjs();

  for (let i = 0; i < daysAhead; i++) {
    const checkDate = today.add(i, 'day');
    const dayOfWeek = checkDate.day(); // 0=Sun, 1=Mon, ..., 6=Sat

    const hasSchedule = doctorSchedules.some(schedule => {
      const scheduleDayNum = getDayNumberFromWeekday(schedule.dayOfWeek);
      return scheduleDayNum === dayOfWeek;
    });

    if (hasSchedule) {
      availableDays.push({
        date: checkDate.format('YYYY-MM-DD'),
        dayOfWeek: checkDate.format('dddd'),
        display: checkDate.format('DD/MM/YYYY'),
        dayNum: dayOfWeek,
        isToday: i === 0,
        isTomorrow: i === 1
      });
    }
  }

  return availableDays;
};

/**
 * Tính toán thời gian còn lại trên lịch làm việc
 * @param {Array} doctorSchedules - Danh sách lịch làm việc
 * @returns {Object} Thống kê thời gian làm việc
 */
export const calculateWorkStats = (doctorSchedules = []) => {
  let totalHours = 0;
  let daysPerWeek = 0;
  const hoursPerDay = {};

  for (const schedule of doctorSchedules) {
    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const hoursWorked = (endMinutes - startMinutes) / 60;

    totalHours += hoursWorked;
    if (!hoursPerDay[schedule.dayOfWeek]) {
      hoursPerDay[schedule.dayOfWeek] = 0;
      daysPerWeek++;
    }
    hoursPerDay[schedule.dayOfWeek] += hoursWorked;
  }

  return {
    totalHoursPerWeek: totalHours,
    daysPerWeek: daysPerWeek,
    averageHoursPerDay: daysPerWeek > 0 ? totalHours / daysPerWeek : 0,
    hoursPerDay: hoursPerDay
  };
};

/**
 * Helper: Lấy tên ngày từ số ngày
 */
function getDayName(dayNum) {
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  return days[dayNum] || '';
}

/**
 * Helper: Lấy số ngày từ định dạng ngày trong tuần
 */
function getDayNumberFromWeekday(dayOfWeek) {
  if (typeof dayOfWeek === 'number') return dayOfWeek;
  const dayMap = {
    'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4,
    'FRIDAY': 5, 'SATURDAY': 6, 'SUNDAY': 0,
    'Thứ 2': 1, 'Thứ 3': 2, 'Thứ 4': 3, 'Thứ 5': 4,
    'Thứ 6': 5, 'Thứ 7': 6, 'Chủ nhật': 0
  };
  return dayMap[dayOfWeek] || 0;
}

export default {
  checkScheduleConflict,
  checkAppointmentConflict,
  generateAvailableSlots,
  getAvailableDays,
  calculateWorkStats
};
