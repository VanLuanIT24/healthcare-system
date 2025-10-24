const Joi = require('joi');
const { commonSchemas } = require('../middlewares/validation.middleware');

/**
 * 🛡️ VALIDATION SCHEMAS CHO AUTHENTICATION
 * - Xác thực dữ liệu đầu vào cho các API auth
 * - Tuân thủ chuẩn bảo mật healthcare
 */

const authValidation = {
  // 🎯 ĐĂNG NHẬP
  login: {
    body: Joi.object({
      email: commonSchemas.email.required(),
      password: Joi.string().min(1).required().messages({
        'string.empty': 'Mật khẩu không được để trống',
        'any.required': 'Mật khẩu là bắt buộc'
      })
    })
  },

  // 🎯 ĐĂNG KÝ USER
  registerUser: {
    body: Joi.object({
      email: commonSchemas.email.required(),
      password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
          'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
          'string.pattern.base': 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
          'any.required': 'Mật khẩu là bắt buộc'
        }),
      confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Mật khẩu xác nhận không khớp',
        'any.required': 'Vui lòng xác nhận mật khẩu'
      }),
      personalInfo: Joi.object({
        firstName: Joi.string().min(2).max(50).required().messages({
          'string.min': 'Họ phải có ít nhất 2 ký tự',
          'string.max': 'Họ không được vượt quá 50 ký tự',
          'any.required': 'Họ là bắt buộc'
        }),
        lastName: Joi.string().min(2).max(50).required().messages({
          'string.min': 'Tên phải có ít nhất 2 ký tự',
          'string.max': 'Tên không được vượt quá 50 ký tự',
          'any.required': 'Tên là bắt buộc'
        }),
        dateOfBirth: commonSchemas.date.required(),
        gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required(),
        phone: commonSchemas.phone.required()
      }).required(),
      role: Joi.string().valid(
        'PATIENT', 
        'DOCTOR', 
        'NURSE', 
        'RECEPTIONIST',
        'PHARMACIST',
        'LAB_TECHNICIAN',
        'BILLING_STAFF'
      ).default('PATIENT')
    })
  },

  // 🎯 QUÊN MẬT KHẨU
  forgotPassword: {
    body: Joi.object({
      email: commonSchemas.email.required()
    })
  },

  // 🎯 ĐẶT LẠI MẬT KHẨU
  resetPassword: {
    body: Joi.object({
      token: Joi.string().required().messages({
        'string.empty': 'Token là bắt buộc',
        'any.required': 'Token là bắt buộc'
      }),
      newPassword: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
          'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
          'string.pattern.base': 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
          'any.required': 'Mật khẩu mới là bắt buộc'
        }),
      confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
        'any.only': 'Mật khẩu xác nhận không khớp',
        'any.required': 'Vui lòng xác nhận mật khẩu'
      })
    })
  },

  // 🎯 ĐỔI MẬT KHẨU
  changePassword: {
    body: Joi.object({
      currentPassword: Joi.string().min(1).required().messages({
        'string.empty': 'Mật khẩu hiện tại không được để trống',
        'any.required': 'Mật khẩu hiện tại là bắt buộc'
      }),
      newPassword: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
          'string.min': 'Mật khẩu mới phải có ít nhất 8 ký tự',
          'string.pattern.base': 'Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
          'any.required': 'Mật khẩu mới là bắt buộc'
        }),
      confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
        'any.only': 'Mật khẩu xác nhận không khớp',
        'any.required': 'Vui lòng xác nhận mật khẩu mới'
      })
    })
  },

  // 🎯 REFRESH TOKEN
  refreshToken: {
    body: Joi.object({
      refreshToken: Joi.string().required().messages({
        'string.empty': 'Refresh token là bắt buộc',
        'any.required': 'Refresh token là bắt buộc'
      })
    })
  },

  // 🎯 VERIFY EMAIL
  verifyEmail: {
    params: Joi.object({
      token: Joi.string().required()
    })
  },

  // 🎯 RESEND VERIFICATION EMAIL
  resendVerification: {
    body: Joi.object({
      email: commonSchemas.email.required()
    })
  }
};

module.exports = authValidation;