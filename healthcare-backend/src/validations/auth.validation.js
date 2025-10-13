// src/validations/auth.validation.js
const Joi = require('joi');

/**
 * SCHEMA VALIDATION CHO XÁC THỰC
 * - Sử dụng Joi để validate dữ liệu đầu vào
 * - Cung cấp thông báo lỗi tiếng Việt rõ ràng
 */

/**
 * SCHEMA ĐĂNG KÝ TÀI KHOẢN
 */
const registerSchema = Joi.object({
  email: Joi.string()
    .email({ 
      tlds: { allow: false } // Không kiểm tra TLD cụ thể
    })
    .required()
    .messages({
      'string.email': 'Email không hợp lệ',
      'string.empty': 'Email không được để trống',
      'any.required': 'Email là bắt buộc'
    }),

  name: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZÀ-ỹ\s]+$/)
    .optional()
    .messages({
      'string.min': 'Tên phải có ít nhất 2 ký tự',
      'string.max': 'Tên không được vượt quá 100 ký tự',
      'string.pattern.base': 'Tên chỉ được chứa chữ cái và khoảng trắng'
    }),

  password: Joi.string()
    .min(6)
    .max(72) // Giới hạn bcrypt
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
      'string.max': 'Mật khẩu không được vượt quá 72 ký tự',
      'string.pattern.base': 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
      'any.required': 'Mật khẩu là bắt buộc'
    }),

  role: Joi.string()
    .valid('PATIENT', 'STAFF', 'DOCTOR', 'MANAGER', 'ADMIN', 'SUPER_ADMIN')
    .optional()
    .messages({
      'any.only': 'Vai trò không hợp lệ'
    }),

  // Xác nhận mật khẩu
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Mật khẩu xác nhận không khớp',
      'any.required': 'Vui lòng xác nhận mật khẩu'
    })
}).with('password', 'confirmPassword'); // Đảm bảo confirmPassword đi cùng password

/**
 * SCHEMA ĐĂNG NHẬP
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email không hợp lệ',
      'string.empty': 'Email không được để trống',
      'any.required': 'Email là bắt buộc'
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Mật khẩu không được để trống',
      'any.required': 'Mật khẩu là bắt buộc'
    }),

  twoFACode: Joi.string()
    .length(6)
    .pattern(/^\d+$/)
    .optional()
    .messages({
      'string.length': 'Mã 2FA phải có 6 chữ số',
      'string.pattern.base': 'Mã 2FA chỉ được chứa số'
    })
});

/**
 * SCHEMA ĐỔI MẬT KHẨU
 */
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Mật khẩu hiện tại là bắt buộc'
    }),

  newPassword: Joi.string()
    .min(6)
    .max(72)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự',
      'string.pattern.base': 'Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
    }),

  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Mật khẩu xác nhận không khớp'
    })
}).with('newPassword', 'confirmNewPassword');

/**
 * SCHEMA RESET MẬT KHẨU
 */
const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Token reset là bắt buộc'
    }),

  newPassword: Joi.string()
    .min(6)
    .max(72)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự',
      'string.pattern.base': 'Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
    }),

  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Mật khẩu xác nhận không khớp'
    })
});

/**
 * SCHEMA CẬP NHẬT THÔNG TIN USER
 */
const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZÀ-ỹ\s]+$/)
    .optional()
    .messages({
      'string.min': 'Tên phải có ít nhất 2 ký tự',
      'string.max': 'Tên không được vượt quá 100 ký tự',
      'string.pattern.base': 'Tên chỉ được chứa chữ cái và khoảng trắng'
    }),

  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Email không hợp lệ'
    })
}).min(1); // Ít nhất một trường phải được cung cấp

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
};