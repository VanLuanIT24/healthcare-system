const Joi = require("joi");
const { ROLES } = require("../constants/roles");
const { commonSchemas } = require("../middlewares/validation.middleware");

// 🎯 TẠO SCHEMAS RIÊNG BIỆT CHO TỪNG LOẠI VALIDATION
const createUserBody = Joi.object({
  email: commonSchemas.email.required(),
  password: commonSchemas.password.required(),
  role: Joi.string()
    .valid(...Object.values(ROLES))
    .required()
    .messages({
      "any.only": "Vai trò không hợp lệ",
      "any.required": "Vai trò là bắt buộc",
    }),
  personalInfo: Joi.object({
    firstName: Joi.string().min(2).max(50).required().messages({
      "string.min": "Họ phải có ít nhất 2 ký tự",
      "string.max": "Họ không được vượt quá 50 ký tự",
      "string.empty": "Vui lòng nhập họ",
      "any.required": "Họ là bắt buộc",
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
      "string.min": "Tên phải có ít nhất 2 ký tự",
      "string.max": "Tên không được vượt quá 50 ký tự",
      "string.empty": "Vui lòng nhập tên",
      "any.required": "Tên là bắt buộc",
    }),
    dateOfBirth: Joi.date().optional(),
    gender: Joi.string().valid("MALE", "FEMALE", "OTHER").optional(),
    phone: Joi.string().optional().allow(""),
    address: Joi.object({
      street: Joi.string().max(200).optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      zipCode: Joi.string().max(20).optional(),
      country: Joi.string().max(100).optional(),
    }).optional(),
    emergencyContact: Joi.object({
      name: Joi.string().max(100).optional(),
      relationship: Joi.string().max(50).optional(),
      phone: Joi.string().optional().allow(""),
    }).optional(),
  }).required(),

  professionalInfo: Joi.object({
    licenseNumber: Joi.string().max(50).optional(),
    specialization: Joi.string().max(100).optional(),
    department: Joi.string().max(100).optional(),
    qualifications: Joi.array().items(Joi.string().max(200)).optional(),
    yearsOfExperience: Joi.number().min(0).max(50).optional(),
    hireDate: Joi.date().max("now").optional(),
  }).when("role", {
    is: Joi.valid(
      ROLES.DOCTOR,
      ROLES.NURSE,
      ROLES.PHARMACIST,
      ROLES.LAB_TECHNICIAN
    ),
    then: Joi.object({
      licenseNumber: Joi.string().required().messages({
        "any.required": "Số giấy phép hành nghề là bắt buộc",
      }),
      specialization: Joi.string().required().messages({
        "any.required": "Chuyên khoa là bắt buộc",
      }),
      department: Joi.string().required().messages({
        "any.required": "Khoa/phòng là bắt buộc",
      }),
    }).required(),
    otherwise: Joi.object().optional(),
  }),
});

const updateUserBody = Joi.object({
  personalInfo: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    dateOfBirth: Joi.date().optional(),
    gender: Joi.string().valid("MALE", "FEMALE", "OTHER").optional(),
    phone: Joi.string().optional().allow(""),
    address: Joi.object({
      street: Joi.string().max(200).optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      zipCode: Joi.string().max(20).optional(),
      country: Joi.string().max(100).optional(),
    }).optional(),
    emergencyContact: Joi.object({
      name: Joi.string().max(100).optional(),
      relationship: Joi.string().max(50).optional(),
      phone: Joi.string().optional().allow(""),
    }).optional(),
  }).optional(),
  professionalInfo: Joi.object({
    licenseNumber: Joi.string().max(50).optional(),
    specialization: Joi.string().max(100).optional(),
    department: Joi.string().max(100).optional(),
    qualifications: Joi.array().items(Joi.string().max(200)).optional(),
    yearsOfExperience: Joi.number().min(0).max(50).optional(),
    hireDate: Joi.date().max("now").optional(),
  }).optional(),
  settings: Joi.object({
    language: Joi.string().valid("vi", "en").optional(),
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      sms: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
    }).optional(),
    theme: Joi.string().valid("light", "dark").optional(),
  }).optional(),
  role: Joi.string()
    .valid(...Object.values(ROLES))
    .optional()
    .messages({
      "any.only": "Vai trò không hợp lệ",
    }),
  status: Joi.string()
    .valid("ACTIVE", "INACTIVE", "SUSPENDED", "LOCKED", "PENDING_APPROVAL")
    .optional()
    .messages({
      "any.only": "Trạng thái không hợp lệ",
    }),
})
  .min(1)
  .messages({
    "object.min": "Phải cung cấp ít nhất một trường để cập nhật",
  });

const updateUserProfileBody = Joi.object({
  personalInfo: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phone: Joi.string().optional().allow(""),
    address: Joi.object({
      street: Joi.string().max(200).optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      zipCode: Joi.string().max(20).optional(),
      country: Joi.string().max(100).optional(),
    }).optional(),
    emergencyContact: Joi.object({
      name: Joi.string().max(100).optional(),
      relationship: Joi.string().max(50).optional(),
      phone: Joi.string().optional().allow(""),
    }).optional(),
  }).optional(),
  settings: Joi.object({
    language: Joi.string().valid("vi", "en").optional(),
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      sms: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
    }).optional(),
    theme: Joi.string().valid("light", "dark").optional(),
  }).optional(),
})
  .min(1)
  .messages({
    "object.min": "Phải cung cấp ít nhất một trường để cập nhật",
  });

const disableUserBody = Joi.object({
  reason: Joi.string().min(5).max(500).required().messages({
    "string.min": "Lý do phải có ít nhất 5 ký tự",
    "string.max": "Lý do không được vượt quá 500 ký tự",
    "string.empty": "Vui lòng nhập lý do vô hiệu hóa",
    "any.required": "Lý do vô hiệu hóa là bắt buộc",
  }),
});

const assignRoleBody = Joi.object({
  role: Joi.string()
    .valid(...Object.values(ROLES))
    .required()
    .messages({
      "any.only": "Vai trò không hợp lệ",
      "any.required": "Vai trò là bắt buộc",
    }),
});

const userIdParams = Joi.object({
  userId: commonSchemas.objectId.required(),
});

const listUsersQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  role: Joi.string()
    .valid(...Object.values(ROLES))
    .optional(),
  search: Joi.string().max(100).optional(),
  status: Joi.string()
    .valid("ACTIVE", "INACTIVE", "SUSPENDED", "LOCKED", "PENDING_APPROVAL")
    .optional(),
  sortBy: Joi.string()
    .valid("createdAt", "email", "lastLogin", "personalInfo.firstName")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

const checkUserPermissionBody = Joi.object({
  permission: Joi.string().required().messages({
    "string.empty": "Vui lòng nhập permission",
    "any.required": "Permission là bắt buộc",
  }),
});

const deleteUserBody = Joi.object({
  reason: Joi.string().min(5).max(500).required().messages({
    "string.min": "Lý do phải có ít nhất 5 ký tự",
    "string.max": "Lý do không được vượt quá 500 ký tự",
    "string.empty": "Vui lòng nhập lý do xóa",
    "any.required": "Lý do xóa là bắt buộc",
  }),
});

// 🎯 EXPORT CÁC SCHEMAS CHO TỪNG ROUTE
module.exports = {
  // 🎯 CHO CREATE USER
  createUser: {
    body: createUserBody,
  },

  // 🎯 CHO UPDATE USER
  updateUser: {
    params: userIdParams,
    body: updateUserBody,
  },

  // 🎯 CHO UPDATE USER PROFILE
  updateUserProfile: {
    body: updateUserProfileBody,
  },

  // 🎯 CHO DISABLE USER
  disableUser: {
    params: userIdParams,
    body: disableUserBody,
  },

  // 🎯 CHO ASSIGN ROLE
  assignRole: {
    params: userIdParams,
    body: assignRoleBody,
  },

  // 🎯 CHO GET USER BY ID
  getUserById: {
    params: userIdParams,
  },
  deleteUser: {
    params: userIdParams,
    body: deleteUserBody,
  },

  // 🎯 CHO LIST USERS
  listUsers: {
    query: listUsersQuery,
  },

  // 🎯 CHO CHECK USER PERMISSION
  checkUserPermission: {
    params: userIdParams,
    body: checkUserPermissionBody,
  },

  // 🎯 EXPORT CÁC SCHEMAS RIÊNG LẺ (CHO LINH HOẠT)
  schemas: {
    createUserBody,
    updateUserBody,
    updateUserProfileBody,
    disableUserBody,
    assignRoleBody,
    userIdParams,
    listUsersQuery,
    checkUserPermissionBody,
  },
};
