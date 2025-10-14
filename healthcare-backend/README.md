🏥 Healthcare Authentication System
https://img.shields.io/badge/Node.js-18%252B-green
https://img.shields.io/badge/Express.js-4.x-lightgrey
https://img.shields.io/badge/MongoDB-Atlas-brightgreen
https://img.shields.io/badge/JWT-Authentication-orange
https://img.shields.io/badge/Status-Active-success

Hệ thống xác thực toàn diện và bảo mật cao cho các ứng dụng healthcare, được phát triển bởi nhóm sinh viên với kiến trúc microservices và công nghệ hiện đại.

👨‍💻 Về Nhóm Phát Triển
Team: Dynamic Duo - Hai sinh viên với đam mê lập trình và sáng tạo

🎯 Thành Viên Nhóm
Thành Viên	Vai Trò	Công Việc Chính	Đóng Góp
Võ Văn Luận (Leader)	Full-stack Developer	🚀 Kiến trúc hệ thống, Backend core, Database design, Security implementation	Architect & Backend Lead - Phụ trách thiết kế kiến trúc tổng thể, phát triển toàn bộ backend, triển khai cơ chế bảo mật, và tích hợp database
Nguyễn Phước Đại	Frontend Developer	🎨 UI/UX design, Frontend development, API integration	Frontend Specialist - Phụ trách phát triển giao diện người dùng, thiết kế trải nghiệm và tích hợp API
🏆 Đặc Điểm Nổi Bật Của Dự Án
Kiến trúc microservices hiện đại, dễ mở rộng

Bảo mật đa tầng với JWT, 2FA, rate limiting

Code quality với validation, error handling chuyên nghiệp

Documentation đầy đủ và dễ hiểu

✨ Tính Năng Nổi Bật
🔐 Hệ Thống Bảo Mật Nâng Cao
🔑 JWT Authentication với cơ chế Access & Refresh tokens thông minh

📱 Xác thực 2 yếu tố (2FA) tích hợp Google Authenticator

🔒 Mã hóa mật khẩu với bcrypt (12 rounds salt)

🛡️ Rate limiting thông minh chống brute-force attacks

🚫 CORS & Helmet bảo vệ toàn diện headers và CSRF

🔄 Token rotation tự động làm mới refresh tokens

👥 Quản Lý Người Dùng Đa Cấp
🎯 Role-Based Access Control (RBAC) với 6 vai trò chuyên biệt:

SUPER_ADMIN - Toàn quyền hệ thống, quản lý cấp cao

ADMIN - Quản trị viên hệ thống

MANAGER - Quản lý phòng ban

DOCTOR - Bác sĩ, nhân viên y tế

STAFF - Nhân viên hỗ trợ

PATIENT - Bệnh nhân sử dụng dịch vụ

📊 Phân quyền chi tiết theo từng hành động và tính năng

👑 Tự động tạo Super Admin khi khởi chạy hệ thống

📊 Giám Sát & Quản Trị
📝 Audit Trail ghi lại toàn bộ hành động quan trọng

🔍 Logging hệ thống với 5 mức độ chi tiết

❤️ Health check endpoints giám sát hoạt động real-time

📈 Performance monitoring với compression và caching

🚀 Bắt Đầu Nhanh
Yêu Cầu Hệ Thống
Node.js 18+

MongoDB Atlas hoặc MongoDB local

npm hoặc yarn

📥 Cài Đặt & Triển Khai
Clone repository

bash
git clone https://github.com/VanLuanIT24/healthcare-system.git
cd healthcare-system
Cài đặt dependencies

bash
npm install
Cấu hình environment

bash
cp .env.example .env
# Chỉnh sửa file .env với cấu hình của bạn
Khởi chạy ứng dụng

bash
# Development mode với hot reload
npm run dev

# Production mode
npm start

# Hoặc chạy với Docker
docker-compose up -d
⚙️ Cấu Hình Environment
Tạo file .env trong thư mục gốc với nội dung sau:

env
# ============ CORE CONFIGURATION ============
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# ============ DATABASE CONFIGURATION ============
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/healthcare?retryWrites=true&w=majority

# ============ JWT SECURITY ============
JWT_ACCESS_SECRET=your_super_secure_access_secret_2024
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_2024
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# ============ PASSWORD SECURITY ============
SALT_ROUNDS=12

# ============ RATE LIMITING & SECURITY ============
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=15m

# ============ SUPER ADMIN ACCOUNT ============
SUPER_ADMIN_EMAIL=superadmin@healthcare.vn
SUPER_ADMIN_PASSWORD=SuperSecurePassword2024!
SUPER_ADMIN_NAME=System Root Administrator

# ============ EMAIL SERVICE ============
EMAIL_FROM=noreply@healthcare.vn
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# ============ LOGGING & MONITORING ============
LOG_LEVEL=info
ENABLE_AUDIT_LOG=true
AUDIT_LOG_RETENTION_DAYS=90
📚 API Documentation
🔐 Authentication Endpoints
Method	Endpoint	Description	Access	Request Body
POST	/api/auth/register	Đăng ký tài khoản mới	Public	email, name, password, role
POST	/api/auth/login	Đăng nhập hệ thống	Public	email, password, twoFACode
POST	/api/auth/logout	Đăng xuất hệ thống	Private	-
POST	/api/auth/refresh	Làm mới access token	Public	-
GET	/api/auth/2fa/generate	Tạo secret key 2FA	Private	-
POST	/api/auth/2fa/enable	Kích hoạt xác thực 2FA	Private	token, base32
🩺 Health & Monitoring
Method	Endpoint	Description
GET	/health	Health check hệ thống
GET	/api/debug/config	Debug info (development only)
📝 Ví dụ Request/Response
Đăng nhập:

bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "doctor@hospital.vn",
  "password": "SecurePassword123",
  "twoFACode": "123456"  # Optional for 2FA
}
Response thành công:

json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "doctor@hospital.vn",
    "role": "DOCTOR",
    "name": "Dr. John Doe"
  },
  "message": "Đăng nhập thành công"
}
Đăng ký tài khoản:

bash
POST /api/auth/register
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "email": "newdoctor@hospital.vn",
  "name": "Dr. Jane Smith",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123",
  "role": "DOCTOR"
}
🏗️ Kiến Trúc Hệ Thống
text
healthcare-system/
├── 📁 src/
│   ├── 📁 config/           # Cấu hình hệ thống
│   │   ├── app.config.js    # Main application config
│   │   ├── db.config.js     # Database configuration
│   │   └── jwt.config.js    # JWT settings
│   ├── 📁 controllers/      # Request handlers
│   │   └── auth.controller.js
│   ├── 📁 models/          # Database schemas
│   │   ├── user.model.js
│   │   ├── auditLog.model.js
│   │   └── refreshToken.model.js
│   ├── 📁 routes/          # API routes
│   │   └── auth.routes.js
│   ├── 📁 middlewares/     # Custom middlewares
│   │   ├── auth.middleware.js
│   │   ├── rbac.middleware.js
│   │   └── rateLimiter.js
│   ├── 📁 services/        # Business logic
│   │   ├── auth.service.js
│   │   └── audit.service.js
│   ├── 📁 utils/           # Utilities
│   │   ├── jwt.js
│   │   ├── hash.js
│   │   └── email.js
│   ├── 📁 validations/     # Validation schemas
│   │   └── auth.validation.js
│   └── 🚀 app.js           # Application entry point
├── 📄 .env                 # Environment variables
├── 📄 package.json         # Dependencies
└── 📄 README.md           # Documentation
🔐 Mô Hình Bảo Mật
🎯 Token Flow & Security
Đăng nhập → Nhận Access Token (15 phút) + Refresh Token (7 ngày) trong HttpOnly cookie

Gọi API → Gửi Access Token trong header Authorization: Bearer <token>

Token hết hạn → Dùng Refresh Token để lấy Access Token mới

Token rotation → Tự động tạo Refresh Token mới, vô hiệu hóa token cũ

🛡️ RBAC Permissions Matrix
javascript
{
  SUPER_ADMIN: ['CREATE_ADMIN', 'CREATE_MANAGER', 'READ_ANY_USER', 'UPDATE_ANY_USER', 'VIEW_AUDIT_LOGS'],
  ADMIN: ['CREATE_MANAGER', 'CREATE_DOCTOR', 'CREATE_STAFF', 'CREATE_PATIENT', 'READ_ANY_USER'],
  MANAGER: ['CREATE_DOCTOR', 'CREATE_STAFF', 'READ_ANY_USER'],
  DOCTOR: ['READ_ANY_USER'],
  STAFF: [],
  PATIENT: []
}
🐳 Docker Deployment
Sử dụng Docker Compose
yaml
# docker-compose.yml
version: '3.8'
services:
  healthcare-auth:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=${MONGO_URI}
    env_file:
      - .env
Build và chạy
bash
# Build image
docker build -t healthcare-auth .

# Run với Docker Compose
docker-compose up -d

# Hoặc run trực tiếp
docker run -p 5000:5000 --env-file .env healthcare-auth
🧪 Testing
bash
# Chạy unit tests
npm test

# Chạy tests với coverage report
npm run test:coverage

# Chạy integration tests
npm run test:integration

# Chạy tests với watch mode
npm run test:watch
📊 Monitoring & Health Check
Hệ thống cung cấp endpoint giám sát toàn diện:

bash
# Health check
GET /health

# Response mẫu
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600.25,
  "environment": "production",
  "version": "1.0.0",
  "database": "connected",
  "memoryUsage": "45.2%"
}
🤝 Quy Trình Đóng Góp
Chúng tôi hoan nghênh mọi đóng góp từ cộng đồng! Quy trình đóng góp:

Fork repository

Tạo feature branch (git checkout -b feature/AmazingFeature)

Commit changes (git commit -m 'Add some AmazingFeature')

Push to branch (git push origin feature/AmazingFeature)

Mở Pull Request

📋 Coding Standards
Tuân thủ ESLint configuration

Viết tests cho tính năng mới

Cập nhật documentation

Follow commit message convention

📄 License
Dự án được phân phối dưới MIT License. Xem file LICENSE để biết thêm chi tiết.

🆘 Hỗ Trợ & Tài Nguyên
📚 Documentation: GitHub Wiki

🐛 Bug Reports: GitHub Issues

💡 Feature Requests: GitHub Discussions

📧 Contact:

Võ Văn Luận: GitHub

Nguyễn Phước Đại: [GitHub Profile]

🙏 Ghi Nhận & Công Nghệ
Cảm ơn các thư viện mã nguồn mở đã giúp xây dựng dự án:

Technology	Purpose	Website
Express.js	Web Framework	expressjs.com
MongoDB	Database	mongodb.com
JWT	Authentication	jwt.io
Joi	Validation	joi.dev
bcryptjs	Password Hashing	npmjs.com
Helmet	Security Headers	helmetjs.github.io
<div align="center">
⭐ Đừng quên star repository nếu bạn thấy dự án hữu ích!

Developed with ❤️ by Dynamic Duo Team

</div> ```

