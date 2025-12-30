const Joi = require('joi');
const { commonSchemas } = require('../middlewares/validation.middleware');

const inventoryValidation = {
  getItems: Joi.object({
    search: Joi.string().max(100).optional(),
    category: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(5).max(100).default(20)
  }),

  itemBody: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    sku: Joi.string().max(100).required(),
    category: Joi.string().max(100).optional(),
    unit: Joi.string().max(50).optional(),
    initialQuantity: Joi.number().min(0).optional().default(0),
    reorderThreshold: Joi.number().min(0).optional().default(0),
    location: Joi.string().max(200).optional(),
    costPerUnit: Joi.number().min(0).optional().default(0),
    expirationDate: Joi.date().optional(),
    metadata: Joi.object().optional()
  }),

  updateItem: Joi.object({
    name: Joi.string().min(2).max(200).optional(),
    category: Joi.string().max(100).optional(),
    unit: Joi.string().max(50).optional(),
    reorderThreshold: Joi.number().min(0).optional(),
    location: Joi.string().max(200).optional(),
    costPerUnit: Joi.number().min(0).optional(),
    expirationDate: Joi.date().optional(),
    metadata: Joi.object().optional()
  }).min(1),

  adjustStock: Joi.object({
    quantity: Joi.number().required(),
    reason: Joi.string().max(500).optional(),
    referenceId: Joi.string().max(100).optional()
  }),

  receiveStock: Joi.object({
    quantity: Joi.number().positive().required(),
    batchNumber: Joi.string().max(100).optional(),
    expirationDate: Joi.date().optional(),
    notes: Joi.string().max(500).optional(),
    referenceId: Joi.string().max(100).optional()
  }),

  issueStock: Joi.object({
    quantity: Joi.number().positive().required(),
    reason: Joi.string().max(500).optional(),
    referenceId: Joi.string().max(100).optional()
  }),

  itemId: Joi.object({
    itemId: commonSchemas.objectId.required()
  })
};

module.exports = { inventoryValidation };
