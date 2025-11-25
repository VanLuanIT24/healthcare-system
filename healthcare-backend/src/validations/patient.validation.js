const Joi = require('joi');
const { commonSchemas } = require('../middlewares/validation.middleware');

/**
 * 🏥 PATIENT VALIDATION SCHEMAS
 * Đảm bảo dữ liệu bệnh nhân hợp lệ theo chuẩn y tế
 */

const patientValidation = {
   // 🎯 ĐĂNG KÝ BỆNH NHÂN
  registerPatient: Joi.object({
    // Thông tin cá nhân - BẮT BUỘC
    email: commonSchemas.email.required()
      .messages({
        'any.required': 'Email là bắt buộc',
        'string.email': 'Email không hợp lệ'
      }),
    password: commonSchemas.password.required()
      .messages({
        'any.required': 'Mật khẩu là bắt buộc',
        'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
        'string.pattern.base': 'Mật khẩu phải bao gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
      }),
    firstName: Joi.string().min(1).max(50).required()
      .messages({
        'any.required': 'Tên là bắt buộc',
        'string.empty': 'Tên không được để trống',
        'string.min': 'Tên phải có ít nhất 1 ký tự'
      }),
    lastName: Joi.string().min(1).max(50).required()
      .messages({
        'any.required': 'Họ là bắt buộc',
        'string.empty': 'Họ không được để trống',
        'string.min': 'Họ phải có ít nhất 1 ký tự'
      }),
    phone: commonSchemas.phone.required()
      .messages({
        'any.required': 'Số điện thoại là bắt buộc',
        'string.pattern.base': 'Số điện thoại không hợp lệ'
      }),
    dateOfBirth: Joi.date().max('now').required()
      .messages({
        'any.required': 'Ngày sinh là bắt buộc',
        'date.max': 'Ngày sinh không được ở tương lai'
      }),
    gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required()
      .messages({
        'any.required': 'Giới tính là bắt buộc',
        'any.only': 'Giới tính phải là MALE, FEMALE hoặc OTHER'
      }),
    
    // Địa chỉ - BẮT BUỘC
    address: Joi.alternatives().try(
      Joi.object({
        street: Joi.string().required().messages({
          'string.empty': 'Đường phố không được để trống'
        }),
        city: Joi.string().required().messages({
          'string.empty': 'Thành phố không được để trống'
        }),
        district: Joi.string().required().messages({
          'string.empty': 'Quận/huyện không được để trống'
        }),
        ward: Joi.string().required().messages({
          'string.empty': 'Phường/xã không được để trống'
        })
      }),
      Joi.string().min(5).max(500) // Cho phép địa chỉ dạng string
    ).required().messages({
      'any.required': 'Địa chỉ là bắt buộc'
    }),

    // Thông tin y tế - TÙY CHỌN
    bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN')
      .default('UNKNOWN'),
    height: Joi.number().min(30).max(250).optional()
      .messages({
        'number.min': 'Chiều cao tối thiểu là 30cm',
        'number.max': 'Chiều cao tối đa là 250cm'
      }),
    weight: Joi.number().min(2).max(300).optional()
      .messages({
        'number.min': 'Cân nặng tối thiểu là 2kg',
        'number.max': 'Cân nặng tối đa là 300kg'
      }),
    
    // Các trường khác - TÙY CHỌN
    emergencyInfo: Joi.object({
      contactName: Joi.string().min(2).max(100).optional(),
      contactPhone: commonSchemas.phone.optional(),
      contactRelationship: Joi.string().valid('SPOUSE', 'PARENT', 'CHILD', 'SIBLING', 'FRIEND', 'OTHER').optional(),
      knownAllergies: Joi.array().items(Joi.string()).default([]),
      currentMedications: Joi.array().items(Joi.string()).default([]),
      primaryPhysician: Joi.alternatives().try(
        Joi.string(),
        commonSchemas.objectId
      ).optional(),
      insuranceProvider: Joi.string().optional()
    }).optional(),

    allergies: Joi.array().items(
      Joi.object({
        allergen: Joi.string().required().messages({
          'string.empty': 'Tác nhân dị ứng không được để trống'
        }),
        severity: Joi.string().valid('MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING').required()
          .messages({
            'any.only': 'Mức độ nghiêm trọng phải là MILD, MODERATE, SEVERE hoặc LIFE_THREATENING'
          }),
        reaction: Joi.string().required().messages({
          'string.empty': 'Phản ứng dị ứng không được để trống'
        }),
        onsetDate: Joi.date().max('now').optional(),
        treatment: Joi.string().optional(),
        notes: Joi.string().max(500).optional(),
        isActive: Joi.boolean().default(true)
      })
    ).default([]),

    chronicConditions: Joi.array().items(
      Joi.object({
        condition: Joi.string().required().messages({
          'string.empty': 'Tên bệnh không được để trống'
        }),
        icd10Code: Joi.string().optional(),
        diagnosedDate: Joi.date().max('now').required()
          .messages({
            'any.required': 'Ngày chẩn đoán là bắt buộc'
          }),
        status: Joi.string().valid('ACTIVE', 'IN_REMISSION', 'RESOLVED', 'MONITORING').required()
          .messages({
            'any.only': 'Trạng thái phải là ACTIVE, IN_REMISSION, RESOLVED hoặc MONITORING'
          }),
        severity: Joi.string().valid('MILD', 'MODERATE', 'SEVERE').optional(),
        treatmentPlan: Joi.string().optional(),
        notes: Joi.string().max(1000).optional()
      })
    ).default([]),

    familyHistory: Joi.array().items(
      Joi.object({
        condition: Joi.string().required().messages({
          'string.empty': 'Tên bệnh không được để trống'
        }),
        relation: Joi.string().valid('MOTHER', 'FATHER', 'SISTER', 'BROTHER', 'GRANDMOTHER', 'GRANDFATHER', 'AUNT', 'UNCLE', 'OTHER').required()
          .messages({
            'any.only': 'Quan hệ không hợp lệ'
          }),
        ageAtDiagnosis: Joi.number().min(0).max(120).optional()
          .messages({
            'number.min': 'Tuổi chẩn đoán không thể âm',
            'number.max': 'Tuổi chẩn đoán tối đa là 120'
          }),
        notes: Joi.string().optional(),
        isGenetic: Joi.boolean().default(false),
        severity: Joi.string().valid('MILD', 'MODERATE', 'SEVERE').optional()
      })
    ).default([]),

    lifestyle: Joi.object({
      smoking: Joi.object({
        status: Joi.string().valid('NEVER', 'FORMER', 'CURRENT').default('NEVER'),
        years: Joi.number().min(0).optional(),
        packsPerDay: Joi.number().min(0).max(10).optional(),
        quitDate: Joi.date().max('now').optional()
      }).optional(),
      alcohol: Joi.object({
        status: Joi.string().valid('NEVER', 'OCCASIONAL', 'REGULAR', 'HEAVY').default('NEVER'),
        drinksPerWeek: Joi.number().min(0).optional(),
        drinkType: Joi.string().optional()  // RENAMED
      }).optional(),
      exercise: Joi.object({
        frequency: Joi.string().valid('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE').default('SEDENTARY'),
        exerciseType: Joi.string().optional(),  // RENAMED
        hoursPerWeek: Joi.number().min(0).max(168).optional()
      }).optional(),
      diet: Joi.string().valid('OMNIVORE', 'VEGETARIAN', 'VEGAN', 'KETO', 'GLUTEN_FREE', 'OTHER', 'MEDITERRANEAN').optional(),
      sleepHours: Joi.number().min(0).max(24).optional(),
      stressLevel: Joi.string().valid('LOW', 'MODERATE', 'HIGH').optional()
    }).optional(),

    insurance: Joi.object({
      provider: Joi.string().required().messages({
        'string.empty': 'Nhà bảo hiểm không được để trống'
      }),
      policyNumber: Joi.string().required().messages({
        'string.empty': 'Số hợp đồng không được để trống'
      }),
      groupNumber: Joi.string().optional(),
      effectiveDate: Joi.date().required().messages({
        'any.required': 'Ngày hiệu lực là bắt buộc'
      }),
      expirationDate: Joi.date().min(Joi.ref('effectiveDate')).optional()
        .messages({
          'date.min': 'Ngày hết hạn không thể trước ngày hiệu lực'
        })
    }).optional(),

    preferences: Joi.object({
      preferredLanguage: Joi.string().valid('vi', 'en').default('vi'),
      communicationMethod: Joi.string().valid('EMAIL', 'SMS', 'PHONE', 'APP_NOTIFICATION').default('EMAIL'),
      privacyLevel: Joi.string().valid('STANDARD', 'RESTRICTED', 'HIGHLY_RESTRICTED').default('STANDARD'),
      allowResearch: Joi.boolean().default(false),
      emergencyContactPriority: Joi.string().valid('HIGH', 'MEDIUM', 'LOW').default('MEDIUM')
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
    sortBy: Joi.string().valid('firstName', 'lastName', 'createdAt', 'patientId', 'riskLevel').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN').optional(),
    riskLevel: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').optional(),
    admissionStatus: Joi.string().valid('ADMITTED', 'DISCHARGED', 'TRANSFERRED').optional()
  }),

  // 🎯 CẬP NHẬT THÔNG TIN
  updateDemographics: Joi.object({
    // Thông tin cá nhân
    firstName: Joi.string().min(1).max(50).optional(),
    lastName: Joi.string().min(1).max(50).optional(),
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
    
    // Thông tin khẩn cấp
    emergencyInfo: Joi.object({
      contactName: Joi.string().min(2).max(100).optional(),
      contactPhone: commonSchemas.phone.optional(),
      contactRelationship: Joi.string().valid('SPOUSE', 'PARENT', 'CHILD', 'SIBLING', 'FRIEND', 'OTHER').optional(),
      knownAllergies: Joi.array().items(Joi.string()).optional(),
      currentMedications: Joi.array().items(Joi.string()).optional(),
      primaryPhysician: Joi.string().optional(),
      insuranceProvider: Joi.string().optional()
    }).optional(),

    // Lối sống
    lifestyle: Joi.object({
      smoking: Joi.object({
        status: Joi.string().valid('NEVER', 'FORMER', 'CURRENT').optional(),
        years: Joi.number().min(0).optional(),
        packsPerDay: Joi.number().min(0).max(10).optional(),
        quitDate: Joi.date().max('now').optional()
      }).optional(),
      alcohol: Joi.object({
        status: Joi.string().valid('NEVER', 'OCCASIONAL', 'REGULAR', 'HEAVY').optional(),
        drinksPerWeek: Joi.number().min(0).optional(),
        drinkType: Joi.string().optional()  // RENAMED
      }).optional(),
      exercise: Joi.object({
        frequency: Joi.string().valid('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE').optional(),
        exerciseType: Joi.string().optional(),  // RENAMED
        hoursPerWeek: Joi.number().min(0).max(168).optional()
      }).optional(),
      diet: Joi.string().valid('OMNIVORE', 'VEGETARIAN', 'VEGAN', 'KETO', 'GLUTEN_FREE', 'OTHER').optional(),
      sleepHours: Joi.number().min(0).max(24).optional(),
      stressLevel: Joi.string().valid('LOW', 'MODERATE', 'HIGH').optional()
    }).optional(),

    // Tùy chọn
    preferences: Joi.object({
      preferredLanguage: Joi.string().valid('vi', 'en').optional(),
      communicationMethod: Joi.string().valid('EMAIL', 'SMS', 'PHONE', 'APP_NOTIFICATION').optional(),
      privacyLevel: Joi.string().valid('STANDARD', 'RESTRICTED', 'HIGHLY_RESTRICTED').optional(),
      allowResearch: Joi.boolean().optional(),
      emergencyContactPriority: Joi.string().valid('HIGH', 'MEDIUM', 'LOW').optional()
    }).optional()
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
    attendingDoctor: commonSchemas.objectId.required()
      .messages({
        'any.required': 'Bác sĩ điều trị là bắt buộc'
      }),
    notes: Joi.string().max(500).optional()
  }),

  // 🎯 XUẤT VIỆN
  dischargePatient: Joi.object({
    dischargeReason: Joi.string().required()
      .messages({
        'string.empty': 'Lý do xuất viện là bắt buộc',
        'any.required': 'Vui lòng nhập lý do xuất viện'
      }),
    condition: Joi.string().valid('RECOVERED', 'IMPROVED', 'UNCHANGED', 'WORSE', 'DECEASED').required(),
    followUpInstructions: Joi.string().max(1000).optional(),
    medicationsAtDischarge: Joi.array().items(Joi.string()).optional()
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
  }),

  // 🎯 VALIDATION CHO DỊ ỨNG
  getAllergies: Joi.object({
    activeOnly: Joi.boolean().default(true)
  }),

  updateAllergies: Joi.object({
    operation: Joi.string().valid('ADD', 'UPDATE', 'DEACTIVATE').required()
      .messages({
        'any.only': 'Operation phải là ADD, UPDATE hoặc DEACTIVATE',
        'any.required': 'Operation là bắt buộc'
      }),
    allergyData: Joi.object({
      allergyId: Joi.string().when('operation', {
        is: Joi.valid('UPDATE', 'DEACTIVATE'),
        then: Joi.required().messages({
          'any.required': 'allergyId là bắt buộc cho UPDATE và DEACTIVATE'
        }),
        otherwise: Joi.forbidden()
      }),
      allergen: Joi.string().when('operation', {
        is: 'ADD',
        then: Joi.required().messages({
          'any.required': 'allergen là bắt buộc cho ADD'
        }),
        otherwise: Joi.optional()
      }),
      severity: Joi.string().valid('MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING')
        .messages({
          'any.only': 'Severity phải là MILD, MODERATE, SEVERE hoặc LIFE_THREATENING'
        }),
      reaction: Joi.string().max(500).optional(),
      onsetDate: Joi.date().max('now').optional(),
      treatment: Joi.string().max(500).optional(),
      notes: Joi.string().max(1000).optional(),
      isActive: Joi.boolean()
    }).required()
  }),

  // 🎯 VALIDATION CHO TIỀN SỬ GIA ĐÌNH
  updateFamilyHistory: Joi.object({
    operation: Joi.string().valid('ADD', 'UPDATE', 'REMOVE').required()
      .messages({
        'any.only': 'Operation phải là ADD, UPDATE hoặc REMOVE',
        'any.required': 'Operation là bắt buộc'
      }),
    historyData: Joi.object({
      historyId: Joi.string().when('operation', {
        is: Joi.valid('UPDATE', 'REMOVE'),
        then: Joi.required().messages({
          'any.required': 'historyId là bắt buộc cho UPDATE và REMOVE'
        }),
        otherwise: Joi.forbidden()
      }),
      condition: Joi.string().when('operation', {
        is: 'ADD',
        then: Joi.required().messages({
          'any.required': 'condition là bắt buộc cho ADD'
        }),
        otherwise: Joi.optional()
      }),
      relation: Joi.string().valid('MOTHER', 'FATHER', 'SISTER', 'BROTHER', 'GRANDMOTHER', 'GRANDFATHER', 'AUNT', 'UNCLE', 'OTHER')
        .messages({
          'any.only': 'Relation không hợp lệ'
        }),
      ageAtDiagnosis: Joi.number().min(0).max(120).optional()
        .messages({
          'number.min': 'Tuổi chẩn đoán không thể âm',
          'number.max': 'Tuổi chẩn đoán tối đa là 120'
        }),
      notes: Joi.string().max(500).optional(),
      isGenetic: Joi.boolean(),
      severity: Joi.string().valid('MILD', 'MODERATE', 'SEVERE')
        .messages({
          'any.only': 'Severity phải là MILD, MODERATE hoặc SEVERE'
        })
    }).required()
  }),

  // 🎯 VALIDATION CHO THUỐC HIỆN TẠI
  updateMedications: Joi.object({
    operation: Joi.string().valid('ADD', 'UPDATE', 'DEACTIVATE').required(),
    medicationData: Joi.object({
      medicationId: Joi.string().when('operation', {
        is: Joi.valid('UPDATE', 'DEACTIVATE'),
        then: Joi.required(),
        otherwise: Joi.forbidden()
      }),
      name: Joi.string().when('operation', {
        is: 'ADD',
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      dosage: Joi.string().when('operation', {
        is: 'ADD',
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      frequency: Joi.string().when('operation', {
        is: 'ADD',
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      route: Joi.string().valid('ORAL', 'TOPICAL', 'INJECTION', 'INHALATION', 'OTHER').optional(),
      startDate: Joi.date().when('operation', {
        is: 'ADD',
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      endDate: Joi.date().min(Joi.ref('startDate')).optional(),
      purpose: Joi.string().optional(),
      instructions: Joi.string().max(500).optional(),
      isActive: Joi.boolean()
    }).required()
  }),

  // 🎯 VALIDATION CHO BỆNH MÃN TÍNH
  updateChronicConditions: Joi.object({
    operation: Joi.string().valid('ADD', 'UPDATE', 'RESOLVE').required(),
    conditionData: Joi.object({
      conditionId: Joi.string().when('operation', {
        is: Joi.valid('UPDATE', 'RESOLVE'),
        then: Joi.required(),
        otherwise: Joi.forbidden()
      }),
      condition: Joi.string().when('operation', {
        is: 'ADD',
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      icd10Code: Joi.string().optional(),
      diagnosedDate: Joi.date().when('operation', {
        is: 'ADD',
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      status: Joi.string().valid('ACTIVE', 'IN_REMISSION', 'RESOLVED', 'MONITORING').optional(),
      severity: Joi.string().valid('MILD', 'MODERATE', 'SEVERE').optional(),
      treatmentPlan: Joi.string().max(1000).optional(),
      notes: Joi.string().max(1000).optional()
    }).required()
  })
};

module.exports = patientValidation;