// src/validations/clinical.validation.js
const Joi = require('joi');

/**
 * 🩺 CLINICAL VALIDATION SCHEMAS
 * Đảm bảo dữ liệu khám chữa bệnh hợp lệ
 */

const clinicalValidation = {
  // 🎯 TẠO PHIÊN KHÁM BỆNH
  createConsultation: Joi.object({
    type: Joi.string().valid('INITIAL', 'FOLLOW_UP', 'SURGICAL', 'SPECIALIST').required(),
    mode: Joi.string().valid('IN_PERSON', 'TELEMEDICINE', 'PHONE').default('IN_PERSON'),
    reason: Joi.string().max(500).required()
      .messages({
        'string.empty': 'Lý do khám là bắt buộc',
        'any.required': 'Vui lòng nhập lý do khám'
      }),
    duration: Joi.number().integer().min(15).max(180).default(30),
    notes: Joi.string().max(1000).optional()
  }),

  // 🎯 CẬP NHẬT PHIÊN KHÁM
  updateConsultation: Joi.object({
    subjective: Joi.object({
      chiefComplaint: Joi.string().max(500).optional(),
      historyOfPresentIllness: Joi.string().max(2000).optional(),
      reviewOfSystems: Joi.string().max(1000).optional(),
      patientConcerns: Joi.string().max(1000).optional()
    }).optional(),
    objective: Joi.object({
      physicalFindings: Joi.string().max(1000).optional(),
      assessmentResults: Joi.string().max(1000).optional(),
      observations: Joi.string().max(1000).optional()
    }).optional(),
    assessment: Joi.object({
      clinicalImpressions: Joi.string().max(2000).optional(),
      differentialDiagnosis: Joi.array().items(Joi.string()).optional(),
      problemList: Joi.array().items(Joi.string()).optional()
    }).optional(),
    plan: Joi.object({
      diagnosticTests: Joi.array().items(Joi.string()).optional(),
      treatments: Joi.array().items(Joi.string()).optional(),
      medications: Joi.array().items(Joi.string()).optional(),
      referrals: Joi.array().items(Joi.string()).optional(),
      patientEducation: Joi.string().max(1000).optional(),
      followUpPlan: Joi.string().max(1000).optional()
    }).optional(),
    recommendations: Joi.array().items(
      Joi.object({
        category: Joi.string().required(),
        description: Joi.string().required(),
        priority: Joi.string().valid('HIGH', 'MEDIUM', 'LOW').default('MEDIUM'),
        deadline: Joi.date().iso().optional()
      })
    ).optional(),
    notes: Joi.string().max(1000).optional(),
    outcome: Joi.string().valid('IMPROVED', 'STABLE', 'WORSE', 'REFERRED').optional(),
    duration: Joi.number().integer().min(5).max(480).optional()
  }),

  // 🎯 THÊM CHẨN ĐOÁN
  addDiagnosis: Joi.object({
    diagnosisCode: Joi.string().max(20).required()
      .messages({
        'string.empty': 'Mã chẩn đoán là bắt buộc',
        'any.required': 'Vui lòng nhập mã chẩn đoán'
      }),
    diagnosisName: Joi.string().max(200).required()
      .messages({
        'string.empty': 'Tên chẩn đoán là bắt buộc',
        'any.required': 'Vui lòng nhập tên chẩn đoán'
      }),
    category: Joi.string().max(100).optional(),
    type: Joi.string().valid('PRIMARY', 'SECONDARY', 'DIFFERENTIAL', 'PROVISIONAL').default('PRIMARY'),
    certainty: Joi.string().valid('CONFIRMED', 'PROBABLE', 'POSSIBLE', 'RULED_OUT').default('PROBABLE'),
    severity: Joi.string().valid('MILD', 'MODERATE', 'SEVERE', 'CRITICAL').optional(),
    onsetDate: Joi.date().iso().max('now').optional(),
    description: Joi.string().max(1000).optional(),
    clinicalFeatures: Joi.array().items(Joi.string()).optional(),
    treatmentStatus: Joi.string().valid('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DISCONTINUED').default('NOT_STARTED'),
    followUpRequired: Joi.boolean().default(false),
    followUpInterval: Joi.string().max(50).optional(),
    notes: Joi.string().max(1000).optional(),
    prognosis: Joi.string().valid('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'GUARDED').optional()
  }),

  // 🎯 GHI NHẬN TRIỆU CHỨNG
  recordSymptoms: Joi.object({
    symptoms: Joi.array().items(Joi.string().max(100)).min(1).required()
      .messages({
        'array.min': 'Cần ít nhất một triệu chứng',
        'any.required': 'Vui lòng nhập triệu chứng'
      })
  }),

  // 🎯 GHI KẾT QUẢ KHÁM THỰC THỂ
  recordPhysicalExam: Joi.object({
    findings: Joi.string().max(1000).required()
      .messages({
        'string.empty': 'Kết quả khám là bắt buộc',
        'any.required': 'Vui lòng nhập kết quả khám'
      }),
    results: Joi.string().max(1000).optional(),
    observations: Joi.string().max(1000).optional(),
    cardiovascular: Joi.string().max(500).optional(),
    respiratory: Joi.string().max(500).optional(),
    abdominal: Joi.string().max(500).optional(),
    neurological: Joi.string().max(500).optional(),
    musculoskeletal: Joi.string().max(500).optional(),
    skin: Joi.string().max(500).optional()
  }),

  // 🎯 CẬP NHẬT CHẨN ĐOÁN (nếu có route dùng)
  updateDiagnosis: Joi.object({
    diagnosisName: Joi.string().max(200).optional(),
    diagnosisCode: Joi.string().max(20).optional(),
    category: Joi.string().max(100).optional(),
    type: Joi.string().valid('PRIMARY', 'SECONDARY', 'DIFFERENTIAL', 'PROVISIONAL').optional(),
    certainty: Joi.string().valid('CONFIRMED', 'PROBABLE', 'POSSIBLE', 'RULED_OUT').optional(),
    severity: Joi.string().valid('MILD', 'MODERATE', 'SEVERE', 'CRITICAL').optional(),
    description: Joi.string().max(1000).optional(),
    clinicalFeatures: Joi.array().items(Joi.string()).optional(),
    treatmentStatus: Joi.string().valid('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DISCONTINUED').optional(),
    followUpRequired: Joi.boolean().optional(),
    followUpInterval: Joi.string().max(50).optional(),
    notes: Joi.string().max(1000).optional(),
    prognosis: Joi.string().valid('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'GUARDED').optional(),
    status: Joi.string().valid('ACTIVE', 'IN_REMISSION', 'RESOLVED', 'CHRONIC').optional()
  }),

  // 🎯 TẠO KẾ HOẠCH ĐIỀU TRỊ
  createTreatmentPlan: Joi.object({
    diagnosisId: Joi.string().optional(),
    consultationId: Joi.string().optional(),
    planName: Joi.string().max(200).optional(),
    goals: Joi.array().items(Joi.string()).optional(),
    interventions: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('MEDICATION', 'PROCEDURE', 'THERAPY', 'LIFESTYLE', 'MONITORING').required(),
        description: Joi.string().max(500).required(),
        frequency: Joi.string().max(100).optional(),
        duration: Joi.string().max(100).optional(),
        notes: Joi.string().max(500).optional()
      })
    ).optional(),
    recommendations: Joi.string().max(2000).optional(),
    followUp: Joi.object({
      required: Joi.boolean().default(true),
      date: Joi.date().iso().min('now').optional(),
      notes: Joi.string().max(500).optional()
    }).optional(),
    referrals: Joi.array().items(
      Joi.object({
        department: Joi.string().required(),
        reason: Joi.string().required(),
        urgency: Joi.string().valid('ROUTINE', 'URGENT', 'EMERGENCY').default('ROUTINE')
      })
    ).optional()
  }),

  // 🎯 GHI NHẬN TIẾN TRIỂN
  recordProgressNote: Joi.object({
    consultationId: Joi.string().optional(),
    treatmentPlanId: Joi.string().optional(),
    subjective: Joi.string().max(1000).optional(),
    objective: Joi.string().max(1000).optional(),
    assessment: Joi.string().max(1000).optional(),
    plan: Joi.string().max(1000).optional(),
    note: Joi.string().max(2000).optional(),
    category: Joi.string().valid('IMPROVEMENT', 'NO_CHANGE', 'DETERIORATION', 'COMPLICATION').optional(),
    severity: Joi.string().valid('MILD', 'MODERATE', 'SEVERE').optional(),
    interventions: Joi.array().items(Joi.string()).optional(),
    nextSteps: Joi.string().max(500).optional()
  }),

  // 🎯 GHI NHẬN CỦA ĐIỀU DƯỠNG
  recordNursingNote: Joi.object({
    consultationId: Joi.string().optional(),
    noteType: Joi.string().valid('ASSESSMENT', 'INTERVENTION', 'PROGRESS', 'VITAL_SIGNS', 'MEDICATION', 'HYGIENE', 'MOBILITY', 'NUTRITION', 'OTHER').optional(),
    note: Joi.string().max(2000).optional(),
    category: Joi.string().valid('VITAL_SIGNS', 'MEDICATION', 'HYGIENE', 'MOBILITY', 'NUTRITION', 'OTHER').optional(),
    vitalSigns: Joi.object({
      bloodPressure: Joi.object({
        systolic: Joi.number().optional(),
        diastolic: Joi.number().optional()
      }).optional(),
      heartRate: Joi.number().optional(),
      temperature: Joi.number().optional(),
      respiratoryRate: Joi.number().optional(),
      oxygenSaturation: Joi.number().optional()
    }).optional(),
    observations: Joi.string().max(1000).optional(),
    interventions: Joi.array().items(Joi.string()).optional(),
    patientResponse: Joi.string().max(500).optional()
  }),

  // 🎯 GHI DẤU HIỆU SINH TỒN
  recordVitalSigns: Joi.object({
    bloodPressure: Joi.object({
      systolic: Joi.number().integer().min(50).max(250).optional(),
      diastolic: Joi.number().integer().min(30).max(150).optional()
    }).optional(),
    heartRate: Joi.number().integer().min(30).max(200).optional(),
    temperature: Joi.number().min(30).max(45).optional(),
    respiratoryRate: Joi.number().integer().min(5).max(60).optional(),
    spo2: Joi.number().min(0).max(100).optional(),
    height: Joi.number().min(50).max(250).optional(), // cm
    weight: Joi.number().min(2).max(500).optional(), // kg
    recordedAt: Joi.date().iso().optional()
  }),

  // 🎯 TÌM KIẾM ICD-10
  searchICD10: Joi.object({
    q: Joi.string().min(2).max(100).required()
  }),

  // 🎯 QUERY CHO LẤY LỊCH SỬ KHÁM CỦA BỆNH NHÂN
  getPatientConsultations: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().optional(),
    status: Joi.string().valid('COMPLETED', 'IN_PROGRESS', 'CANCELLED').optional()
  }),

  // 🎯 QUERY CHO LẤY CHẨN ĐOÁN CỦA BỆNH NHÂN
  getPatientDiagnoses: Joi.object({
    status: Joi.string().valid('ACTIVE', 'IN_REMISSION', 'RESOLVED', 'CHRONIC').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional()
  }),

  // 🎯 QUERY CHO LẤY LỊCH SỬ DẤU HIỆU SINH TỒN
  getVitalSignsHistory: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }),

  // 🎯 QUERY CHO XU HƯỚNG DẤU HIỆU SINH TỒN
  getVitalSignsTrend: Joi.object({
    type: Joi.string().valid('bloodPressure', 'heartRate', 'temperature', 'respiratoryRate', 'spo2', 'weight').required(),
    days: Joi.number().integer().min(1).max(365).default(90)
  }),

  // 🎯 QUERY CHO LẤY TEMPLATES LÂM SÀNG
  getClinicalTemplates: Joi.object({
    specialty: Joi.string().optional()
  }),

  // 🎯 LƯU TEMPLATE LÂM SÀNG
  saveClinicalTemplate: Joi.object({
    name: Joi.string().max(200).required(),
    specialty: Joi.string().max(100).optional(),
    content: Joi.object().required(), // hoặc Joi.string() tùy cấu trúc bạn dùng
    description: Joi.string().max(500).optional()
  }),

  // 🎯 PARAM SCHEMAS (rất quan trọng cho validate params)
  consultationIdParam: Joi.object({
    id: Joi.string().required(),
    consultationId: Joi.string().required() // dùng cho route có :consultationId
  }),

  patientIdParam: Joi.object({
    patientId: Joi.string().required()
  })
};

// ⚠️ EXPORT ĐÚNG CẤU TRÚC ĐỂ ROUTES IMPORT ĐƯỢC
module.exports = {
  schemas: clinicalValidation
};