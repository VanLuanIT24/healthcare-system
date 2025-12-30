# 📅 HỆ THỐNG ĐẶT LỊCH HẸN NÂNG CAO

## ✅ Các tính năng được triển khai

### 1. **Bệnh nhân đặt lịch hẹn**
Bệnh nhân có thể đặt lịch hẹn từ 2 nơi:

#### a) Trang chủ đặt lịch công khai: `http://localhost:5173/booking`
- Không cần đăng nhập
- Chọn chuyên khoa → Chọn bác sĩ → Chọn ngày/giờ → Điền thông tin → Xác nhận

#### b) Dashboard bệnh nhân: `/patient/appointments/book`
- Cần đăng nhập (PATIENT role)
- Truy cập từ menu "Đặt lịch mới" hoặc nút "Đặt lịch" trong dashboard
- Giao diện tương tự, được tích hợp trong hệ thống

---

## 🔍 Kiểm tra xung đột lịch làm việc bác sĩ

### **Cách hoạt động:**

#### **Bước 1: Tải lịch làm việc bác sĩ**
```javascript
// Khi bệnh nhân chọn bác sĩ, hệ thống tự động tải lịch làm việc
const res = await appointmentAPI.getDoctorSchedule(doctorId);
// Trả về: [
//   { dayOfWeek: 'Thứ 2', startTime: '08:00', endTime: '17:00' },
//   { dayOfWeek: 'Thứ 3', startTime: '08:00', endTime: '17:00' },
//   ...
// ]
```

#### **Bước 2: Hiển thị ngày rảnh**
Component `DoctorAvailabilityChecker` sẽ:
- ✅ Chỉ cho phép chọn ngày mà bác sĩ làm việc
- ✅ Hiển thị tất cả ngày rảnh trong 14 ngày tới
- ✅ Ghi chú "Hôm nay" nếu hôm nay bác sĩ làm việc
- ✅ Ghi chú "Ngày mai" nếu ngày mai bác sĩ làm việc

#### **Bước 3: Tạo danh sách khung giờ trống**
Khi bệnh nhân chọn 1 ngày:
```javascript
// Ví dụ: Bác sĩ làm việc 08:00 - 17:00
// Hệ thống tạo ra các khung giờ 30 phút:
const slots = [
  { time: '08:00', available: true },
  { time: '08:30', available: true },
  { time: '09:00', available: true },
  ...
  { time: '16:30', available: true }
]
// Tổng cộng: 18 khung giờ
```

#### **Bước 4: Kiểm tra xung đột**
Khi bệnh nhân chọn 1 khung giờ:
```javascript
// Hệ thống kiểm tra:
1. ✅ Thời gian có nằm trong giờ làm việc của bác sĩ không?
2. ✅ Bác sĩ đã có lịch hẹn khác vào giờ này không?

// Nếu OK → Hiển thị "✓ Khung giờ có sẵn" (màu xanh)
// Nếu KHÔNG OK → Hiển thị "✗ Khung giờ không khả dụng" (màu đỏ) + Gợi ý các khung giờ khác
```

#### **Bước 5: Gợi ý khung giờ khác**
Nếu khung giờ được chọn không khả dụng:
- Hệ thống gợi ý tất cả khung giờ trống khác trong ngày
- Hoặc gợi ý những ngày khác bác sĩ rãnh

---

## 🏥 Bác sĩ quản lý lịch làm việc và lịch hẹn

### **Route: `/doctor/schedule`**

Bác sĩ có thể:

#### **1. Quản lý lịch làm việc (Tab đầu tiên)**

**Thêm/Sửa/Xóa lịch làm việc:**
```
Hôm nay: 08:00 - 17:00 ✓
Ngày mai: 08:00 - 17:00 ✓
...Chủ nhật: Không làm việc
```

**Form thêm lịch làm việc:**
- Chọn ngày trong tuần (Thứ 2 - Chủ nhật)
- Nhập giờ bắt đầu (HH:mm)
- Nhập giờ kết thúc (HH:mm)
- Kích "Thêm" hoặc "Cập nhật"

#### **2. Xem lịch hẹn (Tab thứ hai)**

**Tab "Sắp tới"** (PENDING + CONFIRMED):
- Danh sách tất cả lịch hẹn sắp tới
- Hiển thị: Tên bệnh nhân, ngày giờ, lý do khám
- Status: "Đã xác nhận" hoặc "Chờ xác nhận"

**Tab "Đã hủy"** (CANCELLED):
- Danh sách lịch hẹn đã bị hủy
- Hiển thị mờ nhạt với gạch ngang

**Tab "Hoàn tất"** (COMPLETED):
- Danh sách lịch hẹn đã hoàn thành
- Có thể xem ghi chú chẩn đoán

---

## 🔐 Quyền hạn người dùng

### **Bệnh nhân (PATIENT)**
- ✅ Đặt lịch hẹn mới (via `/patient/appointments/book`)
- ✅ Xem lịch hẹn của mình
- ✅ Hủy/Yêu cầu hủy lịch hẹn
- ❌ Xem lịch làm việc bác sĩ (ẩn, nhưng được kiểm tra phía backend)

### **Bác sĩ (DOCTOR)**
- ✅ Quản lý lịch làm việc cá nhân
- ✅ Xem tất cả lịch hẹn của mình
- ✅ Xác nhận/Hủy lịch hẹn
- ✅ Ghi chú kết quả khám

### **Quản lý (RECEPTIONIST)**
- ✅ Đặt lịch hẹn cho bệnh nhân
- ✅ Xem/Quản lý tất cả lịch hẹn
- ✅ Kiểm tra xung đột lịch

### **Admin (SUPER_ADMIN, HOSPITAL_ADMIN)**
- ✅ Quản lý tất cả bác sĩ + lịch làm việc
- ✅ Quản lý tất cả lịch hẹn
- ✅ Xem báo cáo thống kê

---

## 📁 Cấu trúc file mới

```
healthcare-frontend/
├── src/
│   ├── components/
│   │   └── appointment/
│   │       ├── AppointmentStatusTag.jsx (cũ)
│   │       ├── AppointmentCard.jsx (cũ)
│   │       ├── AppointmentForm.jsx (cũ)
│   │       ├── DoctorAvailabilityChecker.jsx ✨ MỚI
│   │       └── index.js (cập nhật)
│   │
│   ├── services/
│   │   ├── api/
│   │   │   └── appointmentAPI.js (cũ)
│   │   └── utils/
│   │       └── scheduleChecker.js ✨ MỚI
│   │
│   ├── pages/
│   │   ├── public/
│   │   │   └── Booking/
│   │   │       └── BookingPage.jsx (cập nhật)
│   │   ├── patient/
│   │   │   └── BookAppointment.jsx ✨ MỚI
│   │   └── doctor/
│   │       └── Schedule.jsx (cập nhật)
│   │
│   └── router/
│       └── AppRouter.jsx (cập nhật)
```

---

## 🧪 Hàm kiểm tra xung đột

### **File: `src/services/utils/scheduleChecker.js`**

#### **1. `checkScheduleConflict(time, dayOfWeek, doctorSchedules)`**
```javascript
const result = checkScheduleConflict(
  '09:00',                    // Giờ cần kiểm tra
  'Thứ 2',                    // Ngày cần kiểm tra
  doctorSchedules,            // Lịch làm việc bác sĩ
  30                          // Thời lượng (phút)
);

// Kết quả:
{
  available: true,            // Có sẵn không?
  message: "Bác sĩ rảnh rỗi vào thời gian này",
  suggestedSlots: [],         // Các khung giờ khác nếu xung đột
  reason: 'AVAILABLE'
}
```

#### **2. `generateAvailableSlots(schedules, slotDuration = 30)`**
```javascript
const slots = generateAvailableSlots(daySchedules, 30);

// Kết quả:
[
  { time: '08:00', hours: 8, minutes: 0, available: true },
  { time: '08:30', hours: 8, minutes: 30, available: true },
  { time: '09:00', hours: 9, minutes: 0, available: true },
  ...
]
```

#### **3. `getAvailableDays(doctorSchedules, daysAhead = 7)`**
```javascript
const days = getAvailableDays(doctorSchedules, 14);

// Kết quả:
[
  { date: '2024-01-15', dayOfWeek: 'Monday', display: '15/01/2024', isToday: true },
  { date: '2024-01-16', dayOfWeek: 'Tuesday', display: '16/01/2024', isTomorrow: true },
  ...
]
```

---

## 🔌 API Endpoints được sử dụng

### **Lấy lịch làm việc bác sĩ**
```
GET /api/appointments/schedules/doctor/{doctorId}
Response: [
  { _id: "...", dayOfWeek: "Thứ 2", startTime: "08:00", endTime: "17:00", isAvailable: true }
]
```

### **Tạo lịch hẹn mới**
```
POST /api/appointments
Body: {
  doctorId: "...",
  appointmentDate: "2024-01-15T09:00:00",
  reason: "Khám tổng quát",
  status: "PENDING"
}
Response: { _id: "...", status: "PENDING", ... }
```

### **Lấy lịch hẹn của bác sĩ**
```
GET /api/appointments/doctor/{doctorId}?startDate=...&endDate=...
Response: [
  { _id: "...", patientId: "...", appointmentDate: "...", status: "CONFIRMED" }
]
```

---

## 💻 Cách sử dụng

### **1️⃣ Bệnh nhân đặt lịch tại `/booking`**

```javascript
// Quy trình:
1. Chọn chuyên khoa (Tim mạch, Nhi khoa, ...)
2. Chọn bác sĩ (danh sách được lọc theo chuyên khoa)
3. Chọn ngày (DoctorAvailabilityChecker hiển thị ngày bác sĩ rảnh)
4. Chọn giờ (Tạo danh sách khung giờ trống)
5. Điền thông tin (Họ tên, SĐT, Email, Lý do)
6. Xác nhận (Gửi POST request)
7. Nhận mã lịch hẹn (BK + 8 số random)
```

### **2️⃣ Bệnh nhân đặt lịch trong dashboard `/patient/appointments/book`**

```javascript
// Tương tự như trên nhưng:
- Cần login (PATIENT role)
- Tích hợp trong PatientLayout
- Có nút "Quay lại dashboard"
```

### **3️⃣ Bác sĩ quản lý lịch `/doctor/schedule`**

```javascript
// Tab 1: Lịch làm việc
1. Click "Thêm lịch làm việc"
2. Chọn ngày (Thứ 2, Thứ 3, ...)
3. Nhập giờ bắt đầu/kết thúc (TimePicker)
4. Click "Thêm"
5. Xem danh sách lịch làm việc (bảng + calendar overview)

// Tab 2: Lịch hẹn
1. Xem tất cả lịch hẹn sắp tới
2. Xem lịch hẹn đã hủy
3. Xem lịch hẹn đã hoàn thành
4. Click vào để xem chi tiết
```

---

## 🎨 Giao diện thành phần

### **Component: `DoctorAvailabilityChecker`**

**Props:**
```javascript
<DoctorAvailabilityChecker
  doctorId={selectedDoctor}                    // ID bác sĩ
  selectedDate={selectedDate}                  // Ngày đã chọn
  selectedTime={selectedTime}                  // Giờ đã chọn
  onSlotSelect={(date, time) => {...}}        // Callback khi chọn khung giờ
  onAvailabilityChange={(available) => {...}} // Callback thay đổi tính khả dụng
  className="mb-4"                            // CSS class
/>
```

**Hiển thị:**
1. **Chọn ngày:** DatePicker + Danh sách tag ngày rảnh
2. **Chọn giờ:** Lưới button khung giờ (3-6 cột tùy responsive)
3. **Kết quả kiểm tra:** Alert xanh (có sẵn) hoặc vàng (không sẵn)
4. **Thông tin lịch làm việc:** Card hiển thị các ngày làm việc của bác sĩ

---

## ⚙️ Cấu hình hệ thống

### **Thời lượng mặc định mỗi khung giờ: 30 phút**
```javascript
// Có thể thay đổi trong DoctorAvailabilityChecker
const appointmentDuration = 30; // phút
```

### **Số ngày kiểm tra phía trước: 14 ngày**
```javascript
const daysAhead = 14; // getAvailableDays(schedules, 14)
```

### **Thời gian lấy dữ liệu lịch hẹn: 30 ngày tới**
```javascript
const endDate = dayjs().add(30, 'days').format('YYYY-MM-DD');
```

---

## 🐛 Xử lý lỗi

### **Khi không có lịch làm việc**
```
Hiển thị: "Bác sĩ không làm việc vào {ngày}. Vui lòng chọn ngày khác."
```

### **Khi không có khung giờ trống**
```
Hiển thị: Empty state "Không có khung giờ trống trong ngày này"
```

### **Khi API bị lỗi**
```
Hiển thị: Alert đỏ + Message "Lỗi kiểm tra lịch rảnh"
```

---

## 📱 Responsive Design

- **Mobile (< 768px):** Các nút khung giờ = 3 cột
- **Tablet (768px - 1024px):** Các nút khung giờ = 4 cột
- **Desktop (> 1024px):** Các nút khung giờ = 6 cột

---

## 🔒 Bảo mật

1. ✅ **Backend kiểm tra quyền:** Chỉ có doctorId owner mới xem được lịch hẹn
2. ✅ **Xác thực JWT:** Tất cả request có Authorization header
3. ✅ **Validate dữ liệu:** Backend kiểm tra xung đột thêm lần nữa
4. ✅ **Audit logging:** Ghi nhật ký tất cả thay đổi lịch hẹn

---

## 📊 Metrics & Monitoring

**Theo dõi:**
- Số lịch hẹn tạo mỗi ngày
- Số lịch hẹn bị hủy
- Thời gian trung bình từ chọn ngày đến xác nhận
- Lỗi kiểm tra xung đột

---

## 🚀 Bước tiếp theo (Phase 2)

- [ ] **Thông báo tự động:** SMS/Email nhắc hẹn 1 ngày trước
- [ ] **Video call:** Tích hợp call khám từ xa
- [ ] **Phản hồi sau khám:** Bệnh nhân đánh giá bác sĩ
- [ ] **Xuất hóa đơn:** Tự động tạo invoice
- [ ] **Hỗ trợ đặt lịch định kỳ:** Lặp lại hàng tuần/tháng
- [ ] **In phiếu khám:** PDF tải về
- [ ] **QR code:** Check-in bằng QR code

---

**Phiên bản:** 1.0.0  
**Ngày cập nhật:** 30/12/2024  
**Trạng thái:** ✅ Hoàn thành
