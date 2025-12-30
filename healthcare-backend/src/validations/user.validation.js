// src/validations/user.validation.js
const Joi = require('joi');
const { ROLES } = require('../constants/roles');
const { commonSchemas } = require('../middlewares/validation.middleware');

// ==================== PARAMS SCHEMAS ====================

// Hỗ trợ cả :id và :userId trong params
const userIdParams = Joi.alternatives().try(
  Joi.object({
    id: commonSchemas.objectId.required().messages({
      'any.required': 'ID người dùng là bắt buộc',
      'string.pattern.base': 'ID phải là ObjectId hợp lệ (24 ký tự hex)'
    })
  }),
  Joi.object({
    userId: commonSchemas.objectId.required().messages({
      'any.required': 'User ID là bắt buộc',
      'string.pattern.base': 'User ID phải là ObjectId hợp lệ (24 ký tự hex)'
    })
  })
).messages({
  'alternatives.match': 'Phải cung cấp ID hoặc userId trong URL'
});

const userEmailParams = Joi.object({
  email: commonSchemas.email.required()
});

// ==================== QUERY SCHEMAS ====================

const listUsersQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  role: Joi.string().valid(...Object.values(ROLES)).optional(),
  search: Joi.string().trim().max(100).optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED', 'LOCKED', 'PENDING_APPROVAL').optional(),
  includeDeleted: Joi.boolean().default(false),
  sortBy: Joi.string().valid(
    'createdAt',
    'email',
    'lastLogin',
    'personalInfo.firstName',
    'personalInfo.lastName',
    'updatedAt'
  ).default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const searchUsersQuery = Joi.object({
  q: Joi.string().trim().min(1).max(100).required().messages({
    'string.min': 'Từ khóa tìm kiếm phải có ít nhất 1 ký tự',
    'string.max': 'Từ khóa tìm kiếm không được vượt quá 100 ký tự',
    'any.required': 'Từ khóa tìm kiếm là bắt buộc'
  })
});

const getUsersByRoleQuery = Joi.object({
  role: Joi.string().valid(...Object.values(ROLES)).required().messages({
    'any.only': 'Vai trò không hợp lệ',
    'any.required': 'Vai trò là bắt buộc'
  })
});

const getUsersByDepartmentQuery = Joi.object({
  department: Joi.string().trim().max(100).required().messages({
    'any.required': 'Tên khoa/phòng là bắt buộc'
  })
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
    firstName: Joi.string().trim().min(2).max(50).required().messages({
      'string.min': 'Họ phải có ít nhất 2 ký tự',
      'string.max': 'Họ không được vượt quá 50 ký tự',
      'any.required': 'Họ là bắt buộc'
    }),
    lastName: Joi.string().trim().min(2).max(50).required().messages({
      'string.min': 'Tên phải có ít nhất 2 ký tự',
      'string.max': 'Tên không được vượt quá 50 ký tự',
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
    firstName: Joi.string().trim().min(2).max(50).optional(),
    lastName: Joi.string().trim().min(2).max(50).optional(),
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
    firstName: Joi.string().trim().min(2).max(50).optional(),
    lastName: Joi.string().trim().min(2).max(50).optional(),
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

const assignRoleBody = Joi.object({
  role: Joi.string().valid(...Object.values(ROLES)).required().messages({
    'any.only': 'Vai trò không hợp lệ',
    'any.required': 'Vai trò là bắt buộc'
  })
});

const disableUserBody = Joi.object({
  reason: Joi.string().trim().min(5).max(500).required().messages({
    'string.min': 'Lý do phải có ít nhất 5 ký tự',
    'string.max': 'Lý do không được vượt quá 500 ký tự',
    'any.required': 'Lý do vô hiệu hóa là bắt buộc'
  })
});

const deleteUserBody = Joi.object({
  reason: Joi.string().trim().min(5).max(500).required().messages({
    'string.min': 'Lý do phải có ít nhất 5 ký tự',
    'string.max': 'Lý do không được vượt quá 500 ký tự',
    'any.required': 'Lý do xóa là bắt buộc'
  })
});

const verifyEmailBody = Joi.object({
  token: Joi.string().trim().required().messages({
    'any.required': 'Token xác thực là bắt buộc'
  })
});

const changePasswordBody = Joi.object({
  oldPassword: Joi.string().required().messages({
    'any.required': 'Mật khẩu cũ là bắt buộc'
  }),
  newPassword: commonSchemas.password.required().messages({
    'any.required': 'Mật khẩu mới là bắt buộc'
  })
});

const uploadAvatarBody = Joi.object({}).unknown(true); // Multer xử lý file

const schemas = {
  // Cá nhân
  getMyProfile: {},
  updateUserProfile: { body: updateUserProfileBody },
  changePassword: { body: changePasswordBody },
  uploadAvatar: { body: uploadAvatarBody },
  verifyEmail: { body: verifyEmailBody },
  resendVerificationEmail: {},

  // Đăng ký bệnh nhân tự do
  registerPatient: { body: createUserBody },

  // Quản trị
  createUser: { body: createUserBody },
  listUsers: { query: listUsersQuery },
  listDeletedUsers: { query: listUsersQuery },
  getUserById: { params: userIdParams },
  updateUser: { params: userIdParams, body: updateUserBody },
  assignRole: { params: userIdParams, body: assignRoleBody },
  disableUser: { params: userIdParams, body: disableUserBody },
  enableUser: { params: userIdParams },
  restoreUser: { params: userIdParams },
  deleteUser: { params: userIdParams, body: deleteUserBody },
  searchUsers: { query: searchUsersQuery },
  getUsersByRole: { query: getUsersByRoleQuery },
  getUsersByDepartment: { query: getUsersByDepartmentQuery },
  getUserStatistics: {},
  getUserPermissions: { params: userIdParams },

  // Hỗ trợ UI
  getRoles: {},
  getCreatableRoles: {},
  getPermissionsByRole: { params: Joi.object({ role: Joi.string().required() }) },
  getAllPermissions: {},
};

// Expose under `schemas` to match route imports
module.exports = { schemas };