// src/validations/billing.validation.js
const Joi = require('joi');
const { commonSchemas } = require('../middlewares/validation.middleware');

// 🎯 SCHEMAS CHO BILLING
const billingSchemas = {
  // 🎯 TẠO HÓA ĐƠN
  createBill: Joi.object({
    items: Joi.array().items(
      Joi.object({
        description: Joi.string().min(2).max(200).required()
          .messages({
            'string.empty': 'Mô tả dịch vụ không được để trống',
            'string.min': 'Mô tả dịch vụ phải có ít nhất 2 ký tự',
            'string.max': 'Mô tả dịch vụ không được vượt quá 200 ký tự'
          }),
        quantity: Joi.number().min(1).max(1000).required()
          .messages({
            'number.base': 'Số lượng phải là số',
            'number.min': 'Số lượng phải lớn hơn 0',
            'number.max': 'Số lượng không được vượt quá 1000'
          }),
        unitPrice: Joi.number().min(0).max(1000000000).required()
          .messages({
            'number.base': 'Đơn giá phải là số',
            'number.min': 'Đơn giá không được âm',
            'number.max': 'Đơn giá quá lớn'
          }),
        category: Joi.string().valid(
          'CONSULTATION', 
          'MEDICATION', 
          'LAB_TEST', 
          'PROCEDURE', 
          'HOSPITALIZATION',
          'OTHER'
        ).required()
          .messages({
            'any.only': 'Danh mục dịch vụ không hợp lệ'
          })
      })
    ).min(1).max(50)
      .messages({
        'array.min': 'Phải có ít nhất 1 dịch vụ',
        'array.max': 'Không được vượt quá 50 dịch vụ'
      }),
    taxRate: Joi.number().min(0).max(100).default(0)
      .messages({
        'number.base': 'Thuế suất phải là số',
        'number.min': 'Thuế suất không được âm',
        'number.max': 'Thuế suất không được vượt quá 100%'
      }),
    dueDate: Joi.date().min('now').optional()
      .messages({
        'date.base': 'Ngày đến hạn phải là ngày hợp lệ',
        'date.min': 'Ngày đến hạn phải lớn hơn ngày hiện tại'
      }),
    notes: Joi.string().max(1000).optional()
      .messages({
        'string.max': 'Ghi chú không được vượt quá 1000 ký tự'
      })
  }),

  // 🎯 CẬP NHẬT HÓA ĐƠN
  updateBill: Joi.object({
    items: Joi.array().items(
      Joi.object({
        description: Joi.string().min(2).max(200).required(),
        quantity: Joi.number().min(1).max(1000).required(),
        unitPrice: Joi.number().min(0).max(1000000000).required(),
        category: Joi.string().valid(
          'CONSULTATION', 
          'MEDICATION', 
          'LAB_TEST', 
          'PROCEDURE', 
          'HOSPITALIZATION',
          'OTHER'
        ).required()
      })
    ).min(1).max(50).optional(),
    taxRate: Joi.number().min(0).max(100).optional(),
    dueDate: Joi.date().min('now').optional(),
    notes: Joi.string().max(1000).optional()
  }),

  // 🎯 THANH TOÁN
  processPayment: Joi.object({
    amount: Joi.number().min(0.01).max(1000000000).required()
      .messages({
        'number.base': 'Số tiền phải là số',
        'number.min': 'Số tiền phải lớn hơn 0',
        'number.max': 'Số tiền quá lớn'
      }),
    paymentMethod: Joi.string().valid(
      'CASH', 
      'CREDIT_CARD', 
      'DEBIT_CARD', 
      'BANK_TRANSFER', 
      'INSURANCE',
      'MOBILE_PAYMENT'
    ).required()
      .messages({
        'any.only': 'Phương thức thanh toán không hợp lệ'
      }),
    referenceNumber: Joi.string().max(100).optional()
      .messages({
        'string.max': 'Số tham chiếu không được vượt quá 100 ký tự'
      }),
    notes: Joi.string().max(500).optional()
      .messages({
        'string.max': 'Ghi chú thanh toán không được vượt quá 500 ký tự'
      })
  }),

  // 🎯 HỦY HÓA ĐƠN
  voidBill: Joi.object({
    reason: Joi.string().min(5).max(500).required()
      .messages({
        'string.empty': 'Lý do hủy không được để trống',
        'string.min': 'Lý do hủy phải có ít nhất 5 ký tự',
        'string.max': 'Lý do hủy không được vượt quá 500 ký tự'
      })
  }),

  // 🎯 QUERY PARAMS CHO DANH SÁCH HÓA ĐƠN
  billQuery: Joi.object({
    status: Joi.string().valid('PENDING', 'PARTIAL', 'PAID', 'VOIDED').optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10)
  }),

  // 🎯 QUERY PARAMS CHO LỊCH SỬ THANH TOÁN
  paymentQuery: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    paymentMethod: Joi.string().valid(
      'CASH', 
      'CREDIT_CARD', 
      'DEBIT_CARD', 
      'BANK_TRANSFER', 
      'INSURANCE',
      'MOBILE_PAYMENT'
    ).optional(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10)
  }),

  // 🎯 REFUND PAYMENT SCHEMA
  refundPayment: Joi.object({
    amount: Joi.number().positive().required()
      .messages({
        'number.base': 'Số tiền hoàn phải là số',
        'number.positive': 'Số tiền hoàn phải lớn hơn 0'
      }),
    reason: Joi.string().min(5).max(500)
      .messages({
        'string.min': 'Lý do hoàn phải có ít nhất 5 ký tự',
        'string.max': 'Lý do hoàn không được vượt quá 500 ký tự'
      })
  }),

  // 🎯 UPDATE BILL SCHEMA
  updateBill: Joi.object({
    items: Joi.array().items(
      Joi.object({
        description: Joi.string().min(2).max(200),
        quantity: Joi.number().min(1),
        unitPrice: Joi.number().min(0)
      })
    ),
    taxRate: Joi.number().min(0).max(100),
    notes: Joi.string().max(500),
    dueDate: Joi.date()
  }),

  // 🎯 ID VALIDATION
  billId: Joi.object({
    billId: commonSchemas.objectId.required()
  }),
  patientId: Joi.object({
    patientId: commonSchemas.objectId.required()
  })
};

// 🎯 VALIDATION FUNCTIONS
const validateBilling = {
  createBill: (data) => billingSchemas.createBill.validate(data, { abortEarly: false }),
  updateBill: (data) => billingSchemas.updateBill.validate(data, { abortEarly: false }),
  processPayment: (data) => billingSchemas.processPayment.validate(data, { abortEarly: false }),
  refundPayment: (data) => billingSchemas.refundPayment.validate(data, { abortEarly: false }),
  voidBill: (data) => billingSchemas.voidBill.validate(data, { abortEarly: false }),
  billQuery: (data) => billingSchemas.billQuery.validate(data, { abortEarly: false }),
  paymentQuery: (data) => billingSchemas.paymentQuery.validate(data, { abortEarly: false })
};

module.exports = {
  billingSchemas,
  validateBilling
};