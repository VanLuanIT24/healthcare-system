const Joi = require('joi');
const { commonSchemas } = require('../middlewares/validation.middleware');

const schemas = {
  // ===== PARAMS =====
  prescriptionIdParam: Joi.object({ id: commonSchemas.objectId.required() }),
  patientIdParam: Joi.object({ patientId: commonSchemas.objectId.required() }),
  medicationIdParam: Joi.object({ medicationId: commonSchemas.objectId.required() }),

  // ===== BODY =====
  createPrescription: Joi.object({
    patientId: commonSchemas.objectId.optional(),
    doctorId: commonSchemas.objectId.optional(),
    medicalRecordId: commonSchemas.objectId.optional(),
    consultationId: commonSchemas.objectId.optional(),
    diagnosis: Joi.string().max(500).optional(),
    medications: Joi.array().items(
      Joi.object({
        medicationId: commonSchemas.objectId.optional(),
        dosage: Joi.alternatives().try(
          Joi.string(),
          Joi.object({
            value: Joi.number().positive().optional(),
            unit: Joi.string().optional(),
            form: Joi.string().optional()
          })
        ).optional(),
        frequency: Joi.alternatives().try(
          Joi.string(),
          Joi.object({
            timesPerDay: Joi.number().integer().min(1).max(10).optional(),
            interval: Joi.string().optional(),
            instructions: Joi.string().optional()
          })
        ).optional(),
        duration: Joi.alternatives().try(
          Joi.string(),
          Joi.object({
            value: Joi.number().positive().optional(),
            unit: Joi.string().valid('days', 'weeks', 'months').optional()
          })
        ).optional(),
        route: Joi.string().valid('ORAL', 'TOPICAL', 'INJECTION', 'INHALATION', 'RECTAL', 'OTHER').optional(),
        totalQuantity: Joi.number().integer().positive().optional(),
        refills: Joi.object({
          allowed: Joi.number().integer().min(0).max(5).default(0)
        }).optional(),
        instructions: Joi.string().max(500).optional(),
        warnings: Joi.array().items(Joi.string()).optional()
      })
    ).min(1).optional(),
    notes: Joi.string().max(1000).optional(),
    specialInstructions: Joi.string().max(500).optional(),
    validityDays: Joi.number().integer().min(1).max(90).default(30)
  }),

  updatePrescription: Joi.object({
    medications: Joi.array().items(
      Joi.object({
        medicationId: commonSchemas.objectId.required(),
        dosage: Joi.object({
          value: Joi.number().positive().required(),
          unit: Joi.string().required()
        }).required(),
        frequency: Joi.object({
          timesPerDay: Joi.number().integer().min(1).max(10).required(),
          instructions: Joi.string().optional()
        }).required(),
        duration: Joi.object({
          value: Joi.number().positive().required(),
          unit: Joi.string().valid('days', 'weeks', 'months').required()
        }).required(),
        totalQuantity: Joi.number().integer().positive().required(),
        instructions: Joi.string().max(500).optional()
      })
    ).optional(),
    notes: Joi.string().max(1000).optional(),
    specialInstructions: Joi.string().max(500).optional(),
    status: Joi.string().valid('DRAFT', 'ACTIVE', 'CANCELLED').optional()
  }),

  cancelPrescription: Joi.object({
    reason: Joi.string().max(500).optional()
  }),

  dispenseMedication: Joi.object({
    medicationId: commonSchemas.objectId.required(),
    quantity: Joi.number().integer().positive().required(),
    batchNumber: Joi.string().optional(),
    expiryDate: Joi.date().min(new Date()).optional(),
    notes: Joi.string().max(500).optional()
  }),

  checkDrugInteractions: Joi.object({
    medications: Joi.array().items(commonSchemas.objectId).min(1).optional(),
    drugs: Joi.array().items(
      Joi.object({
        medicationId: commonSchemas.objectId.optional(),
        name: Joi.string().optional(),
        dosage: Joi.string().optional()
      })
    ).min(1).optional()
  }),

  checkPatientAllergies: Joi.object({
    medications: Joi.array().items(commonSchemas.objectId).min(1).optional()
  }),

  addMedicationToPrescription: Joi.object({
    medicationId: commonSchemas.objectId.required(),
    dosage: Joi.string().required(),
    frequency: Joi.string().required(),
    duration: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
    instructions: Joi.string().optional(),
    totalQuantity: Joi.number().integer().min(1).optional()
  }),

  updateMedicationInPrescription: Joi.object({
    dosage: Joi.string().optional(),
    frequency: Joi.string().optional(),
    duration: Joi.string().optional(),
    quantity: Joi.number().integer().min(1).optional(),
    instructions: Joi.string().optional()
  }),

  medicationAdministration: Joi.object({
    medicationId: commonSchemas.objectId.required(),
    prescriptionId: Joi.string().required(),
    dose: Joi.string().required(),
    time: Joi.date().required(),
    administeredBy: commonSchemas.objectId.required(),
    notes: Joi.string().max(500).optional(),
    vitalSigns: Joi.object({
      bloodPressure: Joi.string().optional(),
      heartRate: Joi.number().optional(),
      temperature: Joi.number().optional()
    }).optional()
  }),

  // ===== QUERIES =====
  getPrescriptions: Joi.object({}).unknown(true),
  getPatientPrescriptions: Joi.object({}).unknown(true),
  getDosageSuggestions: Joi.object({}).unknown(true),
  getMedications: Joi.object({}).unknown(true),
  searchMedications: Joi.object({}).unknown(true),
  getExpiringMedications: Joi.object({}).unknown(true)
};

module.exports = { schemas };