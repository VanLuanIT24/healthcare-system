const Joi = require('joi');
const { commonSchemas } = require('../middlewares/validation.middleware');

const orderLabTestValidation = {
  body: Joi.object({
    medicalRecordId: commonSchemas.objectId.optional(),
    tests: Joi.array().items(
      Joi.object({
        testId: commonSchemas.objectId.required(),
        specimenType: Joi.string().valid('BLOOD', 'URINE', 'STOOL', 'TISSUE', 'SALIVA', 'CSF', 'OTHER').required(),
        instructions: Joi.string().max(500).optional(),
        priority: Joi.string().valid('ROUTINE', 'URGENT', 'STAT').default('ROUTINE')
      })
    ).min(1).required(),
    clinicalIndication: Joi.string().max(1000).required(),
    differentialDiagnosis: Joi.array().items(Joi.string()).optional(),
    preTestConditions: Joi.string().max(500).optional(),
    notes: Joi.string().max(1000).optional(),
    specialInstructions: Joi.string().max(500).optional()
  })
};

const recordLabResultValidation = {
  body: Joi.object({
    testId: commonSchemas.objectId.required(),
    result: Joi.object({
      value: Joi.alternatives().try(
        Joi.number(),
        Joi.string(),
        Joi.boolean()
      ).required(),
      unit: Joi.string().optional(),
      normalRange: Joi.string().optional(),
      flag: Joi.string().valid('NORMAL', 'LOW', 'HIGH', 'CRITICAL', 'ABNORMAL').optional(),
      notes: Joi.string().max(500).optional()
    }).required(),
    methodology: Joi.string().optional(),
    qualityControl: Joi.object({
      passed: Joi.boolean().required(),
      notes: Joi.string().optional()
    }).optional()
  })
};

const updateLabResultValidation = {
  body: Joi.object({
    result: Joi.object({
      value: Joi.alternatives().try(
        Joi.number(),
        Joi.string(),
        Joi.boolean()
      ).optional(),
      unit: Joi.string().optional(),
      normalRange: Joi.string().optional(),
      flag: Joi.string().valid('NORMAL', 'LOW', 'HIGH', 'CRITICAL', 'ABNORMAL').optional(),
      notes: Joi.string().max(500).optional()
    }).optional(),
    methodology: Joi.string().optional()
  })
};

const updateLabOrderValidation = {
  body: Joi.object({
    tests: Joi.array().items(
      Joi.object({
        testId: commonSchemas.objectId.required(),
        specimenType: Joi.string().valid('BLOOD', 'URINE', 'STOOL', 'TISSUE', 'SALIVA', 'CSF', 'OTHER').optional(),
        instructions: Joi.string().max(500).optional()
      })
    ).optional(),
    clinicalIndication: Joi.string().max(1000).optional(),
    priority: Joi.string().valid('ROUTINE', 'URGENT', 'STAT').optional(),
    notes: Joi.string().max(1000).optional()
  })
};

module.exports = {
  orderLabTestValidation,
  recordLabResultValidation,
  updateLabResultValidation,
  updateLabOrderValidation
};