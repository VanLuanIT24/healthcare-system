const Joi = require('joi');
const { commonSchemas } = require('../middlewares/validation.middleware');

/**
 * 🏥 PATIENT VALIDATION SCHEMAS
 * Đảm bảo dữ liệu bệnh nhân hợp lệ theo chuẩn y tế
 */

const patientValidation = {
  // 🎯 ĐĂNG KÝ BỆNH NHÂN
  registerPatient: Joi.object({
    // Thông tin cá nhân
    email: commonSchemas.email.required(),
    password: commonSchemas.password.required(),
    name: Joi.string().min(2).max(100).required()
      .messages({
        'string.empty': 'Họ tên không được để trống',
        'string.min': 'Họ tên phải có ít nhất 2 ký tự',
        'any.required': 'Họ tên là bắt buộc'
      }),
    phone: commonSchemas.phone.required(),
    dateOfBirth: Joi.date().max('now').required()
      .messages({
        'date.max': 'Ngày sinh không được ở tương lai',
        'any.required': 'Ngày sinh là bắt buộc'
      }),
    gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required()
      .messages({
        'any.only': 'Giới tính phải là MALE, FEMALE hoặc OTHER',
        'any.required': 'Giới tính là bắt buộc'
      }),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      district: Joi.string().required(),
      ward: Joi.string().required()
    }).required(),

    // Thông tin y tế
    bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN')
      .default('UNKNOWN'),
    height: Joi.number().min(30).max(250).optional(),
    weight: Joi.number().min(2).max(300).optional(),
    
    // Dị ứng
    allergies: Joi.array().items(
      Joi.object({
        allergen: Joi.string().required(),
        severity: Joi.string().valid('MILD', 'MODERATE', 'SEVERE').required(),
        reaction: Joi.string().required(),
        notes: Joi.string().optional()
      })
    ).optional(),

    // Bệnh mãn tính
    chronicConditions: Joi.array().items(
      Joi.object({
        condition: Joi.string().required(),
        diagnosedDate: Joi.date().max('now').required(),
        status: Joi.string().valid('ACTIVE', 'IN_REMISSION', 'RESOLVED').required(),
        notes: Joi.string().optional()
      })
    ).optional(),

    // Bảo hiểm
    insurance: Joi.object({
      provider: Joi.string().required(),
      policyNumber: Joi.string().required(),
      groupNumber: Joi.string().optional(),
      effectiveDate: Joi.date().required(),
      expirationDate: Joi.date().min(Joi.ref('effectiveDate')).optional()
    }).optional()
  }),

  // 🎯 TÌM KIẾM BỆNH NHÂN
  searchPatients: Joi.object({
    keyword: Joi.string().max(100).optional()
      .messages({
        'string.max': 'Từ khóa không được vượt quá 100 ký tự'
      }),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('name', 'createdAt', 'patientId').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // 🎯 CẬP NHẬT THÔNG TIN
  updateDemographics: Joi.object({
    // Thông tin cá nhân
    name: Joi.string().min(2).max(100).optional(),
    phone: commonSchemas.phone.optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      district: Joi.string().optional(),
      ward: Joi.string().optional()
    }).optional(),

    // Thông tin y tế
    bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN').optional(),
    height: Joi.number().min(30).max(250).optional(),
    weight: Joi.number().min(2).max(300).optional(),
    
    // Dị ứng
    allergies: Joi.array().items(
      Joi.object({
        allergen: Joi.string().required(),
        severity: Joi.string().valid('MILD', 'MODERATE', 'SEVERE').required(),
        reaction: Joi.string().required(),
        notes: Joi.string().optional()
      })
    ).optional(),

    // Bệnh mãn tính
    chronicConditions: Joi.array().items(
      Joi.object({
        condition: Joi.string().required(),
        diagnosedDate: Joi.date().max('now').required(),
        status: Joi.string().valid('ACTIVE', 'IN_REMISSION', 'RESOLVED').required(),
        notes: Joi.string().optional()
      })
    ).optional(),

    // Lối sống
    lifestyle: Joi.object({
      smoking: Joi.string().valid('NEVER', 'FORMER', 'CURRENT').optional(),
      alcohol: Joi.string().valid('NEVER', 'OCCASIONAL', 'REGULAR').optional(),
      exercise: Joi.string().valid('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE').optional(),
      diet: Joi.string().optional()
    }).optional(),

    // Tiền sử gia đình
    familyHistory: Joi.array().items(
      Joi.object({
        condition: Joi.string().required(),
        relation: Joi.string().required(),
        notes: Joi.string().optional()
      })
    ).optional()
  }),

  // 🎯 NHẬP VIỆN
  admitPatient: Joi.object({
    department: Joi.string().required()
      .messages({
        'string.empty': 'Khoa là bắt buộc',
        'any.required': 'Vui lòng chọn khoa'
      }),
    room: Joi.string().required()
      .messages({
        'string.empty': 'Phòng là bắt buộc',
        'any.required': 'Vui lòng chọn phòng'
      }),
    bed: Joi.string().optional(),
    diagnosis: Joi.string().required()
      .messages({
        'string.empty': 'Chẩn đoán là bắt buộc',
        'any.required': 'Vui lòng nhập chẩn đoán'
      }),
    attendingDoctor: commonSchemas.objectId.required(),
    notes: Joi.string().max(500).optional()
  }),

  // 🎯 XUẤT VIỆN
  dischargePatient: Joi.object({
    dischargeReason: Joi.string().required()
      .messages({
        'string.empty': 'Lý do xuất viện là bắt buộc',
        'any.required': 'Vui lòng nhập lý do xuất viện'
      }),
    condition: Joi.string().valid('RECOVERED', 'IMPROVED', 'UNCHANGED', 'WORSE').required(),
    followUpInstructions: Joi.string().max(1000).optional(),
    medications: Joi.array().items(Joi.string()).optional()
  }),

  // 🎯 CẬP NHẬT BẢO HIỂM
  updateInsurance: Joi.object({
    provider: Joi.string().required()
      .messages({
        'string.empty': 'Nhà bảo hiểm là bắt buộc',
        'any.required': 'Vui lòng chọn nhà bảo hiểm'
      }),
    policyNumber: Joi.string().required()
      .messages({
        'string.empty': 'Số hợp đồng là bắt buộc',
        'any.required': 'Vui lòng nhập số hợp đồng'
      }),
    groupNumber: Joi.string().optional(),
    effectiveDate: Joi.date().required(),
    expirationDate: Joi.date().min(Joi.ref('effectiveDate')).optional()
  })
};

module.exports = patientValidation;