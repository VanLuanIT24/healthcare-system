# 🚀 HƯỚNG DẪN NHANH - HỆ THỐNG ĐẶT LỊCH NÂNG CAO

## 📋 Tóm tắt thay đổi

| Thành phần | Trạng thái | Ghi chú |
|-----------|----------|--------|
| **Components mới** | ✨ Mới | `DoctorAvailabilityChecker` |
| **Utilities mới** | ✨ Mới | `scheduleChecker.js` |
| **Pages mới** | ✨ Mới | `BookAppointment.jsx` |
| **Pages cập nhật** | 🔄 Update | `BookingPage.jsx`, `Schedule.jsx` |
| **Routes cập nhật** | 🔄 Update | Thêm `/patient/appointments/book` |

---

## 🎯 Chức năng chính

### **1. DoctorAvailabilityChecker Component**
**File:** `src/components/appointment/DoctorAvailabilityChecker.jsx`

```jsx
import DoctorAvailabilityChecker from '@/components/appointment/DoctorAvailabilityChecker';

<DoctorAvailabilityChecker
  doctorId="doctor123"
  selectedDate={date}
  selectedTime={time}
  onSlotSelect={(date, time) => setSlot(date, time)}
  onAvailabilityChange={(available) => setAvailable(available)}
/>
```

**Tính năng:**
- ✅ Tải lịch làm việc bác sĩ tự động
- ✅ Hiển thị 14 ngày rảnh tiếp theo
- ✅ Tạo khung giờ trống 30 phút
- ✅ Kiểm tra xung đột real-time
- ✅ Gợi ý khung giờ thay thế

### **2. Schedule Checker Utilities**
**File:** `src/services/utils/scheduleChecker.js`

```javascript
import {
  checkScheduleConflict,
  generateAvailableSlots,
  getAvailableDays,
  calculateWorkStats
} from '@/services/utils/scheduleChecker';

// Kiểm tra xung đột
const result = checkScheduleConflict('09:00', 'Thứ 2', schedules, 30);
// → { available: true, message: "...", suggestedSlots: [...] }

// Tạo danh sách khung giờ
const slots = generateAvailableSlots(schedules, 30);
// → [{ time: '08:00', available: true }, ...]

// Lấy danh sách ngày rảnh
const days = getAvailableDays(schedules, 14);
// → [{ date: '2024-01-15', display: '15/01/2024', isToday: true }, ...]

// Thống kê lịch làm việc
const stats = calculateWorkStats(schedules);
// → { totalHoursPerWeek: 40, daysPerWeek: 5, ... }
```

### **3. Trang đặt lịch trong Dashboard**
**File:** `src/pages/patient/BookAppointment.jsx`

```jsx
import BookAppointment from '@/pages/patient/BookAppointment';

// Route: /patient/appointments/book
// Yêu cầu: Đăng nhập (PATIENT role)
```

**Quy trình:** 4 bước
1. Chọn bác sĩ (filter theo chuyên khoa)
2. Chọn ngày/giờ (với kiểm tra xung đột)
3. Điền thông tin bệnh nhân
4. Xác nhận đặt lịch → Nhận mã BK

### **4. Cập nhật Booking Page (trang công khai)**
**File:** `src/pages/public/Booking/BookingPage.jsx`

- ✨ Tích hợp `DoctorAvailabilityChecker` vào Step 2
- ✨ Kiểm tra xung đột real-time
- ✨ Nút "Tiếp tục" bị vô hiệu nếu slot không khả dụng

### **5. Cập nhật Doctor Schedule Page**
**File:** `src/pages/doctor/Schedule.jsx`

**Thêm 2 tab mới:**
1. **Lịch làm việc** (cũ) - Quản lý lịch hàng tuần
2. **Lịch hẹn** (MỚI) - Xem lịch hẹn sắp tới/đã hủy/hoàn tất

---

## 🔧 Cách tích hợp

### **Cách 1: Dùng trong trang khác**

```jsx
// Trong trang của bạn
import { DoctorAvailabilityChecker } from '@/components/appointment';

export default function MyBookingPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  return (
    <DoctorAvailabilityChecker
      doctorId={doctorId}
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      onSlotSelect={(date, time) => {
        setSelectedDate(date);
        setSelectedTime(time);
      }}
      onAvailabilityChange={(available) => {
        console.log('Slot available:', available);
      }}
    />
  );
}
```

### **Cách 2: Dùng utilities trực tiếp**

```jsx
import { checkScheduleConflict, generateAvailableSlots } from '@/services/utils/scheduleChecker';

// Kiểm tra xung đột
const result = checkScheduleConflict('09:30', 'MONDAY', doctorSchedules, 30);
if (result.available) {
  console.log('✓ Khung giờ có sẵn');
} else {
  console.log('✗ Khung giờ không khả dụng');
  console.log('Gợi ý:', result.suggestedSlots);
}

// Hoặc tạo danh sách khung giờ
const slots = generateAvailableSlots(todaySchedules, 30);
slots.forEach(slot => {
  console.log(slot.time); // 08:00, 08:30, 09:00, ...
});
```

---

## 📡 API Endpoints cần có trên Backend

```javascript
// 1. Lấy lịch làm việc bác sĩ
GET /api/appointments/schedules/doctor/:doctorId
Response: [
  { _id: "...", dayOfWeek: "MONDAY", startTime: "08:00", endTime: "17:00" }
]

// 2. Tạo lịch hẹn mới
POST /api/appointments
Body: { doctorId, appointmentDate, reason, patientNotes, status }
Response: { _id: "...", status: "PENDING" }

// 3. Lấy lịch hẹn bác sĩ
GET /api/appointments/doctor/:doctorId?startDate=...&endDate=...
Response: [
  { _id: "...", patientId, appointmentDate, status, reason }
]

// 4. Tạo/Sửa/Xóa lịch làm việc
POST /api/appointments/schedules
PUT /api/appointments/schedules/:scheduleId
DELETE /api/appointments/schedules/:scheduleId
```

---

## ✅ Checklist triển khai

### **Frontend**
- [x] Tạo `DoctorAvailabilityChecker` component
- [x] Tạo `scheduleChecker` utilities
- [x] Tạo `BookAppointment` page
- [x] Cập nhật `BookingPage`
- [x] Cập nhật `Schedule` page
- [x] Cập nhật `AppRouter`
- [x] Cập nhật `appointment/index.js`

### **Backend (cần làm)**
- [ ] Verify endpoint `/api/appointments/schedules/doctor/:doctorId`
- [ ] Verify endpoint `/api/appointments/doctor/:doctorId`
- [ ] Verify kiểm tra xung đột trên backend
- [ ] Verify dữ liệu response khớp format expected
- [ ] Thêm error handling

### **Testing**
- [ ] Unit test: `scheduleChecker.js` functions
- [ ] Integration test: Booking flow
- [ ] E2E test: Full appointment booking
- [ ] Manual test: 4 user roles
- [ ] Performance test: Tải 100 schedules
- [ ] Responsive test: Mobile/Tablet/Desktop

---

## 🎬 Quy trình đặt lịch (Flow)

```
[Bệnh nhân vào /booking hoặc /patient/appointments/book]
        ↓
[Bước 1: Chọn chuyên khoa]
        ↓
[Bước 2: Chọn bác sĩ]
        → API: getDoctorSchedule(doctorId) ✓
        ↓
[DoctorAvailabilityChecker render]
        → Tính: getAvailableDays(schedules, 14) ✓
        ↓
[Bệnh nhân chọn ngày]
        → Tính: generateAvailableSlots(daySchedules) ✓
        ↓
[Hiển thị lưới khung giờ]
        ↓
[Bệnh nhân chọn giờ]
        → Tính: checkScheduleConflict(time, day, schedules) ✓
        → Kết quả: available = true/false
        ↓
[Nếu available = true]
        → Bước 3: Điền thông tin
[Nếu available = false]
        → Alert + Gợi ý khung giờ khác
        ↓
[Xác nhận]
        → API: createAppointment(data) ✓
        ↓
[Nhận mã lịch hẹn]
```

---

## 🔍 Debug Tips

### **Log xung đột lịch**
```javascript
// Thêm vào DoctorAvailabilityChecker.jsx hoặc scheduleChecker.js
console.log('Doctor Schedules:', doctorSchedules);
console.log('Available Days:', availableDays);
console.log('Slots for selected day:', availableSlots);
console.log('Check result:', checkResult);
```

### **Kiểm tra API response**
```javascript
const res = await appointmentAPI.getDoctorSchedule(doctorId);
console.log('API Response:', res.data); // Xem cấu trúc dữ liệu
```

### **Kiểm tra hàm kiểm tra xung đột**
```javascript
// Test hàm riêng biệt
const testResult = checkScheduleConflict(
  '09:00',
  'MONDAY',
  [
    { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '17:00' }
  ],
  30
);
console.log('Test result:', testResult);
// Expected: { available: true, message: "...", ... }
```

---

## 🚨 Common Issues & Solutions

### **Issue 1: "Không thể tải lịch làm việc"**
```
✓ Check: API endpoint có tồn tại?
✓ Check: doctorId format đúng?
✓ Check: JWT token hợp lệ?
✓ Check: CORS settings?
```

### **Issue 2: "Danh sách khung giờ trống"**
```
✓ Check: Schedule data format đúng?
✓ Check: dayOfWeek mapping đúng? (0-6 vs MONDAY-SUNDAY)
✓ Check: startTime/endTime format (HH:mm)?
✓ Check: Slot duration > 0?
```

### **Issue 3: "Không thể tạo lịch hẹn"**
```
✓ Check: API endpoint có tồn tại?
✓ Check: appointmentDate format (ISO 8601)?
✓ Check: doctorId/patientId valid?
✓ Check: Status field bắt buộc?
✓ Check: Error response từ backend?
```

---

## 📚 Docs tham khảo

- [BOOKING_SYSTEM_GUIDE.md](./BOOKING_SYSTEM_GUIDE.md) - Hướng dẫn chi tiết
- [APPOINTMENT_PAGES_SUMMARY.md](./APPOINTMENT_PAGES_SUMMARY.md) - Tất cả appointment pages
- [APPOINTMENT_USER_GUIDE.md](./APPOINTMENT_USER_GUIDE.md) - Hướng dẫn người dùng

---

## 💡 Pro Tips

1. **Kiểm tra thời gian:** Dùng `dayjs` cho tất cả tính toán thời gian
2. **Format ngày:** Luôn dùng `YYYY-MM-DD` cho API
3. **UTC Time:** Backend nên lưu UTC, UI convert sang local
4. **Cache lịch làm việc:** Bác sĩ thay đổi lịch không thường xuyên
5. **Lỗi graceful:** Luôn có fallback khi API bị lỗi

---

**Phiên bản:** 1.0.0  
**Ngày:** 30/12/2024  
**Status:** ✅ Ready to use
