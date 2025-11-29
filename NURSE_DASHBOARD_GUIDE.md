# NURSE DASHBOARD - HƯỚNG DẪN SỬ DỤNG

## 📋 Tổng Quan

NURSE Dashboard là một ứng dụng quản lý chăm sóc bệnh nhân hiện đại, được thiết kế đặc biệt cho các điều dưỡng viên trong bệnh viện. Giao diện chuyên nghiệp, dễ sử dụng trên cả desktop, tablet và mobile.

## 🎯 Các Chức Năng Chính

### 1. **Dashboard (Tab Tổng Quan)**

Hiển thị tổng quan nhanh về công việc hôm nay của bạn:

#### 📊 Thống Kê

- **Bệnh Nhân Được Giao**: Tổng số bệnh nhân được phân công chăm sóc (12 người)
- **Lịch Hẹn Hôm Nay**: Số lịch khám/lịch hẹn hôm nay (5 lịch)
- **Cần Chăm Sóc**: Bệnh nhân cần chú ý đặc biệt (3 người)
- **Dị Thường Sinh Hiệu**: Các bệnh nhân có dấu hiệu bất thường (1 người)

#### 🚨 Bệnh Nhân Cần Chú Ý

Danh sách các bệnh nhân có tình trạng cần theo dõi gần gũi:

- Hiển thị tên bệnh nhân, phòng, chẩn đoán
- Mức ưu tiên (🔴 Cao, 🟠 Trung Bình, 🟢 Thấp)
- Nhấp vào để xem chi tiết

#### ✅ Tác Vụ Hôm Nay

Danh sách các công việc cần hoàn thành:

- Kiểm tra sinh hiệu lúc 9h
- Cấp thuốc cho các bệnh nhân
- Thay băng/chỉnh chỉ
- Báo cáo với bác sĩ

---

### 2. **Danh Sách Bệnh Nhân (Tab 2)**

Bảng danh sách tất cả bệnh nhân được giao:

| Cột              | Ý Nghĩa                                            |
| ---------------- | -------------------------------------------------- |
| **Bệnh Nhân**    | Tên bệnh nhân & ID                                 |
| **Tuổi / Phòng** | Tuổi và số phòng bệnh viện                         |
| **Chẩn Đoán**    | Bệnh chính được chẩn đoán                          |
| **Tình Trạng**   | Đang chăm sóc / Cần chăm sóc / Ổn định / Nguy hiểm |
| **Ưu Tiên**      | Cao/Trung Bình/Thấp                                |
| **Sinh Hiệu**    | Lần kiểm tra sinh hiệu gần nhất                    |
| **Hành Động**    | Nút xem hồ sơ & nhập sinh hiệu                     |

**Sử dụng:**

- Nhấp biểu tượng 📄 để xem hồ sơ bệnh án
- Nhấp ❤️ để nhập/cập nhật sinh hiệu
- Sắp xếp cột bằng cách nhấp vào tiêu đề cột
- Tìm kiếm bệnh nhân bằng thanh tìm kiếm

---

### 3. **Hồ Sơ Bệnh Án (Tab 3)**

Danh sách các hồ sơ bệnh án để xem chi tiết y lệnh bác sĩ:

**Cách sử dụng:**

1. Chọn bệnh nhân từ danh sách
2. Nhấp nút "Xem Chi Tiết"
3. Drawer sẽ mở bên phải với thông tin đầy đủ:
   - **Thông Tin Bản Thân**: Nhóm máu, tuổi, phòng
   - **Dị Ứng**: Các chất bệnh nhân dị ứng (cảnh báo bằng tag đỏ)
   - **Bệnh Lý Mãn Tính**: Các bệnh tật kéo dài
   - **Thuốc Hiện Dùng**: Danh sách thuốc + liều lượng + tần suất
   - **Chẩn Đoán & Điều Trị**: Y lệnh bác sĩ, điều trị, ghi chú

---

### 4. **Sinh Hiệu & Ghi Chú (Tab 4)**

#### 🌡️ Theo Dõi Sinh Hiệu (Cột trái)

Hiển thị lịch sử sinh hiệu của bệnh nhân:

**Các chỉ số theo dõi:**

- 🌡️ **Nhiệt độ (°C)**: 36.5-37.5°C là bình thường
- ❤️ **Nhịp Tim (bpm)**: 60-100 bpm là bình thường
- 💨 **Huyết Áp (mmHg)**: 120/80 là bình thường
- 🫁 **Tần Số Hô Hấp**: 12-20 lần/phút là bình thường
- **O₂ (SpO2)**: 95-100% là bình thường

**Cách nhập sinh hiệu mới:**

1. Nhấp nút "Nhập Sinh Hiệu Mới"
2. Modal mở lên với form nhập liệu
3. Điền tất cả các chỉ số:
   - Nhiệt độ (°C)
   - Huyết áp (Ví dụ: 120/80)
   - Nhịp tim (bpm)
   - Tần số hô hấp
   - SpO₂ (%)
   - Ghi chú (tùy chọn)
4. Nhấp "Lưu" để lưu dữ liệu

#### 📝 Ghi Chú Điều Dưỡng (Cột phải)

Ghi lại các quan sát và can thiệp cho từng bệnh nhân:

**Hai loại ghi chú:**

- 🔵 **Ghi Chú Đánh Giá** (Assessment): Tình trạng, khám phá lâm sàng
  - Ví dụ: "Bệnh nhân tỉnh táo, không than phiền"
- 🟢 **Ghi Chú Can Thiệp** (Intervention): Các hành động điều dưỡng
  - Ví dụ: "Hỗ trợ bệnh nhân đi lại, chịu tốt"

**Cách thêm ghi chú:**

1. Nhấp nút "Thêm Ghi Chú" dưới tên bệnh nhân
2. Nhập nội dung ghi chú
3. Hệ thống tự động ghi thời gian và tên điều dưỡng

---

## 🎨 Hướng Dẫn Giao Diện

### Các Màu Sắc

| Màu        | Ý Nghĩa                     |
| ---------- | --------------------------- |
| 🔵 Xanh    | Thông tin, đánh giá         |
| 🟢 Xanh lá | Tốt, can thiệp tích cực     |
| 🟠 Cam     | Cảnh báo, cần chú ý         |
| 🔴 Đỏ      | Khẩn cấp, dị ứng, nguy hiểm |

### Tình Trạng Bệnh Nhân

| Tình Trạng       | Mô Tả                         | Hành Động        |
| ---------------- | ----------------------------- | ---------------- |
| ✅ Ổn định       | Bệnh nhân ổn định             | Theo dõi định kỳ |
| ⚠️ Đang chăm sóc | Đang trong quá trình điều trị | Theo dõi gần gũi |
| 🔔 Cần chăm sóc  | Cần can thiệp                 | Ưu tiên cao      |
| 🚨 Nguy hiểm     | Tình trạng nguy kịch          | Báo bác sĩ ngay  |

### Mức Ưu Tiên

- 🔴 **Cao**: Cần chú ý ngay lập tức
- 🟠 **Trung Bình**: Theo dõi định kỳ
- 🟢 **Thấp**: Hỗ trợ bình thường

---

## 📱 Sử Dụng Trên Mobile/Tablet

NURSE Dashboard được tối ưu cho sử dụng trên thiết bị di động:

✅ **Responsive Design**

- Tự động điều chỉnh kích thước trên phone, tablet, desktop
- Table cuộn ngang trên mobile
- Buttons đủ lớn để chạm dễ dàng

✅ **Touch-Friendly Interface**

- Nút lớn, dễ nhấn
- Spacing hợp lý
- Form dễ điền

✅ **Offline-Ready** (Future)

- Lưu dữ liệu cục bộ
- Đồng bộ khi có mạng

---

## 🔐 Bảo Mật & Quyền Hạn

- Bạn chỉ có thể xem thông tin bệnh nhân được giao cho mình
- Tất cả hành động được ghi lại trong audit log
- Xóa dữ liệu yêu cầu xác nhận từ quản trị viên

---

## ⌨️ Phím Tắt (Future)

| Phím     | Hành Động          |
| -------- | ------------------ |
| `Ctrl+N` | Thêm bệnh nhân mới |
| `Ctrl+V` | Nhập sinh hiệu     |
| `Ctrl+S` | Lưu dữ liệu        |
| `Esc`    | Đóng drawer/modal  |

---

## 🐛 Xử Lý Sự Cố

### Vấn đề: Form sinh hiệu không lưu

**Giải pháp:**

1. Kiểm tra kết nối mạng
2. Đảm bảo điền đủ tất cả các trường
3. Thử làm mới trang (F5)

### Vấn đề: Không thấy bệnh nhân mới được giao

**Giải pháp:**

1. Làm mới trang (F5)
2. Đăng xuất & đăng nhập lại
3. Liên hệ quản trị viên

### Vấn đề: Lỗi hiển thị trên mobile

**Giải pháp:**

1. Xoay ngang màn hình
2. Zoom ra một chút (Ctrl + -)
3. Dùng trình duyệt hiện đại (Chrome, Firefox)

---

## 📞 Hỗ Trợ

Nếu gặp bất kỳ vấn đề nào:

- 📧 Email: support@healthcare.local
- 📱 Điện thoại: 0123-456-7890
- 💬 Chat: Teams/Slack

---

## 📝 Thay Đổi Gần Đây

**v1.0 Pro (2025-11-29)**

- ✨ Giao diện hoàn toàn mới với gradient sidebar
- ✨ Thêm chức năng nhập sinh hiệu Modal
- ✨ Ghi chú điều dưỡng với category colors
- ✨ Responsive design cho mobile/tablet
- 🐛 Sửa lỗi hiển thị trên Safari
- 🚀 Tối ưu hiệu năng load dữ liệu

---

**Phiên bản:** v1.0 Pro  
**Cập nhật lần cuối:** 2025-11-29  
**Tác giả:** Healthcare System Team
