/**
 * MEDICATION VALIDATION SCHEMAS
 * Các schema validation cho API thuốc
 */

const Joi = require('joi');

const medicationValidation = {
  // Lấy danh sách thuốc
  getMedications: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    keyword: Joi.string().max(200).allow('', null).optional(),
    category: Joi.string().max(100).optional(),
    status: Joi.string().valid('ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK', 'RECALLED').optional(),
    type: Joi.string().valid('TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'OINTMENT', 'INHALER', 'SUPPOSITORY', 'OTHER').optional(),
    stockStatus: Joi.string().valid('LOW', 'OUT', 'NORMAL', 'ALL').optional(),
    sortBy: Joi.string().valid('name', 'genericName', 'createdAt', 'stock.current', 'pricing.sellingPrice').default('name'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc')
  }),

  // Tạo thuốc mới
  createMedication: Joi.object({
    medicationId: Joi.string().max(50).optional(),
    name: Joi.string().required().max(200).trim(),
    genericName: Joi.string().max(200).trim().optional(),
    brandName: Joi.string().max(200).trim().optional(),
    category: Joi.string().required().max(100),
    type: Joi.string().valid('TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'OINTMENT', 'INHALER', 'SUPPOSITORY', 'OTHER').required(),
    strength: Joi.object({
      value: Joi.number().positive().optional(),
      unit: Joi.string().max(20).optional()
    }).optional(),
    form: Joi.string().max(100).optional(),
    stock: Joi.object({
      current: Joi.number().min(0).default(0),
      minimum: Joi.number().min(0).default(10),
      maximum: Joi.number().min(0).default(1000),
      unit: Joi.string().max(50).default('units'),
      reorderLevel: Joi.number().min(0).default(20)
    }).optional(),
    pricing: Joi.object({
      costPrice: Joi.number().min(0).optional(),
      sellingPrice: Joi.number().min(0).optional(),
      insurancePrice: Joi.number().min(0).optional()
    }).optional(),
    storage: Joi.object({
      temperature: Joi.string().max(100).optional(),
      requirements: Joi.string().max(500).optional(),
      lightSensitive: Joi.boolean().default(false),
      humiditySensitive: Joi.boolean().default(false)
    }).optional(),
    safety: Joi.object({
      schedule: Joi.string().valid('OTC', 'RX', 'CONTROLLED').optional(),
      pregnancyCategory: Joi.string().max(10).optional(),
      contraindications: Joi.array().items(Joi.string().max(200)).optional(),
      sideEffects: Joi.array().items(Joi.string().max(200)).optional(),
      interactions: Joi.array().items(
        Joi.object({
          medication: Joi.string().max(200),
          severity: Joi.string().max(50),
          effect: Joi.string().max(500)
        })
      ).optional()
    }).optional(),
    insurance: Joi.object({
      covered: Joi.boolean().default(false),
      priorAuthorization: Joi.boolean().default(false),
      quantityLimits: Joi.boolean().default(false),
      stepTherapy: Joi.boolean().default(false)
    }).optional(),
    status: Joi.string().valid('ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK', 'RECALLED').default('ACTIVE')
  }),

  // Cập nhật thuốc
  updateMedication: Joi.object({
    name: Joi.string().max(200).trim().optional(),
    genericName: Joi.string().max(200).trim().optional(),
    brandName: Joi.string().max(200).trim().optional(),
    category: Joi.string().max(100).optional(),
    type: Joi.string().valid('TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'OINTMENT', 'INHALER', 'SUPPOSITORY', 'OTHER').optional(),
    strength: Joi.object({
      value: Joi.number().positive().optional(),
      unit: Joi.string().max(20).optional()
    }).optional(),
    form: Joi.string().max(100).optional(),
    stock: Joi.object({
      current: Joi.number().min(0).optional(),
      minimum: Joi.number().min(0).optional(),
      maximum: Joi.number().min(0).optional(),
      unit: Joi.string().max(50).optional(),
      reorderLevel: Joi.number().min(0).optional()
    }).optional(),
    pricing: Joi.object({
      costPrice: Joi.number().min(0).optional(),
      sellingPrice: Joi.number().min(0).optional(),
      insurancePrice: Joi.number().min(0).optional()
    }).optional(),
    storage: Joi.object({
      temperature: Joi.string().max(100).optional(),
      requirements: Joi.string().max(500).optional(),
      lightSensitive: Joi.boolean().optional(),
      humiditySensitive: Joi.boolean().optional()
    }).optional(),
    safety: Joi.object({
      schedule: Joi.string().valid('OTC', 'RX', 'CONTROLLED').optional(),
      pregnancyCategory: Joi.string().max(10).optional(),
      contraindications: Joi.array().items(Joi.string().max(200)).optional(),
      sideEffects: Joi.array().items(Joi.string().max(200)).optional(),
      interactions: Joi.array().items(
        Joi.object({
          medication: Joi.string().max(200),
          severity: Joi.string().max(50),
          effect: Joi.string().max(500)
        })
      ).optional()
    }).optional(),
    insurance: Joi.object({
      covered: Joi.boolean().optional(),
      priorAuthorization: Joi.boolean().optional(),
      quantityLimits: Joi.boolean().optional(),
      stepTherapy: Joi.boolean().optional()
    }).optional(),
    status: Joi.string().valid('ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK', 'RECALLED').optional()
  }).min(1), // Ít nhất 1 field để update

  // Cập nhật tồn kho
  updateStock: Joi.object({
    quantity: Joi.number().integer().positive().required(),
    type: Joi.string().valid('IN', 'OUT').required(),
    note: Joi.string().max(500).optional()
  }),

  // Tìm kiếm
  searchMedications: Joi.object({
    q: Joi.string().min(1).max(200).required(),
    limit: Joi.number().integer().min(1).max(50).default(10)
  }),

  // Lấy thuốc sắp hết
  getLowStock: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }),

  // Lấy theo ID (param)
  medicationId: Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
      .messages({
        'string.pattern.base': 'ID thuốc không hợp lệ'
      })
  })
};

module.exports = medicationValidation;
