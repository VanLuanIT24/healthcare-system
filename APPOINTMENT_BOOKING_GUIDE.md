# 🎯 Hướng Dẫn Chức Năng Đặt Lịch Hẹn Bệnh Nhân

## 📋 Tổng Quan

Tính năng cho phép bệnh nhân **đặt lịch hẹn với bác sĩ** một cách dễ dàng thông qua giao diện dashboard. Bệnh nhân có thể:

1. ✅ Xem danh sách bác sĩ khả dụng
2. ✅ Chọn ngày khám
3. ✅ Chọn khung giờ khả dụng
4. ✅ Nhập lý do khám và ghi chú
5. ✅ Xác nhận đặt lịch

---

## 🏗️ Kiến Trúc Hệ Thống

### Frontend Components

#### 1. **BookingAppointmentModal.jsx** (Component Booking)

📁 Vị trí: `healthcare-frontend/src/components/BookingAppointmentModal.jsx`

**Chức năng:**

- Modal 2 bước để đặt lịch hẹn
- Bước 1: Chọn bác sĩ từ danh sách
- Bước 2: Chọn ngày, giờ và nhập thông tin

**Props:**

```jsx
<BookingAppointmentModal
  visible={boolean}          // Hiển thị/ẩn modal
  onClose={function}         // Callback khi đóng modal
  onSuccess={function}       // Callback khi đặt lịch thành công
/>
```

**Key Features:**

- Tải danh sách bác sĩ tự động
- Hiển thị thông tin chi tiết bác sĩ (chuyên khoa, email, phone)
- Hiển thị khung giờ khả dụng
- Validation dữ liệu trước khi submit
- Loading states và error handling

#### 2. **Patient Dashboard.jsx** (Integration)

📁 Vị trí: `healthcare-frontend/src/pages/Patient/Dashboard.jsx`

**Thay đổi:**

- Thêm import component `BookingAppointmentModal`
- Thêm state `bookingModalVisible`
- Thêm button "Đặt Lịch Hẹn" trong tabs Lịch hẹn
- Thêm modal component ở cuối JSX

**Code:**

```jsx
const [bookingModalVisible, setBookingModalVisible] = useState(false);

// Trong appointments tab
<Button
  type="primary"
  icon={<PlusOutlined />}
  onClick={() => setBookingModalVisible(true)}
>
  Đặt Lịch Hẹn
</Button>

// Ở cuối component
<BookingAppointmentModal
  visible={bookingModalVisible}
  onClose={() => setBookingModalVisible(false)}
  onSuccess={loadDashboardData}
/>
```

---

### Backend API Endpoints

#### 1. **GET /api/users/doctors** - Lấy Danh Sách Bác Sĩ

📁 Controller: `healthcare-backend/src/controllers/user.controller.js`
📁 Route: `healthcare-backend/src/routes/user.routes.js` (dòng ~75)

**Phương thức:** `getDoctors()`

**Parameters:**

```
Query Parameters:
- search?: string              // Tìm kiếm theo tên, email, phone
- specialization?: string      // Lọc theo chuyên khoa
- page?: number (default: 1)   // Trang
- limit?: number (default: 10) // Số lượng/trang
```

**Response:**

```json
{
  "success": true,
  "message": "Danh sách bác sĩ",
  "data": [
    {
      "_id": "doctor_id",
      "name": "Dr. Nguyễn Văn A",
      "personalInfo": {
        "firstName": "Nguyễn",
        "lastName": "Văn A"
      },
      "email": "doctor@example.com",
      "phone": "0912345678",
      "specialization": "Nội khoa",
      "role": "DOCTOR",
      "isActive": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 5,
    "itemsPerPage": 10
  }
}
```

#### 2. **GET /api/patient-portal/appointments/available-slots/:doctorId** - Lấy Khung Giờ Khả Dụng

📁 Controller: `healthcare-backend/src/controllers/patientPortal/appointments.controller.js`
📁 Route: `healthcare-backend/src/routes/patientPortal/appointments.routes.js` (dòng ~58)

**Phương thức:** `getAvailableSlots()`

**Parameters:**

```
URL Parameters:
- doctorId: string             // ID của bác sĩ

Query Parameters:
- appointmentDate: string      // Ngày khám (YYYY-MM-DD format)
```

**Response:**

```json
{
  "success": true,
  "message": "Available slots retrieved successfully",
  "data": [
    {
      "time": "09:00",
      "available": true
    },
    {
      "time": "09:30",
      "available": true
    },
    {
      "time": "10:00",
      "available": true
    }
  ]
}
```

#### 3. **POST /api/patient-portal/appointments** - Đặt Lịch Hẹn

📁 Controller: `healthcare-backend/src/controllers/patientPortal/appointments.controller.js`
📁 Route: `healthcare-backend/src/routes/patientPortal/appointments.routes.js` (dòng ~71)

**Phương thức:** `bookAppointment()`

**Request Body:**

```json
{
  "doctorId": "doctor_id",
  "appointmentDate": "2024-12-10",
  "appointmentTime": "09:30",
  "reason": "Khám thường quy",
  "type": "Consultation",
  "notes": "Ghi chú thêm (nếu có)"
}
```

**Validation Schema:** (`healthcare-backend/src/routes/patientPortal/appointments.routes.js`)

```javascript
const bookAppointmentSchema = Joi.object({
  doctorId: Joi.string().required(),
  departmentId: Joi.string().required(),
  appointmentType: Joi.string()
    .valid("Consultation", "Follow-up", "Routine")
    .required(),
  preferredDate: Joi.date().required(),
  preferredTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  reason: Joi.string().max(500).optional(),
  notes: Joi.string().max(500).optional(),
});
```

**Response:**

```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "_id": "appointment_id",
    "patientId": "patient_id",
    "doctorId": "doctor_id",
    "appointmentDate": "2024-12-10T09:30:00Z",
    "appointmentTime": "09:30",
    "reason": "Khám thường quy",
    "type": "Consultation",
    "status": "SCHEDULED",
    "notes": "Ghi chú thêm",
    "createdAt": "2024-12-03T10:30:00Z"
  }
}
```

---

## 🔄 Luồng Dữ Liệu (Data Flow)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Bệnh Nhân Dashboard                          │
│                                                                 │
│  [Lịch Hẹn Tab] ────→ [Nút Đặt Lịch Hẹn] ────→ [Modal Mở]      │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│            BookingAppointmentModal - Bước 1                     │
│                                                                 │
│  GET /api/users/doctors                                         │
│            │                                                    │
│            ▼                                                    │
│  [Danh Sách Bác Sĩ] ◄── Response: Array of Doctors             │
│            │                                                    │
│            │ (User chọn bác sĩ)                                │
│            ▼                                                    │
│         [Tiếp tục] ────→ Bước 2                               │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│        BookingAppointmentModal - Bước 2                         │
│                                                                 │
│  GET /api/patient-portal/appointments/available-slots/:id      │
│            │                                                    │
│            ▼                                                    │
│  [Chọn Ngày] ────→ [Khung Giờ Khả Dụng]                       │
│            │                                                    │
│  [Loại Hẹn] ────→ [Lý Do Khám] ────→ [Ghi Chú]                │
│            │                                                    │
│            │ (User nhập thông tin & click Đặt)                │
│            ▼                                                    │
│  POST /api/patient-portal/appointments                          │
│            │                                                    │
│            ▼                                                    │
│  Response: Appointment Created Successfully                    │
│            │                                                    │
│            ▼                                                    │
│  [Modal Đóng] ────→ [Dashboard Refresh] ────→ [Hiển Thị Mới]   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📡 API Calls Flow

### Step 1: Load Doctors

```javascript
// Frontend: BookingAppointmentModal.jsx
const fetchDoctors = async () => {
  const response = await axios.get(`${API_URL}/users/doctors`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  setDoctors(response.data.data);
};
```

### Step 2: Load Available Slots

```javascript
// Frontend: BookingAppointmentModal.jsx
const fetchAvailableSlots = async (doctorId, date) => {
  const response = await axios.get(
    `${API_URL}/patient-portal/appointments/available-slots/${doctorId}`,
    {
      params: { appointmentDate: date.toISOString().split("T")[0] },
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  setAvailableSlots(response.data.data);
};
```

### Step 3: Submit Booking

```javascript
// Frontend: BookingAppointmentModal.jsx
const appointmentData = {
  doctorId: values.doctorId,
  appointmentDate: values.appointmentDate.toDate(),
  appointmentTime: values.preferredTime,
  reason: values.reason,
  type: values.appointmentType,
  notes: values.notes,
};

const response = await axios.post(
  `${API_URL}/patient-portal/appointments`,
  appointmentData,
  { headers: { Authorization: `Bearer ${token}` } }
);
```

---

## 🗄️ Database Models

### Appointment Model

📁 Vị trí: `healthcare-backend/src/models/appointment.model.js`

**Key Fields:**

```javascript
{
  appointmentId: String,           // Unique appointment ID
  patientId: ObjectId,             // Reference to Patient
  doctorId: ObjectId,              // Reference to Doctor
  appointmentDate: Date,           // Appointment date & time
  duration: Number,                // Duration in minutes (default: 30)
  type: String,                    // CONSULTATION, FOLLOW_UP, CHECKUP, etc.
  mode: String,                    // IN_PERSON, TELEMEDICINE, PHONE
  location: String,                // Location/Room
  room: String,                    // Room number
  reason: String,                  // Reason for visit
  description: String,             // Detailed description
  symptoms: [String],              // Symptoms array
  status: String,                  // SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
  reminders: {
    smsSent: Boolean,
    emailSent: Boolean,
    reminderDate: Date
  },
  cancellation: {
    cancelledBy: ObjectId,
    cancellationDate: Date,
    reason: String,
    notes: String
  },
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

## ✅ Validation & Error Handling

### Frontend Validation

```javascript
// Bước 1: Doctor selection
- Doctor ID must be selected

// Bước 2: Appointment details
- appointmentDate: Required, must be future date
- appointmentTime: Required, must match available slots
- appointmentType: Required, valid values only
- reason: Required, max 500 characters
- notes: Optional, max 500 characters
```

### Backend Validation

```javascript
// bookAppointmentSchema (Joi)
{
  doctorId: Joi.string().required(),
  appointmentDate: Joi.date().required(),
  appointmentTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  reason: Joi.string().max(500).required(),
  type: Joi.string()
    .valid("Consultation", "Follow-up", "Routine")
    .required(),
  notes: Joi.string().max(500).optional()
}
```

### Error Handling

```javascript
Try/Catch Blocks:
- Doctor not found → 404 AppError
- Invalid time slot → 400 AppError
- Database errors → 500 Server Error
- Validation errors → 400 Validation Error

User Feedback:
- Success: "Đặt lịch hẹn thành công!"
- Error: Display specific error message
- Loading: Show spinner during API calls
```

---

## 🚀 Cách Sử Dụng (Usage)

### Bệnh Nhân:

1. Đăng nhập vào dashboard
2. Chuyển đến tab "Lịch hẹn"
3. Click nút "Đặt Lịch Hẹn"
4. Chọn bác sĩ từ danh sách
5. Chọn ngày khám
6. Chọn khung giờ khả dụng
7. Nhập loại hẹn, lý do khám
8. Click "Đặt Lịch Hẹn"
9. Xem thông báo thành công
10. Dashboard tự động refresh hiển thị lịch mới

### Lập Trình Viên:

#### Integration vào component khác:

```jsx
import BookingAppointmentModal from "./components/BookingAppointmentModal";

export default function MyComponent() {
  const [visible, setVisible] = useState(false);
  const [refreshData, setRefreshData] = useState(false);

  return (
    <>
      <Button onClick={() => setVisible(true)}>Đặt Lịch Hẹn</Button>

      <BookingAppointmentModal
        visible={visible}
        onClose={() => setVisible(false)}
        onSuccess={() => {
          setRefreshData(!refreshData);
        }}
      />
    </>
  );
}
```

#### Customize thông tin bác sĩ hiển thị:

```jsx
// Trong BookingAppointmentModal.jsx
const getDoctorDisplayName = (doctor) => {
  // Thay đổi format hiển thị tên bác sĩ
  return `${doctor.name}`;
};
```

---

## 📊 Testing Checklist

- [ ] Đăng nhập thành công
- [ ] Click nút "Đặt Lịch Hẹn" mở modal
- [ ] Modal hiển thị danh sách bác sĩ
- [ ] Chọn bác sĩ → chuyển sang bước 2
- [ ] Chọn ngày → load khung giờ khả dụng
- [ ] Khung giờ hiển thị đúng (9:00 - 17:00, khoảng 30 phút)
- [ ] Chọn khung giờ → button Đặt Lịch Hẹn enabled
- [ ] Nhập thông tin → Validation works
- [ ] Click Đặt Lịch Hẹn → API call thành công
- [ ] Dashboard refresh → hiển thị lịch mới
- [ ] Error handling: hiển thị lỗi đúng (nếu có)

---

## 🔧 Troubleshooting

### 1. Modal không mở

```
❌ Kiểm tra:
- State bookingModalVisible đã được set?
- Component BookingAppointmentModal được import?
- visible prop đã được pass đúng?
```

### 2. Danh sách bác sĩ trống

```
❌ Kiểm tra:
- API endpoint /users/doctors có hoạt động?
- Có bác sĩ nào trong database?
- Token xác thực có hợp lệ?
- Check browser console for errors
```

### 3. Khung giờ không hiển thị

```
❌ Kiểm tra:
- Ngày được chọn đúng định dạng?
- API /available-slots/:doctorId trả về data?
- Response data có chứa array?
```

### 4. Không thể đặt lịch

```
❌ Kiểm tra:
- Validation errors? Check form validation
- API endpoint /patient-portal/appointments?
- Request body đúng format?
- Response status 201?
```

---

## 📚 Related Files Summary

| File                                         | Purpose                | Key Methods                                                 |
| -------------------------------------------- | ---------------------- | ----------------------------------------------------------- |
| `BookingAppointmentModal.jsx`                | UI Modal cho booking   | `fetchDoctors()`, `fetchAvailableSlots()`, `handleSubmit()` |
| `Patient/Dashboard.jsx`                      | Main patient interface | `loadDashboardData()`, `setBookingModalVisible()`           |
| `user.controller.js`                         | Get doctors            | `getDoctors()`                                              |
| `user.routes.js`                             | Doctor listing route   | `GET /doctors`                                              |
| `appointments.controller.js` (patientPortal) | Booking logic          | `getAvailableSlots()`, `bookAppointment()`                  |
| `appointments.routes.js` (patientPortal)     | Appointment routes     | GET/POST routes                                             |
| `appointment.model.js`                       | Database schema        | Appointment collection                                      |

---

## 🎓 Thuật Toán & Lý Thuyết

### 1. Time Slot Generation Algorithm

```
Input: startTime, endTime, slotDuration, breaks
Output: Array of available time slots

Algorithm:
1. Parse start time and end time
2. For each 30-minute interval from start to end:
   a. Check if slot falls within break period
   b. If not, add to available slots
3. Return available slots
```

### 2. Conflict Detection

```
When booking appointment:
1. Check if doctor has existing appointment at same time
2. Validate: appointmentDate >= now
3. Validate: appointmentTime in available slots
4. If any conflict → reject with error
```

### 3. State Management Flow

```
Modal State:
- step 1: Choose doctor
- step 2: Choose date/time and submit

UI State:
- loading: Loading doctors/slots
- loadingSlots: Loading available slots
- visible: Modal visible/hidden
- selectedDoctor: Currently selected doctor
- selectedDate: Currently selected date
```

---

**Cập nhật lần cuối:** 2024-12-03  
**Version:** 1.0  
**Author:** Healthcare System Dev Team
