const Joi = require('joi');
const { commonSchemas } = require('../middlewares/validation.middleware');

/**
 * 🏥 MEDICAL RECORD VALIDATION SCHEMAS
 * Đảm bảo dữ liệu hồ sơ bệnh án hợp lệ
 */

const medicalRecordValidation = {
  // 🎯 TẠO HỒ SƠ BỆNH ÁN
  createMedicalRecord: Joi.object({
    doctorId: commonSchemas.objectId.required()
      .messages({
        'any.required': 'Vui lòng chọn bác sĩ'
      }),
    department: Joi.string().max(100).required()
      .messages({
        'string.empty': 'Khoa/phòng là bắt buộc',
        'any.required': 'Vui lòng chọn khoa/phòng'
      }),
    visitType: Joi.string().valid('OUTPATIENT', 'INPATIENT', 'EMERGENCY', 'FOLLOW_UP').required(),
    chiefComplaint: Joi.string().max(500).required()
      .messages({
        'string.empty': 'Lý do khám là bắt buộc',
        'any.required': 'Vui lòng nhập lý do khám'
      }),
    historyOfPresentIllness: Joi.string().max(2000).optional(),
    symptoms: Joi.array().items(
      Joi.object({
        symptom: Joi.string().required(),
        duration: Joi.string().optional(),
        severity: Joi.string().valid('MILD', 'MODERATE', 'SEVERE').optional(),
        notes: Joi.string().optional()
      })
    ).optional(),
    privacyLevel: Joi.string().valid('STANDARD', 'SENSITIVE', 'RESTRICTED').default('STANDARD')
  }),

  // 🎯 CẬP NHẬT HỒ SƠ BỆNH ÁN
  updateMedicalRecord: Joi.object({
    chiefComplaint: Joi.string().max(500).optional(),
    historyOfPresentIllness: Joi.string().max(2000).optional(),
    symptoms: Joi.array().items(
      Joi.object({
        symptom: Joi.string().required(),
        duration: Joi.string().optional(),
        severity: Joi.string().valid('MILD', 'MODERATE', 'SEVERE').optional(),
        notes: Joi.string().optional()
      })
    ).optional(),
    vitalSigns: Joi.object({
      bloodPressure: Joi.object({
        systolic: Joi.number().min(60).max(300).optional(),
        diastolic: Joi.number().min(40).max(200).optional()
      }).optional(),
      heartRate: Joi.number().min(30).max(250).optional(),
      respiratoryRate: Joi.number().min(8).max(60).optional(),
      temperature: Joi.number().min(35).max(42).optional(),
      oxygenSaturation: Joi.number().min(70).max(100).optional(),
      height: Joi.number().min(30).max(250).optional(),
      weight: Joi.number().min(2).max(300).optional()
    }).optional(),
    physicalExamination: Joi.object({
      generalAppearance: Joi.string().max(500).optional(),
      cardiovascular: Joi.string().max(500).optional(),
      respiratory: Joi.string().max(500).optional(),
      abdominal: Joi.string().max(500).optional(),
      neurological: Joi.string().max(500).optional(),
      musculoskeletal: Joi.string().max(500).optional(),
      skin: Joi.string().max(500).optional(),
      notes: Joi.string().max(1000).optional()
    }).optional(),
    diagnoses: Joi.array().items(
      Joi.object({
        diagnosis: Joi.string().required(),
        code: Joi.string().optional(),
        type: Joi.string().valid('PRIMARY', 'SECONDARY', 'DIFFERENTIAL').default('PRIMARY'),
        certainty: Joi.string().valid('CONFIRMED', 'PROBABLE', 'POSSIBLE').default('PROBABLE'),
        notes: Joi.string().optional()
      })
    ).optional(),
    treatmentPlan: Joi.object({
      recommendations: Joi.string().max(2000).optional(),
      followUp: Joi.object({
        required: Joi.boolean().default(false),
        date: Joi.date().iso().optional(),
        notes: Joi.string().max(500).optional()
      }).optional(),
      referrals: Joi.array().items(
        Joi.object({
          department: Joi.string().required(),
          reason: Joi.string().required(),
          urgency: Joi.string().valid('ROUTINE', 'URGENT', 'EMERGENCY').default('ROUTINE')
        })
      ).optional()
    }).optional(),
    privacyLevel: Joi.string().valid('STANDARD', 'SENSITIVE', 'RESTRICTED').optional()
  }),

  // 🎯 GHI NHẬN DẤU HIỆU SINH TỒN
  recordVitalSigns: Joi.object({
    bloodPressure: Joi.object({
      systolic: Joi.number().min(60).max(300).required(),
      diastolic: Joi.number().min(40).max(200).required()
    }).optional(),
    heartRate: Joi.number().min(30).max(250).required(),
    respiratoryRate: Joi.number().min(8).max(60).required(),
    temperature: Joi.number().min(35).max(42).required(),
    oxygenSaturation: Joi.number().min(70).max(100).optional(),
    height: Joi.number().min(30).max(250).optional(),
    weight: Joi.number().min(2).max(300).optional()
  }),

  // 🎯 THÊM TIỀN SỬ BỆNH LÝ
  addMedicalHistory: Joi.object({
    category: Joi.string().valid('CHRONIC_CONDITION', 'SURGERY', 'ALLERGY', 'MEDICATION', 'FAMILY_HISTORY').required(),
    condition: Joi.string().max(200).required(),
    description: Joi.string().max(1000).optional(),
    onsetDate: Joi.date().iso().max('now').optional(),
    status: Joi.string().valid('ACTIVE', 'RESOLVED', 'CHRONIC').optional(),
    severity: Joi.string().valid('MILD', 'MODERATE', 'SEVERE').optional(),
    treatment: Joi.string().max(500).optional(),
    notes: Joi.string().max(1000).optional()
  }),

  // 🎯 TÌM KIẾM HỒ SƠ BỆNH ÁN
  getPatientMedicalRecords: Joi.object({
    visitType: Joi.string().valid('OUTPATIENT', 'INPATIENT', 'EMERGENCY', 'FOLLOW_UP').optional(),
    status: Joi.string().valid('DRAFT', 'COMPLETED', 'ARCHIVED').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
    sortBy: Joi.string().valid('visitDate', 'createdAt', 'updatedAt').default('visitDate'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // 🎯 LẤY LỊCH SỬ DẤU HIỆU SINH TỒN
  getVitalSignsHistory: Joi.object({
    timeframe: Joi.string().valid('24h', '7d', '30d', '90d').default('7d')
  })
};

module.exports = medicalRecordValidation;