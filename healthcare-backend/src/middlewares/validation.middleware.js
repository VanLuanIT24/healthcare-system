const Joi = require('joi');
const { AppError, ERROR_CODES } = require('./error.middleware');

/**
 * 🛡️ MIDDLEWARE VALIDATION CHO HEALTHCARE SYSTEM - ĐÃ SỬA LỖI
 * - Xác thực dữ liệu đầu vào theo chuẩn y tế
 * - Hiển thị thông báo lỗi rõ ràng, thân thiện
 * - FIXED: schema.validate is not a function
 */

// 🎯 SCHEMAS CƠ BẢN (ĐÃ SỬA MESSAGES THÂN THIỆN)
const commonSchemas = {
  objectId: Joi.string()
    .hex()
    .length(24)
    .messages({
      'string.base': 'ID phải là chuỗi hợp lệ',
      'string.length': 'ID phải có đúng 24 ký tự',
      'string.hex': 'ID phải là dạng hex hợp lệ',
      'any.required': 'Vui lòng cung cấp ID',
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .messages({
      'string.email': 'Email không hợp lệ',
      'string.empty': 'Vui lòng nhập email',
      'any.required': 'Email là bắt buộc'
    }),

  phone: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]{10,}$/)
    .messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ. Ví dụ: +84123456789',
      'string.empty': 'Vui lòng nhập số điện thoại',
      'any.required': 'Số điện thoại là bắt buộc'
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
      'string.pattern.base': 'Mật khẩu phải bao gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
      'string.empty': 'Vui lòng nhập mật khẩu',
      'any.required': 'Mật khẩu là bắt buộc'
    }),

  date: Joi.date()
    .iso()
    .messages({
      'date.base': 'Định dạng ngày không hợp lệ',
      'date.format': 'Ngày phải theo định dạng ISO (YYYY-MM-DD)',
      'any.required': 'Vui lòng chọn ngày'
    }),
};

/**
 * 🛡️ VALIDATION MIDDLEWARE - ✅ ĐÃ SỬA LỖI
 */
function validate(schema) {
  return (req, res, next) => {
    console.log('🔍 [VALIDATION] Validating request...', {
      method: req.method,
      path: req.path,
      body: req.body ? Object.keys(req.body) : 'no body',
      params: req.params ? Object.keys(req.params) : 'no params',
      query: req.query ? Object.keys(req.query) : 'no query'
    });

    // 🎯 KIỂM TRA XEM SCHEMA CÓ PHẢI LÀ JOI SCHEMA HỢP LỆ KHÔNG
    if (!schema || typeof schema.validate !== 'function') {
      console.error('❌ [VALIDATION] Invalid schema provided:', schema);
      return next(new AppError(
        'Lỗi cấu hình validation',
        500,
        ERROR_CODES.INTERNAL_SERVER_ERROR
      ));
    }

    // 🎯 XÁC ĐỊNH LOẠI DỮ LIỆU CẦN VALIDATE
    let dataToValidate = {};
    let validationType = '';

    if (schema._ids && schema._ids._byKey) {
      const keys = Object.keys(schema._ids._byKey);
      
      if (keys.includes('body')) {
        dataToValidate = req.body;
        validationType = 'body';
      } else if (keys.includes('params')) {
        dataToValidate = req.params;
        validationType = 'params';
      } else if (keys.includes('query')) {
        dataToValidate = req.query;
        validationType = 'query';
      } else {
        // 🎯 NẾU KHÔNG XÁC ĐỊNH ĐƯỢC, MẶC ĐỊNH LÀ BODY
        dataToValidate = req.body;
        validationType = 'body';
      }
    } else {
      // 🎯 SCHEMA ĐƠN GIẢN - VALIDATE TRỰC TIẾP
      dataToValidate = req.body;
      validationType = 'body';
    }

    console.log(`🔍 [VALIDATION] Validating ${validationType}:`, dataToValidate);

    // 🎯 THỰC HIỆN VALIDATION
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Hiển thị tất cả lỗi
      stripUnknown: true, // Loại bỏ trường không xác định
      allowUnknown: false // Không cho phép trường không xác định
    });

    if (error) {
      console.log('❌ [VALIDATION] Validation failed:', error.details);
      
      // 🎯 TẠO THÔNG BÁO LỖI THÂN THIỆN, DỄ HIỂU
      const errorMessages = error.details.map(detail => {
        // 🎯 LÀM ĐẸP MESSAGE LỖI
        let message = detail.message;
        
        // 🎯 THAY THẾ CÁC TỪ KHÓA JOI MẶC ĐỊNH
        message = message.replace(/".*?"/, 'trường này');
        message = message.replace('is required', 'là bắt buộc');
        message = message.replace('must be', 'phải là');
        message = message.replace('is not allowed', 'không được phép');
        message = message.replace('length must be', 'độ dài phải là');
        message = message.replace('must have at least', 'phải có ít nhất');
        message = message.replace('must have at most', 'không được vượt quá');
        
        return message;
      });
      
      // 🎯 GỘP TẤT CẢ LỖI THÀNH MỘT MESSAGE DỄ ĐỌC
      let userFriendlyMessage = 'Vui lòng kiểm tra lại thông tin:\n';
      
      errorMessages.forEach((msg, index) => {
        userFriendlyMessage += `\n${index + 1}. ${msg}`;
      });

      console.error('❌ [VALIDATION] Validation errors:', userFriendlyMessage);

      return res.status(422).json({
        success: false,
        message: userFriendlyMessage, // ✅ HIỂN THỊ RÕ RÀNG TỪNG LỖI
        error: 'VALIDATION_FAILED',
        errorCode: 'VALIDATION_FAILED',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type
        })),
        timestamp: new Date().toISOString()
      });
    }

    // 🎯 GÁN DỮ LIỆU ĐÃ ĐƯỢC VALIDATE VÀ CLEAN
    if (validationType === 'body') {
      req.body = value;
    } else if (validationType === 'params') {
      req.params = value;
    } else if (validationType === 'query') {
      req.query = value;
    }

    console.log('✅ [VALIDATION] Validation passed');
    next();
  };
}

/**
 * 🎯 VALIDATE BODY (DÀNH CHO POST, PUT, PATCH)
 */
function validateBody(schema) {
  return (req, res, next) => {
    console.log('🔍 [VALIDATION] Validating request body...');

    if (!schema || typeof schema.validate !== 'function') {
      console.error('❌ [VALIDATION] Invalid body schema');
      return next(new AppError('Lỗi cấu hình validation', 500));
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      let userFriendlyMessage = 'Dữ liệu không hợp lệ:\n';
      
      errorMessages.forEach((msg, index) => {
        userFriendlyMessage += `\n${index + 1}. ${msg}`;
      });

      return res.status(422).json({
        success: false,
        message: userFriendlyMessage,
        error: 'VALIDATION_FAILED'
      });
    }

    req.body = value;
    console.log('✅ [VALIDATION] Body validation passed');
    next();
  };
}

/**
 * 🎯 VALIDATE PARAMS (URL PARAMETERS)
 */
function validateParams(schema) {
  return (req, res, next) => {
    console.log('🔍 [VALIDATION] Validating request params...');

    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      let userFriendlyMessage = 'Tham số không hợp lệ:\n';
      
      errorMessages.forEach((msg, index) => {
        userFriendlyMessage += `\n${index + 1}. ${msg}`;
      });

      return res.status(400).json({
        success: false,
        message: userFriendlyMessage,
        error: 'INVALID_PARAMS'
      });
    }

    req.params = value;
    console.log('✅ [VALIDATION] Params validation passed');
    next();
  };
}

/**
 * 🎯 VALIDATE QUERY (URL QUERY PARAMETERS)
 */
function validateQuery(schema) {
  return (req, res, next) => {
    console.log('🔍 [VALIDATION] Validating request query...');

    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      let userFriendlyMessage = 'Tham số truy vấn không hợp lệ:\n';
      
      errorMessages.forEach((msg, index) => {
        userFriendlyMessage += `\n${index + 1}. ${msg}`;
      });

      return res.status(400).json({
        success: false,
        message: userFriendlyMessage,
        error: 'INVALID_QUERY'
      });
    }

    req.query = value;
    console.log('✅ [VALIDATION] Query validation passed');
    next();
  };
}

/**
 * 🎯 COMBINE VALIDATION (CHO CÁC TRƯỜNG HỢP PHỨC TẠP)
 */
function validateCombined(validationSchema) {
  return (req, res, next) => {
    console.log('🔍 [VALIDATION] Validating combined schema...');

    const errors = [];

    // 🎯 VALIDATE BODY
    if (validationSchema.body) {
      const { error } = validationSchema.body.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });
      if (error) errors.push(...error.details);
    }

    // 🎯 VALIDATE PARAMS
    if (validationSchema.params) {
      const { error } = validationSchema.params.validate(req.params, {
        abortEarly: false,
        stripUnknown: true
      });
      if (error) errors.push(...error.details);
    }

    // 🎯 VALIDATE QUERY
    if (validationSchema.query) {
      const { error } = validationSchema.query.validate(req.query, {
        abortEarly: false,
        stripUnknown: true
      });
      if (error) errors.push(...error.details);
    }

    if (errors.length > 0) {
      const errorMessages = errors.map(detail => detail.message);
      let userFriendlyMessage = 'Dữ liệu không hợp lệ:\n';
      
      errorMessages.forEach((msg, index) => {
        userFriendlyMessage += `\n${index + 1}. ${msg}`;
      });

      return res.status(422).json({
        success: false,
        message: userFriendlyMessage,
        error: 'VALIDATION_FAILED',
        details: errors.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type
        }))
      });
    }

    console.log('✅ [VALIDATION] Combined validation passed');
    next();
  };
}

/**
 * 🎯 SANITIZE INPUT DATA
 * - Loại bỏ các trường không cần thiết
 * - Chuẩn hóa dữ liệu
 */
function sanitizeInput(allowedFields = []) {
  return (req, res, next) => {
    if (req.body && allowedFields.length > 0) {
      const sanitized = {};
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          sanitized[field] = req.body[field];
        }
      });
      req.body = sanitized;
    }
    
    // 🎯 TRIM STRING FIELDS
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].trim();
        }
      });
    }
    
    next();
  };
}

module.exports = {
  validate,
  validateBody,
  validateParams,
  validateQuery,
  validateCombined,
  sanitizeInput,
  commonSchemas
};