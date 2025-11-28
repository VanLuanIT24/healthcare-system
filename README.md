<h1 align="center">🏥 Healthcare System - Full Stack Application</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-brightgreen?logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/Status-Production%20Ready-success" alt="Status" />
</p>

<p align="center">
  🚀 <b>Hệ thống quản lý y tế toàn diện</b> với backend bảo mật cao (JWT, 2FA, RBAC) và frontend hiện đại (React, Ant Design)
</p>

---

## 🎯 Giới Thiệu Dự Án

✅ **Backend:** Express.js + MongoDB + JWT Authentication  
✅ **Frontend:** React 18 + Ant Design v5 + Responsive Design  
✅ **Deployment:** Docker + Docker Compose + Nginx  
✅ **Security:** Multi-layer authentication, RBAC, Rate limiting  
✅ **Features:** 4 specialized healthcare role dashboards (Doctor, Nurse, Pharmacist, Lab Technician)

---

## 🔑 Tính Năng Chính

### 🔒 Bảo Mật & Xác Thực

- JWT Authentication với Access & Refresh Tokens thông minh
- Xác thực hai yếu tố (2FA) bằng Google Authenticator
- Hash mật khẩu với `bcrypt (12 rounds salt)`
- Rate limiting chống brute-force attacks
- CORS & Helmet bảo vệ toàn diện header
- Token rotation tự động làm mới refresh token

### 👥 Quản Lý Người Dùng (RBAC)

| Role            | Quyền hạn                          |
| --------------- | ---------------------------------- |
| **SUPER_ADMIN** | Toàn quyền, không thể xoá hoặc sửa |
| **ADMIN**       | Quản trị viên hệ thống             |
| **MANAGER**     | Quản lý phòng ban                  |
| **DOCTOR**      | Nhân viên y tế                     |
| **STAFF**       | Nhân viên hỗ trợ                   |
| **PATIENT**     | Người dùng cuối                    |

> ⚡ Super Admin được **tự động tạo khi khởi chạy lần đầu**.

---

## 👥 7 Roles Trong Hệ Thống

| Role               | Tiếng Việt               | Màu     | Chức Năng                                  |
| ------------------ | ------------------------ | ------- | ------------------------------------------ |
| **SUPER_ADMIN**    | Quản trị viên cao cấp    | Blue    | Toàn quyền hệ thống                        |
| **ADMIN**          | Quản trị viên            | Green   | Quản lý người dùng, duyệt dữ liệu          |
| **DOCTOR**         | Bác sĩ                   | Red     | Quản lý bệnh nhân, đơn thuốc, tư vấn       |
| **NURSE**          | Y tá/Điều dưỡng          | Cyan    | Theo dõi dấu hiệu sống, chăm sóc bệnh nhân |
| **PHARMACIST**     | Dược sĩ                  | Purple  | Quản lý kho thuốc, cấp phát đơn thuốc      |
| **LAB_TECHNICIAN** | Kỹ thuật viên xét nghiệm | Magenta | Quản lý test, ghi nhận kết quả             |
| **PATIENT**        | Bệnh nhân                | Default | Xem hồ sơ bệnh án, đặt lịch tái khám       |

---

## 🚀 Bắt Đầu Nhanh

### ⚡ Cài đặt & Chạy Cục Bộ

```bash
# Clone project
git clone https://github.com/VanLuanIT24/healthcare-system.git
cd healthcare-system

# Cài đặt backend
cd healthcare-backend
npm install
cp .env.example .env  # Cấu hình biến môi trường
npm run dev

# Trong terminal khác, cài đặt frontend
cd healthcare-frontend
npm install
npm run dev
```

### 🐳 Chạy với Docker (Khuyến nghị)

```bash
docker-compose up -d
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

Xem chi tiết tại: [QUICK_START.md](./QUICK_START.md) | [DOCKER_PRODUCTION.md](./DOCKER_PRODUCTION.md)

---

## 🏗️ Kiến Trúc Hệ Thống

```
healthcare-system/
├── healthcare-backend/          # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/             # JWT, DB, App config
│   │   ├── controllers/        # Request handlers
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API endpoints
│   │   ├── middlewares/        # Auth, RBAC, rate limiter
│   │   ├── services/           # Business logic
│   │   ├── utils/              # JWT, email, hash utilities
│   │   └── validations/        # Joi schemas
│   └── package.json
│
├── healthcare-frontend/         # React 18 + Ant Design
│   ├── src/
│   │   ├── pages/
│   │   │   ├── SuperAdmin/     # Admin dashboard
│   │   │   ├── Doctor/         # Doctor dashboard (mới)
│   │   │   ├── Nurse/          # Nurse dashboard (mới)
│   │   │   ├── Pharmacist/     # Pharmacist dashboard (mới)
│   │   │   ├── LabTechnician/  # Lab dashboard (mới)
│   │   │   └── Patient/        # Patient portal
│   │   ├── components/         # Reusable React components
│   │   ├── contexts/           # Auth context
│   │   ├── hooks/              # Custom hooks
│   │   ├── styles/             # CSS (including RoleDashboards.css)
│   │   ├── utils/              # Utilities
│   │   ├── App.jsx
│   │   └── index.jsx
│   └── package.json
│
├── docker-compose.yml          # Multi-container orchestration
├── nginx.conf                  # Reverse proxy config
├── docker-manage.ps1           # PowerShell helper script
├── docker-setup.sh             # Setup script
└── .env.docker                 # Docker environment variables
```

---

## 🔐 Bảo Mật

**Authentication Flow:**

- JWT-based authentication (Access Token: 15m, Refresh Token: 7d)
- Token rotation & blacklist mechanism
- bcryptjs password hashing (12 rounds)

**Authorization:**

- Role-Based Access Control (RBAC) with 7 roles
- Middleware checks at route level
- Audit logging for sensitive operations

**Additional Security:**

- Rate limiting on auth endpoints
- Helmet.js security headers
- CORS configuration
- Input validation with Joi
- SQL injection & XSS protection

---

## 📊 Công Nghệ Stack

**Backend:**

- Node.js 18+ | Express.js 4.x | MongoDB Atlas
- JWT authentication | bcryptjs | Joi validation
- Helmet.js | CORS | Rate Limiter

**Frontend:**

- React 18 | React Router v6 | Vite
- Ant Design v5 | Tailwind CSS | Axios
- Vietnamese localization (antd i18n)

**Deployment:**

- Docker & Docker Compose
- Nginx reverse proxy
- MongoDB Atlas cloud database
- Environment-based configuration

---

## 📞 Hỗ Trợ & Liên Hệ

| Thành viên           | GitHub                                           | Vai trò            |
| -------------------- | ------------------------------------------------ | ------------------ |
| **Võ Văn Luận**      | [@VanLuanIT24](https://github.com/VanLuanIT24)   | Full-stack Lead    |
| **Nguyễn Phước Đại** | [@phuocdai2004](https://github.com/phuocdai2004) | Frontend Developer |

---

## 📄 Giấy Phép

MIT License - Tự do sử dụng, sửa đổi và phân phối
🐛 Báo lỗi: GitHub Issues
💡 Đề xuất: GitHub Discussions

<p align="center"> ⭐ <b>Star</b> repository nếu bạn thấy dự án hữu ích nhé! </p> <p align="center"> Developed with ❤️ by <b>Dynamic Duo Team</b> </p>
