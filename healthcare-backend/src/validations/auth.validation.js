const Joi = require('joi');
const { commonSchemas } = require('../middlewares/validation.middleware');

/**
 * 🛡️ VALIDATION SCHEMAS CHO AUTHENTICATION - PHIÊN BẢN CẢI TIẾN HOÀN HẢO
 * 
 * Cải tiến nổi bật:
 * - Thêm .trim() cho tất cả string input
 * - Tự động lowercase email
 * - Kiểm tra độ tuổi hợp lý (13-100 tuổi)
 * - Message lỗi chi tiết, nhất quán, thân thiện
 * - Tái sử dụng schema con để tránh lặp code
 * - Cấu trúc rõ ràng, dễ mở rộng
 */

const passwordConfirm = (refPath, label = 'xác nhận') =>
  Joi.string()
    .trim()
    .valid(Joi.ref(refPath))
    .required()
    .messages({
      'any.only': `Mật khẩu ${label} không khớp`,
      'any.required': `Vui lòng nhập mật khẩu ${label}`,
      'string.empty': `Vui lòng nhập mật khẩu ${label}`
    });

const authValidation = {
  // 🎯 Schema con tái sử dụng
  _passwordConfirm: passwordConfirm,

  // 🎯 ĐĂNG NHẬP
  login: {
    body: Joi.object({
      email: commonSchemas.email
        .trim()
        .lowercase()
        .required()
        .messages({
          'any.required': 'Vui lòng nhập email',
          'string.empty': 'Vui lòng nhập email'
        }),
      password: Joi.string()
        .min(1)
        .required()
        .messages({
          'string.empty': 'Vui lòng nhập mật khẩu',
          'any.required': 'Vui lòng nhập mật khẩu'
        })
    }).options({ abortEarly: false })
  },

  // 🎯 ĐĂNG KÝ USER
  registerUser: {
    body: Joi.object({
      email: commonSchemas.email
        .trim()
        .lowercase()
        .required()
        .messages({
          'any.required': 'Vui lòng nhập email',
          'string.empty': 'Vui lòng nhập email',
          'string.email': 'Email không hợp lệ'
        }),

      password: commonSchemas.password.required().messages({
        'any.required': 'Vui lòng nhập mật khẩu'
      }),

      confirmPassword: passwordConfirm('password', 'xác nhận'),

      personalInfo: Joi.object({
        firstName: Joi.string()
          .trim()
          .min(2)
          .max(50)
          .required()
          .messages({
            'string.min': 'Họ phải có ít nhất 2 ký tự',
            'string.max': 'Họ không được dài quá 50 ký tự',
            'any.required': 'Vui lòng nhập họ',
            'string.empty': 'Họ không được để trống'
          }),

        lastName: Joi.string()
          .trim()
          .min(2)
          .max(50)
          .required()
          .messages({
            'string.min': 'Tên phải có ít nhất 2 ký tự',
            'string.max': 'Tên không được dài quá 50 ký tự',
            'any.required': 'Vui lòng nhập tên',
            'string.empty': 'Tên không được để trống'
          }),

        dateOfBirth: commonSchemas.date
          .required()
          .max('now')
          .min(new Date(new Date().setFullYear(new Date().getFullYear() - 100))) // Không quá 100 tuổi
          .max(new Date(new Date().setFullYear(new Date().getFullYear() - 13))) // Tối thiểu 13 tuổi
          .messages({
            'date.max': 'Ngày sinh không được ở trong tương lai hoặc bạn chưa đủ 13 tuổi',
            'date.min': 'Ngày sinh không hợp lệ (quá cũ)',
            'any.required': 'Vui lòng chọn ngày sinh',
            'date.base': 'Ngày sinh không hợp lệ'
          }),

        gender: Joi.string()
          .valid('MALE', 'FEMALE', 'OTHER')
          .required()
          .messages({
            'any.only': 'Giới tính phải là: MALE, FEMALE hoặc OTHER',
            'any.required': 'Vui lòng chọn giới tính'
          }),

        phone: commonSchemas.phone
          .trim()
          .required()
          .messages({
            'any.required': 'Vui lòng nhập số điện thoại',
            'string.empty': 'Số điện thoại không được để trống'
          })
      })
        .required()
        .messages({
          'object.base': 'Thông tin cá nhân không hợp lệ',
          'any.required': 'Vui lòng cung cấp thông tin cá nhân'
        }),

      role: Joi.string()
        .valid(
          'PATIENT',
          'DOCTOR',
          'NURSE',
          'RECEPTIONIST',
          'PHARMACIST',
          'LAB_TECHNICIAN',
          'BILLING_STAFF'
        )
        .default('PATIENT')
        .messages({
          'any.only': 'Vai trò không hợp lệ'
        })
    }).options({ abortEarly: false })
  },

  // 🎯 QUÊN MẬT KHẨU
  forgotPassword: {
    body: Joi.object({
      email: commonSchemas.email
        .trim()
        .lowercase()
        .required()
        .messages({
          'any.required': 'Vui lòng nhập email',
          'string.empty': 'Vui lòng nhập email'
        })
    }).options({ abortEarly: false })
  },

  // 🎯 ĐẶT LẠI MẬT KHẨU
  resetPassword: {
    body: Joi.object({
      token: Joi.string()
        .trim()
        .required()
        .messages({
          'string.empty': 'Token không được để trống',
          'any.required': 'Token là bắt buộc'
        }),

      newPassword: commonSchemas.password.required().messages({
        'any.required': 'Vui lòng nhập mật khẩu mới'
      }),

      confirmPassword: passwordConfirm('newPassword', 'xác nhận mới')
    }).options({ abortEarly: false })
  },

  // 🎯 ĐỔI MẬT KHẨU
  changePassword: {
    body: Joi.object({
      currentPassword: Joi.string()
        .min(1)
        .required()
        .messages({
          'string.empty': 'Vui lòng nhập mật khẩu hiện tại',
          'any.required': 'Vui lòng nhập mật khẩu hiện tại'
        }),

      newPassword: commonSchemas.password.required().messages({
        'any.required': 'Vui lòng nhập mật khẩu mới'
      }),

      confirmPassword: passwordConfirm('newPassword', 'xác nhận mới')
    }).options({ abortEarly: false })
  },

  // 🎯 REFRESH TOKEN
  refreshToken: {
    body: Joi.object({
      refreshToken: Joi.string()
        .trim()
        .required()
        .messages({
          'string.empty': 'Refresh token không được để trống',
          'any.required': 'Refresh token là bắt buộc'
        })
    })
  },

  // 🎯 ĐĂNG XUẤT
  logout: {
    body: Joi.object({
      refreshToken: Joi.string().trim().optional(),
      sessionId: Joi.string().trim().optional()
    })
      .messages({
        'object.missing': 'Cần cung cấp ít nhất một trong hai: refreshToken hoặc sessionId'
      })
      .options({ abortEarly: false })
  },

  // 🎯 THU HỒI SESSION
  revokeSession: {
    body: Joi.object({
      sessionId: Joi.string()
        .trim()
        .required()
        .messages({
          'string.empty': 'Session ID không được để trống',
          'any.required': 'Session ID là bắt buộc'
        })
    })
  },

  // 🎯 VERIFY EMAIL (token trong params)
  verifyEmail: {
    params: Joi.object({
      token: Joi.string()
        .trim()
        .required()
        .messages({
          'string.empty': 'Token xác thực không được để trống',
          'any.required': 'Token xác thực là bắt buộc'
        })
    })
  },

  // 🎯 GỬI LẠI EMAIL XÁC THỰC
  resendVerification: {
    body: Joi.object({
      email: commonSchemas.email
        .trim()
        .lowercase()
        .required()
        .messages({
          'any.required': 'Vui lòng nhập email',
          'string.empty': 'Vui lòng nhập email'
        })
    })
  }
};

module.exports = authValidation;