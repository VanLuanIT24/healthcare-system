// src/validations/auth.validation.js
const Joi = require("joi");
const { commonSchemas } = require("../middlewares/validation.middleware");

/**
 * 🛡️ VALIDATION SCHEMAS CHO AUTHENTICATION
 * - Xác thực dữ liệu đầu vào cho các API auth
 * - Hiển thị thông báo lỗi rõ ràng, thân thiện
 */

const authValidation = {
  // 🎯 ĐĂNG NHẬP
  login: {
    body: Joi.object({
      email: commonSchemas.email.required().messages({
        "any.required": "Vui lòng nhập email",
      }),
      password: Joi.string().min(1).required().messages({
        "string.empty": "Vui lòng nhập mật khẩu",
        "any.required": "Vui lòng nhập mật khẩu",
      }),
    }).options({ abortEarly: false }),
  },

  // 🎯 ĐĂNG KÝ USER - ✅ MESSAGES THÂN THIỆN, RÕ RÀNG
  registerUser: {
    body: Joi.object({
      email: commonSchemas.email.required().messages({
        "any.required": "Vui lòng nhập email",
      }),

      password: commonSchemas.password.required().messages({
        "any.required": "Vui lòng nhập mật khẩu",
      }),

      confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
          "any.only": "Mật khẩu xác nhận không khớp",
          "any.required": "Vui lòng xác nhận mật khẩu",
          "string.empty": "Vui lòng nhập mật khẩu xác nhận",
        }),

      personalInfo: Joi.object({
        firstName: Joi.string().min(2).max(50).required().messages({
          "string.min": "Họ phải có ít nhất 2 ký tự",
          "string.max": "Họ không được dài quá 50 ký tự",
          "any.required": "Vui lòng nhập họ",
          "string.empty": "Họ không được để trống",
        }),

        lastName: Joi.string().min(2).max(50).required().messages({
          "string.min": "Tên phải có ít nhất 2 ký tự",
          "string.max": "Tên không được dài quá 50 ký tự",
          "any.required": "Vui lòng nhập tên",
          "string.empty": "Tên không được để trống",
        }),

        dateOfBirth: Joi.alternatives()
          .try(Joi.date().iso().max("now"), Joi.string().isoDate())
          .required()
          .messages({
            "date.max": "Ngày sinh không được ở trong tương lai",
            "any.required": "Vui lòng chọn ngày sinh",
            "alternatives.match": "Ngày sinh không hợp lệ",
          }),

        gender: Joi.string()
          .valid("MALE", "FEMALE", "OTHER")
          .required()
          .messages({
            "any.only": "Giới tính phải là: MALE, FEMALE hoặc OTHER",
            "any.required": "Vui lòng chọn giới tính",
          }),

        phone: commonSchemas.phone.required().messages({
          "any.required": "Vui lòng nhập số điện thoại",
        }),
      })
        .required()
        .messages({
          "object.base": "Thông tin cá nhân không hợp lệ",
          "any.required": "Vui lòng cung cấp thông tin cá nhân",
        }),

      // ⚠️ IMPORTANT: Người dùng đăng ký luôn là PATIENT
      // Admin mới có thể đổi role sau bằng API PUT /users/{id}
    }).options({ abortEarly: false }),
  },

  // 🎯 QUÊN MẬT KHẨU
  forgotPassword: {
    body: Joi.object({
      email: commonSchemas.email.required().messages({
        "any.required": "Vui lòng nhập email",
      }),
    }).options({ abortEarly: false }),
  },

  // 🎯 ĐẶT LẠI MẬT KHẨU
  resetPassword: {
    body: Joi.object({
      token: Joi.string().required().messages({
        "string.empty": "Token không được để trống",
        "any.required": "Token là bắt buộc",
      }),

      newPassword: commonSchemas.password.required().messages({
        "any.required": "Vui lòng nhập mật khẩu mới",
      }),

      confirmPassword: Joi.string()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
          "any.only": "Mật khẩu xác nhận không khớp",
          "any.required": "Vui lòng xác nhận mật khẩu mới",
        }),
    }).options({ abortEarly: false }),
  },

  // 🎯 ĐỔI MẬT KHẨU
  changePassword: {
    body: Joi.object({
      currentPassword: Joi.string().min(1).required().messages({
        "string.empty": "Vui lòng nhập mật khẩu hiện tại",
        "any.required": "Vui lòng nhập mật khẩu hiện tại",
      }),

      newPassword: commonSchemas.password.required().messages({
        "any.required": "Vui lòng nhập mật khẩu mới",
      }),

      confirmPassword: Joi.string()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
          "any.only": "Mật khẩu xác nhận không khớp",
          "any.required": "Vui lòng xác nhận mật khẩu mới",
        }),
    }).options({ abortEarly: false }),
  },

  // 🎯 REFRESH TOKEN
  refreshToken: {
    body: Joi.object({
      refreshToken: Joi.string().required().messages({
        "string.empty": "Refresh token không được để trống",
        "any.required": "Refresh token là bắt buộc",
      }),
    }),
  },

  // 🎯 VERIFY EMAIL
  verifyEmail: {
    params: Joi.object({
      token: Joi.string().required().messages({
        "string.empty": "Token xác thực không được để trống",
        "any.required": "Token xác thực là bắt buộc",
      }),
    }),
  },

  // 🎯 RESEND VERIFICATION EMAIL
  resendVerification: {
    body: Joi.object({
      email: commonSchemas.email.required().messages({
        "any.required": "Vui lòng nhập email",
      }),
    }),
  },
};

module.exports = authValidation;
