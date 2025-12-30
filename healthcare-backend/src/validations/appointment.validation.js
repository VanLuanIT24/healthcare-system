const Joi = require('joi');
const { commonSchemas } = require('../middlewares/validation.middleware');

/**
 * 🏥 APPOINTMENT VALIDATION SCHEMAS
 * Đảm bảo dữ liệu lịch hẹn hợp lệ
 */

const appointmentValidation = {
  // 🎯 TẠO LỊCH HẸN
  createAppointment: Joi.object({
    patientId: commonSchemas.objectId.required(),
    doctorId: commonSchemas.objectId.required(),
    specialty: Joi.string().required(),
    appointmentDate: Joi.date().iso().required(),
    duration: Joi.number().integer().min(15).max(480).optional().default(30),
    timeSlot: Joi.string().optional(),
    type: Joi.string().valid('CONSULTATION', 'FOLLOW_UP', 'CHECKUP', 'SURGERY', 'TEST', 'OTHER').required(),
    location: Joi.string().required(),
    mode: Joi.string().valid('IN_PERSON', 'TELEMEDICINE', 'PHONE').optional(),
    room: Joi.string().optional(),
    reason: Joi.string().max(500).optional(),
    notes: Joi.string().max(1000).optional(),
    description: Joi.string().max(1000).optional(),
    symptoms: Joi.array().items(Joi.string()).optional()
  }),

  // 🎯 CẬP NHẬT LỊCH HẸN
  updateAppointment: Joi.object({
    appointmentDate: Joi.date().iso().optional(),
    timeSlot: Joi.string().optional(),
    status: Joi.string().valid('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW').optional(),
    reason: Joi.string().max(500).optional(),
    notes: Joi.string().max(1000).optional()
  }),

  // 🎯 HỦY LỊCH HẸN
  cancelAppointment: Joi.object({
    reason: Joi.string().max(500).required()
  }),

  // 🎯 ĐẶT LẠI LỊCH HẸN
  rescheduleAppointment: Joi.object({
    appointmentDate: Joi.date().iso().required(),
    timeSlot: Joi.string().required(),
    reason: Joi.string().max(500).optional()
  }),

  // 🎯 LẤY LỊCH HẸN CỦA BỆNH NHÂN
  getPatientAppointments: Joi.object({
    patientId: commonSchemas.objectId.required(),
    status: Joi.string().valid('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10)
  }),

  // 🎯 LẤY LỊCH HẸN CỦA BÁC SĨ
  getDoctorAppointments: Joi.object({
    doctorId: commonSchemas.objectId.required(),
    status: Joi.string().valid('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10)
  }),

  // 🎯 TẠO LỊCH LÀM VIỆC
  createSchedule: Joi.object({
    doctorId: commonSchemas.objectId.required(),
    date: Joi.date().iso().required(),
    timeSlots: Joi.array().items(
      Joi.object({
        startTime: Joi.string().required(),
        endTime: Joi.string().required(),
        isAvailable: Joi.boolean().default(true)
      })
    ).required()
  }),

  // 🎯 LẤY LỊCH LÀM VIỆC CỦA BÁC SĨ
  getDoctorSchedule: Joi.object({
    doctorId: Joi.alternatives().try(
      commonSchemas.objectId,
      Joi.string().valid('me')
    ).optional(),
    date: Joi.date().iso().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional()
  }),

  // 🎯 CẬP NHẬT LỊCH LÀM VIỆC
  updateSchedule: Joi.object({
    doctorId: commonSchemas.objectId.required(),
    date: Joi.date().iso().required(),
    changes: Joi.object({
      cancellations: Joi.array().items(Joi.string()).optional(),
      reschedules: Joi.array().items(
        Joi.object({
          appointmentId: Joi.string().required(),
          newTime: Joi.date().iso().required()
        })
      ).optional()
    }).optional(),
    timeSlots: Joi.array().items(
      Joi.object({
        startTime: Joi.string().required(),
        endTime: Joi.string().required(),
        isAvailable: Joi.boolean().default(true)
      })
    ).required()
  }),

  // 🎯 GỬI THÔNG BÁO NHẮC LỊCH HẸN
  sendReminder: Joi.object({
    message: Joi.string().max(500).optional()
  }),

  // ===== LEGACY MEDICAL RECORD SCHEMAS - SHOULD BE IN SEPARATE FILE =====
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
  }),

  // 🎯 THÊM THÔNG TIN PHẪU THUẬT
  addSurgicalHistory: Joi.object({
    condition: Joi.string().max(200).required(),
    procedure: Joi.string().max(200).required(),
    surgeryDate: Joi.date().iso().max('now').required(),
    surgeon: Joi.string().max(100).optional(),
    hospital: Joi.string().max(200).optional(),
    description: Joi.string().max(1000).optional(),
    complications: Joi.string().max(500).optional(),
    outcome: Joi.string().valid('SUCCESSFUL', 'PARTIAL', 'COMPLICATED').optional(),
    notes: Joi.string().max(1000).optional()
  }),

  // 🎯 GHI NHẬN PHÁT HIỆN LÂM SÀNG
  recordClinicalFindings: Joi.object({
    patientId: commonSchemas.objectId.required(),
    department: Joi.string().max(100).required(),
    chiefComplaint: Joi.string().max(500).required(),
    findings: Joi.string().max(2000).required(),
    observations: Joi.string().max(1000).optional(),
    notes: Joi.string().max(1000).optional()
  }),

  // 🎯 TÌM KIẾM THEO CHẨN ĐOÁN
  searchByDiagnosis: Joi.object({
    diagnosis: Joi.string().max(100).required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional()
  }),

  // 🎯 THỐNG KÊ
  getStats: Joi.object({
    timeframe: Joi.string().valid('7d', '30d', '90d', '1y').default('30d')
  }),

  // 🎯 TÌM KIẾM LỊCH HẸN NÂNG CAO
  searchAppointments: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
    doctorId: commonSchemas.objectId.optional(),
    patientId: commonSchemas.objectId.optional(),
    department: Joi.string().max(100).optional(),
    sortBy: Joi.string().valid('appointmentDate', 'createdAt', 'updatedAt').default('appointmentDate'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc')
  }),

  // 🎯 LẤY SLOT THỜI GIAN KHẢ DỤNG
  getAvailableSlots: Joi.object({
    doctorId: commonSchemas.objectId.required(),
    date: Joi.date().iso().required()
  }),

  // 🎯 HOÀN THÀNH LỊCH HẸN
  completeAppointment: Joi.object({
    notes: Joi.string().max(1000).optional()
  }),

  // 🎯 THỐNG KÊ LỊCH HẸN
  getAppointmentStats: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
    status: Joi.string().valid('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW').optional()
  })
,
  // 🎯 YÊU CẦU HỦY LỊCH HẸN
  cancelRequest: Joi.object({
    reason: Joi.string().max(500).required()
  }),

  // 🎯 DUYỆT YÊU CẦU HỦY
  approveCancelRequest: Joi.object({
    approved: Joi.boolean().required(),
    notes: Joi.string().max(500).optional()
  }),

  // 🎯 THÔNG TIN AUTDAL CẦN CHO EXPORT
  exportAppointments: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
    doctorId: commonSchemas.objectId.optional(),
    patientId: commonSchemas.objectId.optional()
  }),

  exportFormat: Joi.object({
    format: Joi.string().valid('pdf', 'excel').required()
  }),

  // 🎯 NO-SHOW
  markNoShow: Joi.object({
    reason: Joi.string().max(500).optional()
  }),

  // 🎯 THAM SỐ ROUTE
  appointmentIdParam: Joi.object({
    id: commonSchemas.objectId.required()
  }),

  doctorIdParam: Joi.object({
    doctorId: commonSchemas.objectId.required()
  }),

  patientIdParam: Joi.object({
    patientId: commonSchemas.objectId.required()
  }),

  scheduleIdParam: Joi.object({
    scheduleId: commonSchemas.objectId.required()
  }),

  // 🎯 LẤY LỊCH HẸN HÔM NAY
  getTodayAppointments: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    status: Joi.string().valid('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW').optional(),
    doctorId: commonSchemas.objectId.optional(),
    departmentId: commonSchemas.objectId.optional()
  }).unknown(true),

  // 🎯 LẤY LỊCH HẸN SẮP TỚI
  getUpcomingAppointments: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    days: Joi.number().integer().min(1).max(30).default(7),
    status: Joi.string().valid('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW').optional(),
    doctorId: commonSchemas.objectId.optional(),
    departmentId: commonSchemas.objectId.optional()
  }).unknown(true)
};

// Aliases to align with route naming
appointmentValidation.getAppointments = appointmentValidation.searchAppointments;
appointmentValidation.getAppointmentById = appointmentValidation.appointmentIdParam;
appointmentValidation.requestCancelAppointment = appointmentValidation.cancelRequest;
appointmentValidation.noShowAppointment = appointmentValidation.markNoShow;
appointmentValidation.createDoctorSchedule = appointmentValidation.createSchedule;
appointmentValidation.updateDoctorSchedule = appointmentValidation.updateSchedule;
appointmentValidation.deleteDoctorSchedule = appointmentValidation.scheduleIdParam;

// Expose under `schemas` to match route imports
module.exports = { schemas: appointmentValidation };