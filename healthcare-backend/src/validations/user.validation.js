// src/validations/user.validation.js
const Joi = require('joi');
const { ROLES } = require('../constants/roles');
const { commonSchemas } = require('../middlewares/validation.middleware');

// 🎯 SCHEMAS CHO TẤT CẢ CÁC HÀM

// ==================== PARAMS SCHEMAS ====================

// 🎯 CHO CẢ 'id' VÀ 'userId' PARAM (LINH HOẠT)
const userIdParams = Joi.alternatives().try(
  Joi.object({ 
    id: commonSchemas.objectId.required().messages({
      'any.required': 'ID là bắt buộc',
      'string.hex': 'ID phải là hex string',
      'string.length': 'ID phải có 24 ký tự'
    })
  }),
  Joi.object({ 
    userId: commonSchemas.objectId.required().messages({
      'any.required': 'User ID là bắt buộc',
      'string.hex': 'User ID phải là hex string',
      'string.length': 'User ID phải có 24 ký tự'
    })
  })
).messages({
  'alternatives.match': 'Phải cung cấp ID hoặc userId'
});

// 🎯 RIÊNG CHO EMAIL PARAM
const userEmailParams = Joi.object({
  email: commonSchemas.email.required()
});

// ==================== BODY SCHEMAS ====================

const createUserBody = Joi.object({
  email: commonSchemas.email.required(),
  password: commonSchemas.password.required(),
  role: Joi.string().valid(...Object.values(ROLES)).required().messages({
    'any.only': 'Vai trò không hợp lệ',
    'any.required': 'Vai trò là bắt buộc'
  }),
  personalInfo: Joi.object({
    firstName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Họ phải có ít nhất 2 ký tự',
      'string.max': 'Họ không được vượt quá 50 ký tự',
      'string.empty': 'Vui lòng nhập họ',
      'any.required': 'Họ là bắt buộc'
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Tên phải có ít nhất 2 ký tự',
      'string.max': 'Tên không được vượt quá 50 ký tự',
      'string.empty': 'Vui lòng nhập tên',
      'any.required': 'Tên là bắt buộc'
    }),
    dateOfBirth: Joi.date().max('now').required().messages({
      'date.max': 'Ngày sinh không được ở tương lai',
      'any.required': 'Ngày sinh là bắt buộc'
    }),
    gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required().messages({
      'any.only': 'Giới tính không hợp lệ',
      'any.required': 'Giới tính là bắt buộc'
    }),
    phone: commonSchemas.phone.required(),
    address: Joi.object({
      street: Joi.string().max(200).optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      zipCode: Joi.string().max(20).optional(),
      country: Joi.string().max(100).optional()
    }).optional(),
    emergencyContact: Joi.object({
      name: Joi.string().max(100).optional(),
      relationship: Joi.string().max(50).optional(),
      phone: commonSchemas.phone.optional()
    }).optional()
  }).required(),
  
  professionalInfo: Joi.object({
    licenseNumber: Joi.string().max(50).optional(),
    specialization: Joi.string().max(100).optional(),
    department: Joi.string().max(100).optional(),
    qualifications: Joi.array().items(Joi.string().max(200)).optional(),
    yearsOfExperience: Joi.number().min(0).max(50).optional(),
    hireDate: Joi.date().max('now').optional(),
    position: Joi.string().max(100).optional()
  }).when('role', {
    is: Joi.valid(ROLES.DOCTOR, ROLES.NURSE, ROLES.PHARMACIST, ROLES.LAB_TECHNICIAN),
    then: Joi.object({
      licenseNumber: Joi.string().required().messages({
        'any.required': 'Số giấy phép hành nghề là bắt buộc'
      }),
      specialization: Joi.string().required().messages({
        'any.required': 'Chuyên khoa là bắt buộc'
      }),
      department: Joi.string().required().messages({
        'any.required': 'Khoa/phòng là bắt buộc'
      })
    }).required(),
    otherwise: Joi.object().optional()
  }),

  settings: Joi.object({
    language: Joi.string().valid('vi', 'en').default('vi'),
    notifications: Joi.object({
      email: Joi.boolean().default(true),
      sms: Joi.boolean().default(false),
      push: Joi.boolean().default(true)
    }).optional(),
    theme: Joi.string().valid('light', 'dark').default('light'),
    timezone: Joi.string().default('Asia/Ho_Chi_Minh')
  }).optional()
});

const updateUserBody = Joi.object({
  personalInfo: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').optional(),
    phone: commonSchemas.phone.optional(),
    address: Joi.object({
      street: Joi.string().max(200).optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      zipCode: Joi.string().max(20).optional(),
      country: Joi.string().max(100).optional()
    }).optional(),
    emergencyContact: Joi.object({
      name: Joi.string().max(100).optional(),
      relationship: Joi.string().max(50).optional(),
      phone: commonSchemas.phone.optional()
    }).optional()
  }).optional(),

  professionalInfo: Joi.object({
    licenseNumber: Joi.string().max(50).optional(),
    specialization: Joi.string().max(100).optional(),
    department: Joi.string().max(100).optional(),
    qualifications: Joi.array().items(Joi.string().max(200)).optional(),
    yearsOfExperience: Joi.number().min(0).max(50).optional(),
    hireDate: Joi.date().max('now').optional(),
    position: Joi.string().max(100).optional()
  }).optional(),

  settings: Joi.object({
    language: Joi.string().valid('vi', 'en').optional(),
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      sms: Joi.boolean().optional(),
      push: Joi.boolean().optional()
    }).optional(),
    theme: Joi.string().valid('light', 'dark').optional(),
    timezone: Joi.string().optional()
  }).optional(),

  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED', 'LOCKED').optional()
}).min(1).messages({
  'object.min': 'Phải cung cấp ít nhất một trường để cập nhật'
});

const updateUserProfileBody = Joi.object({
  personalInfo: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phone: commonSchemas.phone.optional(),
    address: Joi.object({
      street: Joi.string().max(200).optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      zipCode: Joi.string().max(20).optional(),
      country: Joi.string().max(100).optional()
    }).optional(),
    emergencyContact: Joi.object({
      name: Joi.string().max(100).optional(),
      relationship: Joi.string().max(50).optional(),
      phone: commonSchemas.phone.optional()
    }).optional()
  }).optional(),

  settings: Joi.object({
    language: Joi.string().valid('vi', 'en').optional(),
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      sms: Joi.boolean().optional(),
      push: Joi.boolean().optional()
    }).optional(),
    theme: Joi.string().valid('light', 'dark').optional(),
    timezone: Joi.string().optional()
  }).optional()
}).min(1).messages({
  'object.min': 'Phải cung cấp ít nhất một trường để cập nhật'
});

const disableUserBody = Joi.object({
  reason: Joi.string().min(5).max(500).required().messages({
    'string.min': 'Lý do phải có ít nhất 5 ký tự',
    'string.max': 'Lý do không được vượt quá 500 ký tự',
    'string.empty': 'Vui lòng nhập lý do vô hiệu hóa',
    'any.required': 'Lý do vô hiệu hóa là bắt buộc'
  })
});

const assignRoleBody = Joi.object({
  role: Joi.string().valid(...Object.values(ROLES)).required().messages({
    'any.only': 'Vai trò không hợp lệ',
    'any.required': 'Vai trò là bắt buộc'
  })
});

const listUsersQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  role: Joi.string().valid(...Object.values(ROLES)).optional(),
  search: Joi.string().max(100).optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED', 'LOCKED', 'PENDING_APPROVAL').optional(),
  includeDeleted: Joi.boolean().default(false),
  sortBy: Joi.string().valid('createdAt', 'email', 'lastLogin', 'personalInfo.firstName', 'updatedAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const checkUserPermissionBody = Joi.object({
  permission: Joi.string().required().messages({
    'string.empty': 'Vui lòng nhập permission',
    'any.required': 'Permission là bắt buộc'
  })
});

const deleteUserBody = Joi.object({
  reason: Joi.string().min(5).max(500).required().messages({
    'string.min': 'Lý do phải có ít nhất 5 ký tự',
    'string.max': 'Lý do không được vượt quá 500 ký tự',
    'string.empty': 'Vui lòng nhập lý do xóa',
    'any.required': 'Lý do xóa là bắt buộc'
  })
});

const verifyEmailBody = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Token xác thực là bắt buộc',
    'any.required': 'Token xác thực là bắt buộc'
  })
});

const uploadAvatarBody = Joi.object({
  // File upload validation sẽ được xử lý bằng multer
}).unknown(true);

// ==================== QUERY SCHEMAS (NEW) ====================

const searchUsersQuery = Joi.object({
  q: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Từ khóa tìm kiếm phải có ít nhất 1 ký tự',
    'string.max': 'Từ khóa tìm kiếm không được vượt quá 100 ký tự',
    'any.required': 'Từ khóa tìm kiếm là bắt buộc'
  })
});

const usersByRoleParams = Joi.object({
  role: Joi.string().valid(...Object.values(ROLES)).required().messages({
    'any.only': 'Vai trò không hợp lệ',
    'any.required': 'Vai trò là bắt buộc'
  })
});

// ==================== EXPORT SCHEMAS ====================

module.exports = {
  // 🎯 CHO CREATE USER
  createUser: {
    body: createUserBody
  },

  // 🎯 CHO UPDATE USER
  updateUser: {
    params: userIdParams,
    body: updateUserBody
  },

  // 🎯 CHO UPDATE USER PROFILE
  updateUserProfile: {
    body: updateUserProfileBody
  },

  // 🎯 CHO DISABLE USER
  disableUser: {
    params: userIdParams,
    body: disableUserBody
  },

  // 🎯 CHO ASSIGN ROLE
  assignRole: {
    params: userIdParams,
    body: assignRoleBody
  },

  // 🎯 CHO GET USER BY ID
  getUserById: {
    params: userIdParams
  },

  // 🎯 CHO GET USER BY EMAIL
  getUserByEmail: {
    params: userEmailParams
  },

  // 🎯 CHO DELETE USER
  deleteUser: {
    params: userIdParams,
    body: deleteUserBody
  },

  // 🎯 CHO LIST USERS
  listUsers: {
    query: listUsersQuery
  },

  // 🎯 CHO CHECK USER PERMISSION
  checkUserPermission: {
    params: userIdParams,
    body: checkUserPermissionBody
  },

  // 🎯 CHO VERIFY EMAIL
  verifyEmail: {
    body: verifyEmailBody
  },

  // 🎯 CHO UPLOAD AVATAR
  uploadAvatar: {
    body: uploadAvatarBody
  },

  // 🎯 CHO SEARCH USERS (NEW)
  searchUsers: {
    query: searchUsersQuery
  },

  // 🎯 CHO GET USERS BY ROLE (NEW)
  getUsersByRole: {
    params: usersByRoleParams
  },

  // 🎯 EXPORT CÁC SCHEMAS RIÊNG LẺ (CHO LINH HOẠT)
  schemas: {
    createUserBody,
    updateUserBody,
    updateUserProfileBody,
    disableUserBody,
    assignRoleBody,
    userIdParams,
    userEmailParams,
    listUsersQuery,
    checkUserPermissionBody,
    deleteUserBody,
    verifyEmailBody,
    uploadAvatarBody,
    searchUsersQuery,
    usersByRoleParams
  }
};