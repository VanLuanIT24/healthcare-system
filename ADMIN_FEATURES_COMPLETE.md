# 🏥 Hướng Dẫn Sử Dụng Admin Portal - Đã Cập Nhật

## ✅ CÁC CHỨC NĂNG ĐÃ HOÀN THIỆN

### 1. **Quản Lý Nhân Viên (Staff Management)**

#### **StaffList.jsx** - Danh sách nhân viên
✅ **Chức năng đã có:**
- Xem danh sách tất cả nhân viên
- Tìm kiếm theo tên, email
- Lọc theo vai trò (Role)
- Lọc theo trạng thái (Status)
- Phân trang
- Actions:
  - 👁️ Xem chi tiết
  - ✏️ Chỉnh sửa
  - 🔒 Vô hiệu hóa / Kích hoạt

#### **StaffDetail.jsx** - Chi tiết nhân viên
✅ **Chức năng đã có:**
- Xem đầy đủ thông tin cá nhân
- Xem thông tin chuyên môn
- Xem phân quyền
- Xem lịch làm việc
- Actions:
  - ✏️ **Chỉnh sửa** (Mở modal)
  - 🔒 **Vô hiệu hóa** nhân viên
  - 🔓 **Kích hoạt** lại nhân viên
  - 🗑️ **Xóa** nhân viên (soft delete)

#### **EditStaffModal.jsx** - Modal chỉnh sửa (MỚI TẠO)
✅ **Các field có thể sửa:**
- Họ, Tên
- Email (disabled - không thể sửa)
- Số điện thoại
- Ngày sinh
- Giới tính
- Vai trò (Role)
- Khoa/Phòng ban
- Chuyên môn
- Số chứng chỉ hành nghề
- Chức vụ
- Trạng thái

**API được sử dụng:**
```javascript
// Lấy danh sách
staffApi.getList({ page, limit, role, status, department, search })

// Lấy chi tiết
staffApi.getById(staffId)

// Cập nhật
staffApi.update(staffId, updateData)

// Vô hiệu hóa
staffApi.disable(staffId, reason)

// Kích hoạt
staffApi.enable(staffId)

// Xóa
staffApi.delete(staffId, reason)
```

---

### 2. **Quản Lý Bệnh Nhân (Patient Management)**

#### **PatientList.jsx** - Danh sách bệnh nhân
✅ **Chức năng đã có:**
- Xem danh sách tất cả bệnh nhân
- Tìm kiếm theo tên, email, số điện thoại
- Lọc theo trạng thái
- Phân trang
- Actions:
  - 👁️ Xem chi tiết
  - ✏️ Chỉnh sửa
  - 📅 Đặt lịch khám

#### **PatientDetail.jsx** - Chi tiết bệnh nhân
✅ **Chức năng đã có:**
- Xem thông tin cá nhân đầy đủ
- Xem hồ sơ bệnh án
- Xem lịch hẹn
- Xem đơn thuốc
- Xem kết quả xét nghiệm
- Xem hóa đơn
- Actions:
  - ✏️ **Chỉnh sửa** (Mở modal)
  - 📅 **Đặt lịch khám**

#### **EditPatientModal.jsx** - Modal chỉnh sửa (MỚI TẠO)
✅ **Các field có thể sửa:**
- **Thông tin cá nhân:**
  - Họ, Tên
  - Email
  - Số điện thoại
  - Ngày sinh
  - Giới tính
  - Nhóm máu
  - Chiều cao, Cân nặng
  
- **Địa chỉ:**
  - Số nhà / Đường
  - Thành phố
  - Tỉnh/Thành
  - Mã bưu điện
  
- **Người liên hệ khẩn cấp:**
  - Họ tên
  - Mối quan hệ
  - Số điện thoại

**API được sử dụng:**
```javascript
// Tìm kiếm bệnh nhân
patientApi.search({ keyword, page, limit, sortBy, sortOrder })

// Lấy thông tin demographics
patientApi.getDemographics(patientId)

// Cập nhật demographics
patientApi.updateDemographics(patientId, updateData)

// Lấy bảo hiểm
patientApi.getInsurance(patientId)

// Cập nhật bảo hiểm
patientApi.updateInsurance(patientId, insuranceData)

// Lấy dị ứng
patientApi.getAllergies(patientId)

// Cập nhật dị ứng
patientApi.updateAllergies(patientId, allergiesData)
```

---

### 3. **Quản Lý Lịch Hẹn (Appointment Management)**

#### **AppointmentList.jsx**
✅ **Chức năng đã có:**
- Xem danh sách lịch hẹn
- Xem theo lịch (Calendar view)
- Xem theo danh sách (List view)
- Lọc theo ngày
- Lọc theo trạng thái
- Thống kê:
  - Lịch hẹn đã lên
  - Đã xác nhận
  - Đã hoàn thành
  - Đã hủy

**API được sử dụng:**
```javascript
// Lấy danh sách lịch hẹn
appointmentApi.getList({ 
  page, limit, status, startDate, endDate, doctorId, patientId 
})

// Tạo lịch hẹn
appointmentApi.create(appointmentData)

// Cập nhật lịch hẹn
appointmentApi.update(appointmentId, updateData)

// Hủy lịch hẹn
appointmentApi.cancel(appointmentId, reason)

// Hoàn thành lịch hẹn
appointmentApi.complete(appointmentId)

// Lấy lịch bác sĩ
appointmentApi.getDoctorSchedule(doctorId, date)
```

---

### 4. **Quản Lý Thuốc (Medication/Pharmacy)**

#### **PharmacyDashboard.jsx**
✅ **Chức năng đã có:**
- Xem danh sách thuốc
- Tìm kiếm thuốc
- Lọc theo danh mục
- Lọc theo trạng thái
- Thống kê:
  - Tổng số thuốc
  - Sắp hết hàng
  - Hết hàng
  - Thêm gần đây

**API được sử dụng:**
```javascript
// Lấy danh sách thuốc
pharmacyApi.getMedications({ page, limit, search, category, status })

// Lấy thống kê
pharmacyApi.getStats()

// Lấy chi tiết thuốc
pharmacyApi.getMedicationById(medicationId)

// Tạo thuốc mới
pharmacyApi.createMedication(medicationData)

// Cập nhật thuốc
pharmacyApi.updateMedication(medicationId, updateData)

// Cập nhật tồn kho
pharmacyApi.updateStock(medicationId, stockData)

// Xóa thuốc
pharmacyApi.deleteMedication(medicationId)
```

---

### 5. **Quản Lý Xét Nghiệm (Laboratory)**

#### **LabDashboard.jsx**
✅ **Chức năng đã có:**
- Xem danh sách phiếu xét nghiệm
- Lọc theo trạng thái
- Thống kê:
  - Chờ xử lý
  - Đang xử lý
  - Hoàn thành
  - Tỷ lệ hoàn thành

**API được sử dụng:**
```javascript
// Lấy danh sách phiếu XN
laboratoryApi.getOrders({ page, limit, status, patientId })

// Lấy thống kê
laboratoryApi.getStats()

// Lấy chi tiết phiếu XN
laboratoryApi.getOrderById(orderId)

// Tạo phiếu XN
laboratoryApi.createOrder(orderData)

// Cập nhật kết quả
laboratoryApi.updateResult(orderId, resultData)
```

---

## 🔐 PHÂN QUYỀN ADMIN

### **SUPER_ADMIN** có toàn quyền:
- ✅ Xem, thêm, sửa, xóa tất cả nhân viên
- ✅ Xem, thêm, sửa bệnh nhân
- ✅ Quản lý lịch hẹn
- ✅ Xem/sửa đơn thuốc
- ✅ Xem/sửa xét nghiệm
- ✅ Xem hóa đơn
- ✅ Xem báo cáo
- ✅ Cấu hình hệ thống

### **HOSPITAL_ADMIN** có quyền:
- ✅ Xem, thêm, sửa nhân viên (trừ SUPER_ADMIN)
- ✅ Xem, thêm, sửa bệnh nhân
- ✅ Quản lý lịch hẹn
- ✅ Xem đơn thuốc, xét nghiệm
- ✅ Xem báo cáo

---

## 📝 CÁC API ENDPOINT BACKEND

### User/Staff Routes
```
GET    /api/users                    - Danh sách nhân viên
GET    /api/users/:userId            - Chi tiết nhân viên
POST   /api/users                    - Tạo nhân viên mới
PUT    /api/users/:userId            - Cập nhật nhân viên
PATCH  /api/users/:userId/disable    - Vô hiệu hóa
PATCH  /api/users/:userId/enable     - Kích hoạt
DELETE /api/users/:userId            - Xóa nhân viên
```

### Patient Routes
```
GET    /api/patients/search                      - Tìm kiếm bệnh nhân
POST   /api/patients/register                    - Đăng ký bệnh nhân mới
GET    /api/patients/:patientId/demographics     - Lấy thông tin demographics
PUT    /api/patients/:patientId/demographics     - Cập nhật demographics
GET    /api/patients/:patientId/insurance        - Lấy thông tin bảo hiểm
PUT    /api/patients/:patientId/insurance        - Cập nhật bảo hiểm
GET    /api/patients/:patientId/allergies        - Lấy dị ứng
PUT    /api/patients/:patientId/allergies        - Cập nhật dị ứng
POST   /api/patients/:patientId/admit            - Nhập viện
POST   /api/patients/:patientId/discharge        - Xuất viện
```

### Appointment Routes
```
GET    /api/appointments                              - Danh sách lịch hẹn
GET    /api/appointments/:appointmentId              - Chi tiết lịch hẹn
POST   /api/appointments                             - Tạo lịch hẹn
PUT    /api/appointments/:appointmentId              - Cập nhật
PATCH  /api/appointments/:appointmentId/cancel       - Hủy lịch
PATCH  /api/appointments/:appointmentId/complete     - Hoàn thành
GET    /api/appointments/schedule/:doctorId          - Lịch bác sĩ
```

### Medication Routes
```
GET    /api/medications              - Danh sách thuốc
GET    /api/medications/stats        - Thống kê
GET    /api/medications/:id          - Chi tiết thuốc
POST   /api/medications              - Tạo thuốc mới
PUT    /api/medications/:id          - Cập nhật
POST   /api/medications/:id/stock    - Cập nhật tồn kho
DELETE /api/medications/:id          - Xóa thuốc
```

### Laboratory Routes
```
GET    /api/laboratory/orders              - Danh sách phiếu XN
GET    /api/laboratory/stats               - Thống kê
GET    /api/laboratory/orders/:orderId     - Chi tiết phiếu XN
POST   /api/laboratory/orders              - Tạo phiếu XN
PUT    /api/laboratory/orders/:orderId/result  - Cập nhật kết quả
```

---

## 🚀 CÁCH SỬ DỤNG

### 1. Xem Chi Tiết Nhân Viên
```javascript
// Từ StaffList, click vào hàng hoặc nút "Xem chi tiết"
navigate(`/admin/staff/${staffId}`)

// Tại StaffDetail, có thể:
// - Nhấn "Chỉnh sửa" để mở modal
// - Nhấn "Vô hiệu hóa" để khóa tài khoản
// - Nhấn "Xóa" để xóa nhân viên
```

### 2. Chỉnh Sửa Nhân Viên
```javascript
// Nhấn nút "Chỉnh sửa" -> Modal EditStaffModal mở ra
// Thay đổi thông tin cần thiết
// Nhấn "Lưu Thay Đổi"
// API: PUT /api/users/:userId được gọi
// Sau khi thành công, tự động refresh data
```

### 3. Xem Chi Tiết Bệnh Nhân
```javascript
// Từ PatientList, click vào hàng hoặc nút "Xem chi tiết"
navigate(`/admin/patients/${patientId}`)

// Tại PatientDetail, có các tab:
// - Tổng quan: Thông tin cơ bản
// - Hồ sơ bệnh án: Medical records
// - Lịch hẹn: Appointments
// - Đơn thuốc: Prescriptions
// - Xét nghiệm: Lab results
// - Hóa đơn: Bills
```

### 4. Chỉnh Sửa Bệnh Nhân
```javascript
// Nhấn nút "Chỉnh sửa" -> Modal EditPatientModal mở ra
// Có thể sửa:
// - Thông tin cá nhân
// - Địa chỉ
// - Người liên hệ khẩn cấp
// Nhấn "Lưu Thay Đổi"
// API: PUT /api/patients/:patientId/demographics được gọi
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. **Token Authentication**
Tất cả API đều yêu cầu Bearer token:
```javascript
// Token được lấy từ localStorage
const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

// Tự động thêm vào headers bởi adminApi service
headers: {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### 2. **RBAC - Role Based Access Control**
Backend kiểm tra quyền ở mỗi endpoint:
- SUPER_ADMIN: Toàn quyền
- HOSPITAL_ADMIN: Hầu hết quyền
- DEPARTMENT_HEAD: Quyền trong khoa
- DOCTOR, NURSE: Quyền xem và cập nhật bệnh án
- RECEPTIONIST: Đăng ký bệnh nhân, lịch hẹn
- PHARMACIST: Quản lý thuốc
- LAB_TECHNICIAN: Quản lý xét nghiệm
- BILLING_STAFF: Quản lý hóa đơn

### 3. **Error Handling**
Tất cả components đều có error handling:
```javascript
try {
  const response = await api.someMethod();
  // Xử lý thành công
} catch (error) {
  console.error('Error:', error);
  message.error(error.response?.data?.message || 'Lỗi không xác định');
}
```

### 4. **Data Refresh**
Sau khi thực hiện hành động (Create, Update, Delete), tự động refresh:
```javascript
// Sau khi update thành công
onSuccess={() => {
  fetchData(); // Refresh lại data
  setModalVisible(false); // Đóng modal
}}
```

---

## 🔧 TROUBLESHOOTING

### Lỗi 401 Unauthorized
```
❌ Token không hợp lệ
✅ Giải pháp: Đăng nhập lại
```

### Lỗi 403 Forbidden
```
❌ Không có quyền thực hiện hành động này
✅ Giải pháp: Kiểm tra role của user
```

### Lỗi 404 Not Found
```
❌ API endpoint không tồn tại
✅ Giải pháp: Kiểm tra backend có route này chưa
```

### Modal không mở
```
❌ Modal state không cập nhật
✅ Giải pháp: Kiểm tra visible prop và setState
```

### Data không refresh
```
❌ Không gọi fetchData() sau update
✅ Giải pháp: Thêm fetchData() vào onSuccess callback
```

---

## 📊 DASHBOARD & THỐNG KÊ

### AdminOverviewDashboard
- Tổng quan hệ thống
- Thống kê số liệu quan trọng
- Biểu đồ doanh thu
- Hoạt động gần đây

### ReportsPage
- Báo cáo lâm sàng
- Báo cáo tài chính
- Báo cáo dược
- Báo cáo nhân sự

---

## 🎯 ROADMAP TIẾP THEO

### Đã hoàn thành ✅
- [x] Staff Management (List, Detail, Edit, Disable, Enable, Delete)
- [x] Patient Management (List, Detail, Edit)
- [x] Edit Modals for Staff and Patient
- [x] Medication API integration
- [x] Laboratory Dashboard
- [x] Report API

### Cần làm tiếp 🚧
- [ ] Appointment Detail Modal với edit/cancel
- [ ] Billing Management (Create, Edit, Payment)
- [ ] Medical Records Management
- [ ] Prescription Management từ admin
- [ ] Settings Page (System configuration)
- [ ] Audit Log viewer
- [ ] Export to Excel/PDF
- [ ] Print functionality
- [ ] Advanced search filters
- [ ] Bulk operations

---

**Tác giả:** Võ Văn Luận  
**Ngày cập nhật:** 03/12/2025  
**Phiên bản:** 2.0
