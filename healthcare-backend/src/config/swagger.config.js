// healthcare-backend/src/config/swagger.config.js
/**
 * 📚 CẤU HÌNH SWAGGER API DOCUMENTATION
 * Healthcare System API - Version 1.0.0
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🏥 Healthcare System API',
      version: '1.0.0',
      description: `
# 🏥 Hệ thống Quản lý Y tế - API Documentation

## 📋 Tổng quan
Đây là tài liệu API đầy đủ cho Hệ thống Quản lý Y tế (Healthcare Management System). 
Hệ thống cung cấp các API RESTful để quản lý toàn bộ quy trình khám chữa bệnh.

## 🔑 Xác thực
Hầu hết các API yêu cầu xác thực bằng JWT Token. Click nút **Authorize** ở trên và nhập token:
\`\`\`
Bearer <your_access_token>
\`\`\`

## 📚 Nhóm API

| Nhóm | Mô tả |
|------|-------|
| 🌐 **Public** | API công khai, không cần đăng nhập |
| 🔐 **Auth** | Đăng nhập, đăng ký, quản lý phiên |
| 👥 **Users** | Quản lý tài khoản người dùng |
| 🏥 **Patients** | Hồ sơ bệnh nhân |
| 👨‍⚕️ **Doctors** | Quản lý bác sĩ |
| 📅 **Appointments** | Đặt lịch khám |
| 🩺 **Clinical** | Khám bệnh, chẩn đoán |
| 💊 **Prescriptions** | Đơn thuốc |
| 🔬 **Laboratory** | Xét nghiệm |
| 💰 **Billing** | Thanh toán |
| 🛏️ **Beds** | Giường bệnh |
| 📦 **Inventory** | Kho vật tư |
| 🔔 **Notifications** | Thông báo |
| 📊 **Reports** | Báo cáo thống kê |

## 🚀 Bắt đầu nhanh
1. Đăng nhập qua \`POST /api/auth/login\`
2. Lấy \`accessToken\` từ response
3. Nhấn **Authorize** và nhập token
4. Thử các API!

## 📞 Liên hệ hỗ trợ
- **Email**: support@healthcare-system.com
- **GitHub**: [VanLuanIT24/healthcare-system](https://github.com/VanLuanIT24/healthcare-system)
      `,
      contact: {
        name: 'Healthcare Development Team',
        email: 'support@healthcare-system.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'https://healthcare-system-backend-tav7.onrender.com',
        description: '🚀 Production Server (Render)'
      },
      {
        url: 'http://localhost:5000',
        description: '🔧 Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Nhập JWT token của bạn. Ví dụ: "Bearer {token}"'
        }
      },
      schemas: {
        // ===== ERROR RESPONSES =====
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Mô tả lỗi' },
            code: { type: 'string', example: 'ERROR_CODE' }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Validation failed' },
            code: { type: 'string', example: 'VALIDATION_ERROR' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },

        // ===== AUTH SCHEMAS =====
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', format: 'password', example: 'password123' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Đăng nhập thành công' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' }
              }
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'fullName', 'phone'],
          properties: {
            email: { type: 'string', format: 'email', example: 'patient@example.com' },
            password: { type: 'string', minLength: 8, example: 'password123' },
            fullName: { type: 'string', example: 'Nguyễn Văn A' },
            phone: { type: 'string', example: '0901234567' },
            dateOfBirth: { type: 'string', format: 'date', example: '1990-01-15' },
            gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'male' },
            address: { type: 'string', example: '123 Đường ABC, Quận 1, TP.HCM' }
          }
        },

        // ===== USER SCHEMAS =====
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', format: 'email' },
            fullName: { type: 'string' },
            phone: { type: 'string' },
            role: { 
              type: 'string', 
              enum: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'CLINICAL_ADMIN', 'HOSPITAL_ADMIN', 
                     'DEPARTMENT_HEAD', 'DOCTOR', 'NURSE', 'PHARMACIST', 'LAB_TECHNICIAN',
                     'RECEPTIONIST', 'BILLING_STAFF', 'CONSULTANT_SUPPORT', 'PATIENT', 'GUEST']
            },
            status: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
            isEmailVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        // ===== PATIENT SCHEMAS =====
        Patient: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            patientCode: { type: 'string', example: 'BN-2024-001' },
            fullName: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date' },
            gender: { type: 'string', enum: ['male', 'female', 'other'] },
            phone: { type: 'string' },
            email: { type: 'string', format: 'email' },
            address: { type: 'string' },
            emergencyContact: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                relationship: { type: 'string' },
                phone: { type: 'string' }
              }
            },
            medicalHistory: {
              type: 'object',
              properties: {
                allergies: { type: 'array', items: { type: 'string' } },
                chronicDiseases: { type: 'array', items: { type: 'string' } },
                bloodType: { type: 'string', enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] }
              }
            },
            insurance: {
              type: 'object',
              properties: {
                provider: { type: 'string' },
                policyNumber: { type: 'string' },
                expiryDate: { type: 'string', format: 'date' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },

        // ===== DOCTOR SCHEMAS =====
        Doctor: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { $ref: '#/components/schemas/User' },
            specialization: { type: 'string', example: 'Nội khoa' },
            licenseNumber: { type: 'string' },
            department: { type: 'string' },
            experience: { type: 'number', example: 10 },
            education: { type: 'array', items: { type: 'string' } },
            consultationFee: { type: 'number', example: 300000 },
            isAvailable: { type: 'boolean' }
          }
        },

        // ===== APPOINTMENT SCHEMAS =====
        Appointment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            patientId: { type: 'string' },
            doctorId: { type: 'string' },
            appointmentDate: { type: 'string', format: 'date-time' },
            timeSlot: { type: 'string', example: '09:00-09:30' },
            type: { type: 'string', enum: ['consultation', 'follow-up', 'emergency', 'routine-checkup'] },
            status: { 
              type: 'string', 
              enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'] 
            },
            symptoms: { type: 'string' },
            notes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateAppointmentRequest: {
          type: 'object',
          required: ['doctorId', 'appointmentDate', 'timeSlot'],
          properties: {
            doctorId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            appointmentDate: { type: 'string', format: 'date', example: '2026-01-15' },
            timeSlot: { type: 'string', example: '09:00-09:30' },
            type: { type: 'string', enum: ['consultation', 'follow-up', 'emergency', 'routine-checkup'] },
            symptoms: { type: 'string', example: 'Đau đầu, sốt nhẹ' },
            notes: { type: 'string' }
          }
        },

        // ===== PRESCRIPTION SCHEMAS =====
        Prescription: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            patientId: { type: 'string' },
            doctorId: { type: 'string' },
            appointmentId: { type: 'string' },
            medications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  medicationId: { type: 'string' },
                  name: { type: 'string' },
                  dosage: { type: 'string' },
                  frequency: { type: 'string' },
                  duration: { type: 'string' },
                  quantity: { type: 'number' },
                  instructions: { type: 'string' }
                }
              }
            },
            diagnosis: { type: 'string' },
            notes: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'approved', 'dispensed', 'cancelled'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },

        // ===== BILLING SCHEMAS =====
        Bill: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            billNumber: { type: 'string', example: 'BILL-2024-001' },
            patientId: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                  quantity: { type: 'number' },
                  unitPrice: { type: 'number' },
                  amount: { type: 'number' }
                }
              }
            },
            subtotal: { type: 'number' },
            discount: { type: 'number' },
            tax: { type: 'number' },
            totalAmount: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'paid', 'partial', 'cancelled', 'refunded'] },
            paymentMethod: { type: 'string', enum: ['cash', 'card', 'bank_transfer', 'insurance'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },

        // ===== LAB SCHEMAS =====
        LabOrder: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            patientId: { type: 'string' },
            doctorId: { type: 'string' },
            tests: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  testId: { type: 'string' },
                  testName: { type: 'string' },
                  status: { type: 'string' }
                }
              }
            },
            status: { type: 'string', enum: ['pending', 'in-progress', 'completed', 'cancelled'] },
            priority: { type: 'string', enum: ['normal', 'urgent', 'stat'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },

        // ===== BED SCHEMAS =====
        Bed: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            bedNumber: { type: 'string', example: 'A-101' },
            ward: { type: 'string' },
            roomNumber: { type: 'string' },
            type: { type: 'string', enum: ['general', 'icu', 'pediatric', 'maternity', 'isolation'] },
            status: { type: 'string', enum: ['available', 'occupied', 'maintenance', 'reserved'] },
            currentPatient: { type: 'string' },
            features: { type: 'array', items: { type: 'string' } },
            dailyRate: { type: 'number' }
          }
        },

        // ===== QUEUE SCHEMAS =====
        Queue: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            queueNumber: { type: 'string', example: 'Q-001' },
            patientId: { type: 'string' },
            department: { type: 'string' },
            status: { type: 'string', enum: ['waiting', 'called', 'in-consultation', 'completed', 'skipped'] },
            priority: { type: 'number' },
            estimatedWaitTime: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },

        // ===== PAGINATION =====
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 10 },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' }
          }
        },

        // ===== SUCCESS RESPONSE =====
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token không hợp lệ hoặc đã hết hạn',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: 'Unauthorized - Token không hợp lệ',
                code: 'UNAUTHORIZED'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Không có quyền truy cập tài nguyên này',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: 'Forbidden - Không có quyền truy cập',
                code: 'FORBIDDEN'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Không tìm thấy tài nguyên',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: 'Không tìm thấy dữ liệu',
                code: 'NOT_FOUND'
              }
            }
          }
        },
        ValidationError: {
          description: 'Dữ liệu đầu vào không hợp lệ',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' }
            }
          }
        }
      }
    },
    tags: [
      { name: 'Public', description: '🌐 API công khai - Không cần đăng nhập' },
      { name: 'Auth', description: '🔐 Xác thực và phân quyền' },
      { name: 'Users', description: '👥 Quản lý người dùng' },
      { name: 'Patients', description: '🏥 Quản lý bệnh nhân' },
      { name: 'Doctors', description: '👨‍⚕️ Quản lý bác sĩ' },
      { name: 'Doctor Schedule', description: '📆 Lịch làm việc bác sĩ' },
      { name: 'Appointments', description: '📅 Đặt lịch khám' },
      { name: 'Queue', description: '🎫 Quản lý hàng đợi' },
      { name: 'Clinical', description: '🩺 Lâm sàng - phiên khám và chẩn đoán' },
      { name: 'Medical Records', description: '📋 Hồ sơ bệnh án' },
      { name: 'Prescriptions', description: '💊 Đơn thuốc' },
      { name: 'Laboratory', description: '🔬 Xét nghiệm' },
      { name: 'Medications', description: '💉 Thuốc và dược phẩm' },
      { name: 'Billing', description: '💰 Thanh toán' },
      { name: 'Beds', description: '🛏️ Quản lý giường bệnh' },
      { name: 'Inventory', description: '📦 Quản lý kho' },
      { name: 'Notifications', description: '🔔 Thông báo' },
      { name: 'Messages', description: '💬 Tin nhắn và hội thoại' },
      { name: 'Reports', description: '📊 Báo cáo thống kê' },
      { name: 'Dashboard', description: '📈 Dashboard và thống kê' },
      { name: 'Settings', description: '⚙️ Cài đặt hệ thống' },
      { name: 'Admin', description: '🔧 Quản trị viên' },
      { name: 'Admin Reports', description: '📑 Báo cáo quản trị' },
      { name: 'Super Admin', description: '👑 Super Admin' }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/routes/*.routes.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
