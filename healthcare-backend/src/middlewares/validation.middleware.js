const Joi = require("joi");
const { AppError, ERROR_CODES } = require("./error.middleware");

/**
 * 🛡️ MIDDLEWARE VALIDATION CHO HEALTHCARE SYSTEM
 * - Xác thực dữ liệu đầu vào theo chuẩn y tế
 * - Hỗ trợ các loại validation đặc thù ngành y
 */

// 🎯 SCHEMAS CƠ BẢN (ĐÃ SỬA)
const commonSchemas = {
  objectId: Joi.string().hex().length(24).required().messages({
    "string.base": "ID phải là chuỗi hợp lệ",
    "string.length": "ID phải có 24 ký tự",
    "string.hex": "ID phải là dạng hex hợp lệ",
    "any.required": "ID không được bỏ trống",
  }),

  email: Joi.string().email().lowercase().trim().messages({
    "string.email": "Email không hợp lệ",
  }),

  phone: Joi.string()
    .pattern(/^[\d\+\-\(\)\s]{10,}$/)
    .messages({
      "string.pattern.base": "Số điện thoại không hợp lệ (ít nhất 10 ký tự)",
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      "string.min": "Mật khẩu phải có ít nhất 8 ký tự",
      "string.pattern.base":
        "Mật khẩu phải bao gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
    }),

  date: Joi.alternatives()
    .try(Joi.date().iso(), Joi.string().isoDate())
    .messages({
      "date.base": "Định dạng ngày không hợp lệ",
      "date.format": "Ngày phải theo định dạng ISO (YYYY-MM-DD hoặc ISO 8601)",
    }),
};

// 🎯 SCHEMAS ĐẶC THÙ Y TẾ
const medicalSchemas = {
  patientId: commonSchemas.objectId,
  doctorId: commonSchemas.objectId,
  medicalRecordId: commonSchemas.objectId,
  appointmentId: commonSchemas.objectId,
  prescriptionId: commonSchemas.objectId,

  // 🏥 THÔNG TIN BỆNH NHÂN
  patientInfo: Joi.object({
    fullName: Joi.string().min(2).max(100).required(),
    dateOfBirth: commonSchemas.date.required(),
    gender: Joi.string().valid("MALE", "FEMALE", "OTHER").required(),
    phone: commonSchemas.phone.required(),
    email: commonSchemas.email.optional(),
    address: Joi.string().max(500).optional(),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      phone: commonSchemas.phone.required(),
      relationship: Joi.string().required(),
    }).optional(),
    bloodType: Joi.string()
      .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")
      .optional(),
    allergies: Joi.array().items(Joi.string()).optional(),
    medicalHistory: Joi.array().items(Joi.string()).optional(),
  }),

  // 🩺 HỒ SƠ BỆNH ÁN
  medicalRecord: Joi.object({
    patientId: commonSchemas.objectId.required(),
    diagnosis: Joi.string().min(5).max(1000).required(),
    symptoms: Joi.array().items(Joi.string()).min(1).required(),
    treatmentPlan: Joi.string().max(2000).optional(),
    medications: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          dosage: Joi.string().required(),
          frequency: Joi.string().required(),
          duration: Joi.string().required(),
        })
      )
      .optional(),
    notes: Joi.string().max(1000).optional(),
    followUpDate: commonSchemas.date.optional(),
  }),

  // 📅 LỊCH HẸN
  appointment: Joi.object({
    patientId: commonSchemas.objectId.required(),
    doctorId: commonSchemas.objectId.required(),
    appointmentDate: commonSchemas.date.required(),
    appointmentTime: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required(),
    reason: Joi.string().max(500).required(),
    type: Joi.string()
      .valid("CONSULTATION", "FOLLOW_UP", "EMERGENCY", "ROUTINE_CHECKUP")
      .required(),
    notes: Joi.string().max(1000).optional(),
  }),

  // 💊 ĐƠN THUỐC
  prescription: Joi.object({
    patientId: commonSchemas.objectId.required(),
    doctorId: commonSchemas.objectId.required(),
    medications: Joi.array()
      .items(
        Joi.object({
          medicationId: commonSchemas.objectId.required(),
          name: Joi.string().required(),
          dosage: Joi.string().required(),
          frequency: Joi.string().required(),
          duration: Joi.string().required(),
          instructions: Joi.string().max(500).optional(),
        })
      )
      .min(1)
      .required(),
    diagnosis: Joi.string().max(1000).required(),
    notes: Joi.string().max(1000).optional(),
  }),
};

/**
 * 🎯 MIDDLEWARE VALIDATION CHÍNH
 */
function validate(schema, source = "body") {
  return (req, res, next) => {
    const data = req[source];

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: true,
    });

    if (error) {
      console.error(
        "❌ [VALIDATION ERROR]",
        JSON.stringify(error.details, null, 2)
      );
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        type: detail.type,
      }));

      const validationError = new AppError(
        "Dữ liệu không hợp lệ",
        422,
        ERROR_CODES.VALIDATION_FAILED
      );
      validationError.details = errorDetails;

      return next(validationError);
    }

    // 🎯 GÁN DỮ LIỆU ĐÃ ĐƯỢC VALIDATE VÀO REQUEST
    req[source] = value;
    req.validatedData = value;

    next();
  };
}

/**
 * 🎯 VALIDATE PARAMS (URL PARAMETERS)
 */
function validateParams(schema) {
  return validate(schema, "params");
}

/**
 * 🎯 VALIDATE QUERY (URL QUERY PARAMETERS)
 */
function validateQuery(schema) {
  return validate(schema, "query");
}

/**
 * 🎯 VALIDATE BODY (REQUEST BODY)
 */
function validateBody(schema) {
  return validate(schema, "body");
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
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          sanitized[field] = req.body[field];
        }
      });
      req.body = sanitized;
    }

    // 🎯 DEEP TRIM STRING FIELDS (bao gồm nested objects)
    const deepTrim = (obj) => {
      if (obj === null || typeof obj !== "object") return obj;

      if (Array.isArray(obj)) {
        return obj.map((item) => deepTrim(item));
      }

      const trimmed = {};
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        if (typeof value === "string") {
          trimmed[key] = value.trim();
        } else if (typeof value === "object" && value !== null) {
          trimmed[key] = deepTrim(value);
        } else {
          trimmed[key] = value;
        }
      });
      return trimmed;
    };

    if (req.body) {
      req.body = deepTrim(req.body);
    }

    next();
  };
}

/**
 * 🎯 VALIDATE COMBINED (BODY + PARAMS)
 */
function validateCombined(schemas = {}) {
  return (req, res, next) => {
    try {
      // Validate params
      if (schemas.params) {
        const { error: paramsError } = schemas.params.validate(req.params);
        if (paramsError) {
          const errorDetails = paramsError.details.map((detail) => ({
            field: `params.${detail.path.join(".")}`,
            message: detail.message,
            type: detail.type,
          }));

          const validationError = new AppError(
            "Tham số không hợp lệ",
            422,
            ERROR_CODES.VALIDATION_FAILED
          );
          validationError.details = errorDetails;
          return next(validationError);
        }
      }

      // Validate body
      if (schemas.body) {
        const { error: bodyError } = schemas.body.validate(req.body);
        if (bodyError) {
          const errorDetails = bodyError.details.map((detail) => ({
            field: `body.${detail.path.join(".")}`,
            message: detail.message,
            type: detail.type,
          }));

          const validationError = new AppError(
            "Dữ liệu không hợp lệ",
            422,
            ERROR_CODES.VALIDATION_FAILED
          );
          validationError.details = errorDetails;
          return next(validationError);
        }
      }

      // Validate query
      if (schemas.query) {
        const { error: queryError } = schemas.query.validate(req.query);
        if (queryError) {
          const errorDetails = queryError.details.map((detail) => ({
            field: `query.${detail.path.join(".")}`,
            message: detail.message,
            type: detail.type,
          }));

          const validationError = new AppError(
            "Query parameters không hợp lệ",
            422,
            ERROR_CODES.VALIDATION_FAILED
          );
          validationError.details = errorDetails;
          return next(validationError);
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  validate,
  validateParams,
  validateQuery,
  validateBody,
  sanitizeInput,
  commonSchemas,
  validateCombined,
  medicalSchemas,
};
