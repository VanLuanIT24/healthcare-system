// src/validations/billing.validation.js
const Joi = require('joi');
const { commonSchemas } = require('../middlewares/validation.middleware');

// 🎯 ENUM CONSTANTS (Đồng bộ với model)
const BILL_STATUS = ['DRAFT', 'ISSUED', 'PARTIAL', 'PAID', 'OVERDUE', 'WRITTEN_OFF', 'VOIDED'];
const BILL_TYPE = ['CONSULTATION', 'LABORATORY', 'PHARMACY', 'PROCEDURE', 'HOSPITALIZATION', 'OTHER'];
const PAYMENT_METHODS = ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'INSURANCE', 'MOBILE_PAYMENT', 'OTHER'];

// 🎯 SCHEMAS CHO BILLING (ĐÃ SỬA ĐỂ KHỚP VỚI MODEL)
const billingSchemas = {
  // 🎯 TẠO HÓA ĐƠN - SỬA items → services
  createBill: Joi.object({
    services: Joi.array().items(  // ĐỔI TÊN từ items → services
      Joi.object({
        serviceName: Joi.string().min(2).max(200).required()
          .messages({
            'string.empty': 'Tên dịch vụ không được để trống',
            'string.min': 'Tên dịch vụ phải có ít nhất 2 ký tự',
            'string.max': 'Tên dịch vụ không được vượt quá 200 ký tự'
          }),
        description: Joi.string().max(500).optional()
          .messages({
            'string.max': 'Mô tả dịch vụ không được vượt quá 500 ký tự'
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
        discount: Joi.number().min(0).max(1000000000).default(0)
          .messages({
            'number.base': 'Giảm giá phải là số',
            'number.min': 'Giảm giá không được âm'
          }),
        taxRate: Joi.number().min(0).max(100).default(0)
          .messages({
            'number.base': 'Thuế suất phải là số',
            'number.min': 'Thuế suất không được âm',
            'number.max': 'Thuế suất không được vượt quá 100%'
          })
      })
    ).min(1).max(50)
      .messages({
        'array.min': 'Phải có ít nhất 1 dịch vụ',
        'array.max': 'Không được vượt quá 50 dịch vụ'
      }),
    
    // Thêm billType để khớp model
    billType: Joi.string().valid(...BILL_TYPE).required()
      .messages({
        'any.only': 'Loại hóa đơn không hợp lệ',
        'any.required': 'Loại hóa đơn là bắt buộc'
      }),
    
    // Thông tin bảo hiểm (nếu có)
    insurance: Joi.object({
      provider: Joi.string().max(100).optional(),
      policyNumber: Joi.string().max(50).optional(),
      coverageAmount: Joi.number().min(0).optional(),
      deductible: Joi.number().min(0).optional(),
      coPayment: Joi.number().min(0).max(100).optional()
    }).optional(),
    
    // Thông tin chung
    taxRate: Joi.number().min(0).max(100).default(0),
    dueDate: Joi.date().min('now').optional()
      .messages({
        'date.base': 'Ngày đến hạn phải là ngày hợp lệ',
        'date.min': 'Ngày đến hạn phải lớn hơn ngày hiện tại'
      }),
    notes: Joi.string().max(1000).optional()
      .messages({
        'string.max': 'Ghi chú không được vượt quá 1000 ký tự'
      }),
    terms: Joi.string().max(500).optional()
  }),

  // 🎯 CẬP NHẬT HÓA ĐƠN
  updateBill: Joi.object({
    services: Joi.array().items(
      Joi.object({
        serviceName: Joi.string().min(2).max(200),
        description: Joi.string().max(500),
        quantity: Joi.number().min(1).max(1000),
        unitPrice: Joi.number().min(0).max(1000000000),
        discount: Joi.number().min(0).max(1000000000),
        taxRate: Joi.number().min(0).max(100)
      })
    ).max(50).optional(),
    
    billType: Joi.string().valid(...BILL_TYPE).optional(),
    
    insurance: Joi.object({
      provider: Joi.string().max(100),
      policyNumber: Joi.string().max(50),
      coverageAmount: Joi.number().min(0),
      deductible: Joi.number().min(0),
      coPayment: Joi.number().min(0).max(100)
    }).optional(),
    
    taxRate: Joi.number().min(0).max(100).optional(),
    dueDate: Joi.date().min('now').optional(),
    notes: Joi.string().max(1000).optional(),
    terms: Joi.string().max(500).optional(),
    status: Joi.string().valid(...BILL_STATUS).optional()
  }),

  // 🎯 THANH TOÁN - Sửa để khớp với model payment
  processPayment: Joi.object({
    amount: Joi.number().min(0.01).max(1000000000).required()
      .messages({
        'number.base': 'Số tiền phải là số',
        'number.min': 'Số tiền phải lớn hơn 0',
        'number.max': 'Số tiền quá lớn'
      }),
    method: Joi.string().valid(...PAYMENT_METHODS).required()  // Đổi paymentMethod → method
      .messages({
        'any.only': 'Phương thức thanh toán không hợp lệ',
        'any.required': 'Phương thức thanh toán là bắt buộc'
      }),
    reference: Joi.string().max(100).optional()  // Đổi referenceNumber → reference
      .messages({
        'string.max': 'Số tham chiếu không được vượt quá 100 ký tự'
      }),
    notes: Joi.string().max(500).optional(),
    status: Joi.string().valid('PENDING', 'COMPLETED', 'FAILED').default('COMPLETED')
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

  // 🎯 QUERY PARAMS CHO DANH SÁCH HÓA ĐƠN - Sửa status enum
  billQuery: Joi.object({
    status: Joi.string().valid(...BILL_STATUS).optional(),
    billType: Joi.string().valid(...BILL_TYPE).optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    patientId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    sortBy: Joi.string().valid('issueDate', 'dueDate', 'grandTotal', 'createdAt').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // 🎯 QUERY PARAMS CHO LỊCH SỬ THANH TOÁN
  paymentQuery: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    method: Joi.string().valid(...PAYMENT_METHODS).optional(),  // Đổi paymentMethod → method
    status: Joi.string().valid('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED').optional(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    sortBy: Joi.string().valid('paymentDate', 'amount').default('paymentDate'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // 🎯 REFUND PAYMENT SCHEMA
  refundPayment: Joi.object({
    amount: Joi.number().positive().required()
      .messages({
        'number.base': 'Số tiền hoàn phải là số',
        'number.positive': 'Số tiền hoàn phải lớn hơn 0'
      }),
    reason: Joi.string().min(5).max(500).required()
      .messages({
        'string.min': 'Lý do hoàn phải có ít nhất 5 ký tự',
        'string.max': 'Lý do hoàn không được vượt quá 500 ký tự',
        'string.required': 'Lý do hoàn là bắt buộc'
      }),
    notes: Joi.string().max(500).optional()
  }),

  // 🎯 ID VALIDATION
  billId: Joi.object({
    billId: commonSchemas.objectId.required()
  }),
  patientId: Joi.object({
    patientId: commonSchemas.objectId.required()
  }),
  paymentId: Joi.object({
    paymentId: commonSchemas.objectId.required()
  }),

  // 🎯 VALIDATION CHO INSURANCE
  verifyInsurance: Joi.object({
    provider: Joi.string().max(100).required(),
    policyNumber: Joi.string().max(50).required(),
    groupNumber: Joi.string().max(50).optional(),
    effectiveDate: Joi.date().required(),
    expirationDate: Joi.date().min(Joi.ref('effectiveDate')).required(),
    coverageType: Joi.string().valid('BASIC', 'STANDARD', 'PREMIUM', 'FULL').required()
  }),

  // 🎯 VALIDATION CHO INSURANCE CLAIM
  insuranceClaim: Joi.object({
    claimAmount: Joi.number().min(0.01).max(1000000000).required(),
    diagnosisCodes: Joi.array().items(Joi.string().max(20)).min(1).required(),
    procedureCodes: Joi.array().items(Joi.string().max(20)).optional(),
    supportingDocuments: Joi.array().items(Joi.string()).optional(),
    notes: Joi.string().max(1000).optional()
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
  paymentQuery: (data) => billingSchemas.paymentQuery.validate(data, { abortEarly: false }),
  verifyInsurance: (data) => billingSchemas.verifyInsurance.validate(data, { abortEarly: false }),
  insuranceClaim: (data) => billingSchemas.insuranceClaim.validate(data, { abortEarly: false }),
  billId: (data) => billingSchemas.billId.validate(data, { abortEarly: false }),
  patientId: (data) => billingSchemas.patientId.validate(data, { abortEarly: false }),
  paymentId: (data) => billingSchemas.paymentId.validate(data, { abortEarly: false })
};

module.exports = {
  billingSchemas,
  validateBilling,
  BILL_STATUS,
  BILL_TYPE,
  PAYMENT_METHODS
};