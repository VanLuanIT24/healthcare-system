# 🏥 Hướng Dẫn Sử Dụng Hệ Thống Appointment (Lịch Hẹn)

## 📌 MỤC ĐÍCH
Tài liệu này hướng dẫn chi tiết cách sử dụng từng trang trong hệ thống quản lý lịch hẹn của bệnh viện.

---

## 🔍 QUICK NAVIGATION (Hướng dẫn nhanh)

### Cho Bệnh Nhân (PATIENT)
1. **Xem lịch của mình**: `/patient/appointments`
2. **Tạo lịch mới**: `/patient/create-appointment`
3. **Xem chi tiết lịch**: `/patient/appointments/:appointmentId`

### Cho Bác Sĩ (DOCTOR)
1. **Xem lịch khám của mình**: `/doctor/appointments`
2. **Quản lý lịch làm việc**: `/doctor/schedule`
3. **Hoàn thành lịch khám**: Chi tiết lịch → Hoàn thành (ghi chẩn đoán, kê đơn)

### Cho Lễ Tân (RECEPTIONIST)
1. **Danh sách tất cả lịch**: `/admin/appointments`
2. **Lịch hôm nay**: `/admin/appointments/today`
3. **Lịch sắp tới**: `/admin/appointments/upcoming`
4. **Tìm khung giờ trống**: `/admin/appointments/available-slots`
5. **Gửi nhắc hẹn**: `/admin/appointments/reminders`

### Cho Admin (SUPER_ADMIN, HOSPITAL_ADMIN)
1. **Tất cả trang**
2. **Thống kê**: `/admin/appointments/stats`
3. **Quản lý lịch bác sĩ**: `/admin/appointments/schedule-management`
4. **Xuất dữ liệu**: `/admin/appointments/export`
5. **Xem audit log**: `/admin/appointments/:appointmentId/logs`

---

## 📋 HƯỚNG DẪN CHI TIẾT TỪNG TRANG

### 1️⃣ Danh Sách Lịch Hẹn (Appointments List)
**URL:** `/admin/appointments`
**Ai dùng:** Receptionist, Admin, Department Head

**Các bước:**
```
1. Mở trang Danh sách lịch hẹn
2. (Tùy chọn) Lọc theo:
   - Trạng thái (Chờ xác nhận, Đã xác nhận, Hoàn thành, etc.)
   - Bác sĩ
   - Tìm kiếm bệnh nhân
3. Click vào một lịch để xem chi tiết
4. Các hành động có sẵn:
   - Xác nhận (nếu chờ xác nhận)
   - Check-in (nếu đã xác nhận)
   - Hủy lịch (ngay lập tức)
   - Đổi lịch
```

**Ví dụ workflow:**
```
Receptionist mở trang → Chọn filter "Chờ xác nhận" → Click lịch của bệnh nhân Nguyễn Văn A
→ Button "Xác nhận" → Thành công → Lịch chuyển sang "Đã xác nhận"
```

---

### 2️⃣ Lịch Hẹn Hôm Nay (Today Appointments)
**URL:** `/admin/appointments/today`
**Ai dùng:** Receptionist, Doctor, Nurse, Admin
**Tác dụng:** Quản lý nhanh các lịch trong ngày

**Các bước:**
```
1. Mở trang Lịch hôm nay
2. Thấy danh sách tất cả lịch hôm nay
3. Nhóm theo trạng thái:
   - Chờ xác nhận
   - Đã xác nhận
   - Đã check-in
   - Đang khám
4. Hành động:
   - Check-in: Click button khi bệnh nhân đến
   - Hoàn thành: Sau khi bác sĩ khám xong
   - Vắng mặt: Nếu bệnh nhân không đến
   - Hủy: Nếu cần hủy khẩn cấp
```

**Ví dụ:**
```
8:00 - Lịch của Trần Thị B (chờ xác nhận) → Click "Xác nhận" → Chuyển thành "Đã xác nhận"
→ 8:30 - Bệnh nhân đến → Click "Check-in" → Chuyển thành "Đã check-in"
→ 8:45 - Bác sĩ khám xong → Click "Hoàn thành" → Ghi chẩn đoán/kê đơn → Hoàn tất
```

---

### 3️⃣ Lịch Sắp Tới (Upcoming Appointments)
**URL:** `/admin/appointments/upcoming`
**Ai dùng:** Receptionist, Doctor, Admin
**Tác dụng:** Xem lịch sắp tới (tuần/tháng)

**Các bước:**
```
1. Mở trang Lịch sắp tới
2. Tìm kiếm: Gõ tên bệnh nhân hoặc bác sĩ
3. Sắp xếp: Chọn "Theo thời gian", "Theo trạng thái", etc.
4. Xem kết quả theo nhóm:
   - Hôm nay (0 ngày)
   - Ngày mai (1 ngày)
   - Tuần này (2-7 ngày)
   - Sau (> 7 ngày)
5. Hành động:
   - Nhắc hẹn: Gửi SMS/Email cho bệnh nhân
   - Đổi lịch: Thay đổi thời gian
   - Chi tiết: Xem thêm thông tin
```

**Ví dụ:**
```
- Hôm nay (3 lịch)
- Ngày mai (5 lịch) ← Receptionist muốn nhắc hẹn
  → Click "Nhắc hẹn" → Gửi thành công → Bệnh nhân nhận SMS
- Tuần này (12 lịch)
```

---

### 4️⃣ Tìm Khung Giờ Trống (Available Slots)
**URL:** `/admin/appointments/available-slots`
**Ai dùng:** Patient, Receptionist, Admin
**Tác dụng:** Tìm giờ trống để đặt lịch

**Các bước:**
```
1. Chọn Chuyên khoa (ví dụ: Tim mạch)
2. Chọn Bác sĩ (ví dụ: Bác sĩ Nguyễn Văn A)
3. Chọn Ngày (ví dụ: 2024-12-31)
4. Click button "Tìm kiếm"
5. Thấy danh sách giờ trống:
   - 08:00 - 08:30
   - 09:00 - 09:30
   - 10:00 - 10:30
   - etc.
6. Click vào slot cần đặt
   → Chuyển tới trang "Tạo lịch hẹn" với thông tin đã chọn
7. Điền lý do khám → Submit
```

**Ví dụ:**
```
Receptionist nhận cuộc gọi từ bệnh nhân → Mở Available Slots
→ Chọn: Khoa Tim mạch, Bác sĩ A, ngày 31/12 → Tìm
→ Thấy slot 09:00 trống → Click → Điền lý do "Khám tim" → Tạo lịch
```

---

### 5️⃣ Đổi Lịch Hẹn (Reschedule Appointment)
**URL:** `/admin/appointments/:appointmentId/reschedule`
**Ai dùng:** Receptionist, Doctor, Admin

**Các bước:**
```
1. Từ trang Danh sách lịch → Click vào lịch cần đổi
2. Hoặc vào chi tiết lịch → Button "Đổi lịch"
3. Thấy form:
   - Thông tin lịch hiện tại (read-only):
     * Bệnh nhân, bác sĩ, giờ hiện tại
   - Form để chỉnh sửa:
     * Chọn bác sĩ mới (tùy chọn)
     * Chọn ngày hẹn mới
     * Chọn khung giờ trống mới
     * Lý do khám (có thể chỉnh)
4. Click "Đổi lịch" → Cập nhật → Hoàn tất
```

**Ví dụ:**
```
Lịch hiện tại: Bệnh nhân Hoa, Bác sĩ A, 01/01 14:00 → Bệnh nhân gọi xin đổi thành sáng
→ Receptionist: Đổi lịch → Chọn 01/01 10:00 → Xác nhận
→ Lịch thay đổi: 01/01 14:00 → 01/01 10:00
```

---

### 6️⃣ Thống Kê Lịch Hẹn (Appointment Statistics)
**URL:** `/admin/appointments/stats`
**Ai dùng:** Admin, Department Head
**Tác dụng:** Phân tích, báo cáo

**Các bước:**
```
1. Lọc dữ liệu:
   - Chọn khoảng thời gian (từ - đến)
   - Chọn chuyên khoa (tùy chọn)
2. Xem kết quả:
   - 4 thẻ thống kê:
     * Tổng lịch: 150
     * Hoàn thành: 140
     * Hủy: 8
     * Vắng mặt: 2
   - Biểu đồ lịch theo ngày (line chart)
   - Biểu đồ theo trạng thái (pie chart)
   - Top 10 bác sĩ khám nhiều
3. Export dữ liệu (nếu cần) → Xuất PDF/Excel
```

**Ví dụ:**
```
Admin chọn: 01/11/2024 - 30/11/2024, Khoa Tim mạch
→ Thấy:
   - Tổng: 45 lịch
   - Hoàn thành: 42 (93%)
   - Hủy: 2 (4%)
   - Vắng mặt: 1 (3%)
   - Biểu đồ: Tuyến tính tăng từ 1-20/11, giảm 21-30/11
   - Top 3: Bác sĩ A (15), Bác sĩ B (14), Bác sĩ C (13)
```

---

### 7️⃣ Quản Lý Lịch Làm Việc Bác Sĩ (Schedule Management)
**URL:** `/admin/appointments/schedule-management`
**Ai dùng:** Department Head, Admin, Doctor (xem/edit của mình)

**Các bước:**
```
1. Chọn bác sĩ từ dropdown
2. Xem bảng lịch làm việc cố định:
   - Thứ 2: 08:00 - 12:00, 13:00 - 17:00
   - Thứ 3: 08:00 - 12:00, 13:00 - 17:00
   - etc.
3. Hành động:
   - Thêm: Click "Thêm lịch" → Chọn ngày, giờ bắt đầu, kết thúc
   - Sửa: Click "Sửa" → Thay đổi giờ → Lưu
   - Xóa: Click "Xóa" → Xác nhận → Xóa khỏi hệ thống
4. Lưu ý: Lịch này dùng để tính available slots
```

**Ví dụ:**
```
Department Head chọn Bác sĩ Nguyễn A
→ Thấy:
   - Thứ 2-5: 08:00-12:00, 13:00-17:00
   - Thứ 6: 08:00-12:00 (chiều nghỉ)
   - Thứ 7-8: Không làm
→ Muốn thêm buổi tối thứ 2: Click "Thêm" → Thứ 2, 18:00-20:00 → Lưu
```

---

### 8️⃣ Gửi Nhắc Hẹn (Appointment Reminders)
**URL:** `/admin/appointments/reminders`
**Ai dùng:** Receptionist, Admin
**Tác dụng:** Nhắc bệnh nhân sắp tới giờ khám

**Các bước:**
```
1. Chọn ngày muốn nhắc
2. (Tùy chọn) Chọn phương thức:
   - Email
   - SMS
   - Cả hai
3. Xem danh sách lịch hẹn sắp tới
4. Chọn lịch cần nhắc:
   - Click checkbox bên trái
   - Hoặc click "Gửi" trên từng lịch
5. Nếu chọn múi:
   - Button "Gửi cho X lịch" → Gửi hàng loạt
6. Thành công → Bệnh nhân nhận SMS/Email
```

**Ví dụ:**
```
Receptionist ngày 30/12:
1. Chọn ngày 31/12
2. Phương thức: Cả hai (Email + SMS)
3. Thấy 8 lịch sắp tới
4. Chọn tất cả 8 → "Gửi cho 8 lịch"
5. Tất cả bệnh nhân nhận thông báo "Bạn có lịch khám vào chiều mai 14:00"
```

---

### 9️⃣ Xuất Dữ Liệu (Export Appointments)
**URL:** `/admin/appointments/export`
**Ai dùng:** Admin
**Tác dụng:** Xuất báo cáo PDF/Excel

**Các bước:**
```
1. Chọn khoảng thời gian:
   - Từ: 01/11/2024
   - Đến: 30/11/2024
2. (Tùy chọn) Lọc trạng thái
3. Click "Xem trước" → Xem dữ liệu trước khi xuất
4. Xuất:
   - Excel: Dùng được trong spreadsheet, dễ chỉnh sửa
   - PDF: In được, chính thức, không thay đổi được
5. File download tự động
```

**Ví dụ:**
```
Admin tháng 11:
1. Chọn 01/11 - 30/11
2. Lọc: Tất cả trạng thái
3. Xem trước → OK
4. Xuất Excel → Tệp "appointments_2024-11-01_to_2024-11-30.xlsx" tải xuống
5. Mở trong Excel → Thấy 150 lịch với các cột: Ngày giờ, Bệnh nhân, Bác sĩ, Trạng thái
```

---

### 🔟 Nhật Ký Truy Cập (Access Logs)
**URL:** `/admin/appointments/:appointmentId/logs`
**Ai dùng:** Admin (Audit)
**Tác dụng:** Theo dõi ai đã xem/chỉnh sửa lịch

**Các bước:**
```
1. Mở chi tiết lịch hẹn
2. Click tab "Nhật ký" hoặc link "Xem logs"
3. Thấy bảng với cột:
   - Thời gian: 2024-12-30 10:30:45
   - Hành động: Xem, Cập nhật, Hủy
   - Người: Nguyễn A (receptionist)
   - Chức vụ: Lễ tân
   - IP: 192.168.1.1
4. Sắp xếp: Click header để sắp xếp
5. Phân trang: Xem thêm nếu có nhiều bản ghi
```

**Ví dụ:**
```
Lịch hẹn ID #12345 của bệnh nhân Hoàng:
- 01/12 08:00 | Tạo | Trần A (Receptionist) | 192.168.1.5
- 01/12 10:00 | Xem | Bác sĩ B (Doctor) | 192.168.1.10
- 01/12 14:00 | Cập nhật | Trần A (Receptionist) | 192.168.1.5 [thay đổi lịch]
- 02/12 09:00 | Check-in | Trần C (Nurse) | 192.168.1.8
- 02/12 11:00 | Hoàn thành | Bác sĩ B (Doctor) | 192.168.1.10 [ghi chẩn đoán]
```

---

## 🎯 WORKFLOW THỰC TẾ

### Workflow 1: Bệnh nhân tự đặt lịch
```
Bệnh nhân:
1. Mở app → Patient → Tạo lịch hẹn
2. Chọn chuyên khoa → bác sĩ → ngày/giờ
3. Nhập lý do khám → Submit
4. Lịch được tạo (PENDING)
5. Nhận thông báo "Lịch chờ xác nhận"

Receptionist:
1. Nhìn thấy lịch mới (PENDING) trong danh sách
2. Xác nhận lịch → Status chuyển CONFIRMED
3. Gửi SMS "Lịch khám được xác nhận"

Bệnh nhân:
4. Nhận SMS → Lịch status CONFIRMED
5. Ngày khám → Đến sớm 15 phút

Receptionist:
6. Check-in → Status CHECKED_IN
7. Bệnh nhân chờ khám

Bác sĩ:
8. Khám bệnh → Hoàn thành → Ghi chẩn đoán, kê đơn
9. Status → COMPLETED

Bệnh nhân:
10. Nhận thông báo khám xong → Nhận đơn
```

### Workflow 2: Receptionist đặt lịch thay bệnh nhân
```
Receptionist:
1. Mở Available Slots
2. Tìm khung giờ trống (Tim mạch, Bác sĩ A, 31/12)
3. Thấy giờ 09:00 trống
4. Click vào → Tạo lịch → Nhập thông tin bệnh nhân → Submit
5. Lịch được tạo và tự động CONFIRMED
6. Gọi bệnh nhân "Đã đặt lịch khám ngày 31/12 lúc 09:00"

Bệnh nhân:
7. Nhận tin nhắn xác nhận lịch

Ngày khám:
8. Bệnh nhân đến → Receptionist check-in
9. Bác sĩ khám → Hoàn thành
```

### Workflow 3: Bệnh nhân xin đổi lịch
```
Bệnh nhân:
1. Mở "Lịch của tôi" → Thấy lịch 05/01 14:00
2. Click button "Yêu cầu đổi lịch"
3. Nhập lý do "Có việc đột xuất"
4. Status → CANCEL_REQUESTED

Receptionist:
5. Thấy lịch trong status "Yêu cầu hủy"
6. Click "Duyệt" → Lịch CANCELLED
7. Mở "Tìm khung giờ trống" → Tìm giờ mới
8. Tạo lịch mới với cùng bệnh nhân
9. Gửi SMS "Lịch đã được đổi thành..."

Bệnh nhân:
10. Nhận xác nhận lịch mới
```

---

## ⚙️ TIPS & TRICKS

### 💡 Tips cho Receptionist
1. **Bulk Actions**: Gửi nhắc hẹn cho toàn bộ lịch ngày hôm sau → Tiết kiệm thời gian
2. **Search**: Dùng CTRL+F để tìm kiếm nhanh trong trang
3. **Available Slots**: Kiểm tra lịch bác sĩ trước → Biết giờ nào hay đông
4. **Notes**: Ghi chú "Bệnh nhân sợ cao tầng" để bác sĩ biết

### 💡 Tips cho Bác sĩ
1. **Schedule**: Set cố định lịch làm việc → Hệ thống tự tính available slots
2. **Today**: Mở "Lịch hôm nay" trước giờ → Chuẩn bị
3. **Complete**: Ghi đầy đủ chẩn đoán, kê đơn → Bệnh nhân có hồ sơ

### 💡 Tips cho Admin
1. **Stats**: Kiểm tra thống kê định kỳ → Biết bác sĩ nào tải nhiều
2. **Export**: Xuất dữ liệu cuối tháng → Lập báo cáo
3. **Logs**: Kiểm tra audit log nếu có khiếu nại

---

## 🐛 TROUBLESHOOTING

### ❓ Không thấy khung giờ trống?
**Giải pháp:**
- Kiểm tra lịch làm việc bác sĩ (Schedule Management)
- Có thể bác sĩ chưa set lịch cố định
- Hoặc tất cả giờ đó đã có lịch khác

### ❓ Không thể hủy lịch?
**Giải pháp:**
- Chỉ có thể hủy lịch PENDING, CONFIRMED
- Nếu COMPLETED → Không thể hủy
- Check quyền (Receptionist+ mới hủy được)

### ❓ Nhắc hẹn không được gửi?
**Giải pháp:**
- Kiểm tra số điện thoại/email bệnh nhân
- Kiểm tra provider SMS/Email đã setup chưa
- Xem logs có lỗi gì

### ❓ Lịch không hiển thị?
**Giải pháp:**
- Refresh trang (F5)
- Kiểm tra filter có lọc quá chặt không
- Logout → Login lại

---

## 📞 SUPPORT

Nếu có vấn đề, liên hệ:
- **IT Support**: support@hospital.com
- **Tech Team**: dev-team@hospital.com
- **Hotline**: 1900-XXXX

---

**Phiên bản:** 1.0.0  
**Cập nhật:** 2024-12-30  
**Trạng thái:** ✅ Production Ready
