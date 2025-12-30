const Joi = require('joi');
const { commonSchemas } = require('../middlewares/validation.middleware');

const bedValidation = {
  // Query params validation
  bedQuery: Joi.object({
    status: Joi.string().valid('AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE').optional(),
    room: Joi.string().optional(),
    ward: Joi.string().optional(),
    search: Joi.string().max(100).allow('', null).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }).unknown(true),

  // URL params validation
  params: Joi.object({
    id: commonSchemas.objectId.optional(),
    bedId: commonSchemas.objectId.optional()
  }).unknown(true),

  // Body validation for creating room
  body: Joi.object({
    roomNumber: Joi.string().required(),
    ward: Joi.string().required(),
    floor: Joi.string().optional(),
    type: Joi.string().optional(),
    capacity: Joi.number().integer().min(1).default(1),
    tags: Joi.array().items(Joi.string()).optional(),
    notes: Joi.string().max(500).optional()
  }),

  // Status update body
  statusBody: Joi.object({
    status: Joi.string().valid('AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE').required(),
    notes: Joi.string().max(500).optional()
  }),

  // Assign bed body
  assignBody: Joi.object({
    patientId: commonSchemas.objectId.required(),
    department: Joi.string().optional(),
    room: Joi.string().optional(),
    ward: Joi.string().optional(),
    notes: Joi.string().max(500).optional()
  }),

  // Transfer bed body
  transferBody: Joi.object({
    newBedId: Joi.string().optional(),
    newBedNumber: Joi.string().optional(),
    reason: Joi.string().max(500).optional()
  }).or('newBedId', 'newBedNumber'),

  // Discharge bed body
  dischargeBody: Joi.object({
    reason: Joi.string().max(500).optional(),
    makeAvailable: Joi.boolean().default(false)
  }),

  // Legacy aliases
  assignBed: Joi.object({
    patientId: commonSchemas.objectId.required(),
    department: Joi.string().optional(),
    room: Joi.string().optional(),
    ward: Joi.string().optional(),
    notes: Joi.string().max(500).optional()
  }),

  transferBed: Joi.object({
    newBedId: Joi.string().optional(),
    newBedNumber: Joi.string().optional(),
    reason: Joi.string().max(500).optional()
  }).or('newBedId', 'newBedNumber'),

  dischargeBed: Joi.object({
    reason: Joi.string().max(500).optional(),
    makeAvailable: Joi.boolean().default(false)
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE').required(),
    notes: Joi.string().max(500).optional()
  }),

  roomBody: Joi.object({
    roomNumber: Joi.string().required(),
    ward: Joi.string().required(),
    floor: Joi.string().optional(),
    type: Joi.string().optional(),
    capacity: Joi.number().integer().min(1).default(1),
    tags: Joi.array().items(Joi.string()).optional(),
    notes: Joi.string().max(500).optional()
  })
};

module.exports = { bedValidation };
