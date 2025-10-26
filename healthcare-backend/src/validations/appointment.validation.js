const Joi = require('joi');
const { commonSchemas } = require('../middlewares/validation.middleware');

/**
 * 📅 APPOINTMENT VALIDATION SCHEMAS
 * Đảm bảo dữ liệu lịch hẹn hợp lệ
 */

const appointmentValidation = {
  // 🎯 TẠO LỊCH HẸN
  createAppointment: Joi.object({
    patientId: commonSchemas.objectId.required()
      .messages({
        'any.required': 'Vui lòng chọn bệnh nhân'
      }),
    doctorId: commonSchemas.objectId.required()
      .messages({
        'any.required': 'Vui lòng chọn bác sĩ'
      }),
    appointmentDate: Joi.date().iso().min('now').required()
      .messages({
        'date.min': 'Thời gian hẹn phải ở tương lai',
        'any.required': 'Thời gian hẹn là bắt buộc'
      }),
    duration: Joi.number().integer().min(15).max(180).default(30),
    type: Joi.string().valid('CONSULTATION', 'FOLLOW_UP', 'CHECKUP', 'SURGERY', 'TEST', 'OTHER').required(),
    mode: Joi.string().valid('IN_PERSON', 'TELEMEDICINE', 'PHONE').default('IN_PERSON'),
    location: Joi.string().required()
      .messages({
        'string.empty': 'Địa điểm là bắt buộc',
        'any.required': 'Vui lòng chọn địa điểm'
      }),
    room: Joi.string().optional(),
    reason: Joi.string().max(500).required()
      .messages({
        'string.empty': 'Lý do hẹn là bắt buộc',
        'string.max': 'Lý do hẹn không được vượt quá 500 ký tự',
        'any.required': 'Vui lòng nhập lý do hẹn'
      }),
    description: Joi.string().max(1000).optional(),
    symptoms: Joi.array().items(Joi.string()).optional(),
    preparationInstructions: Joi.string().max(500).optional()
  }),

  
  // 🎯 TÌM KIẾM LỊCH HẸN BỆNH NHÂN
  getPatientAppointments: Joi.object({
    status: Joi.string().valid('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional()
  }),

  // 🎯 TÌM KIẾM LỊCH HẸN BÁC SĨ
  getDoctorAppointments: Joi.object({
    status: Joi.string().valid('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    date: Joi.date().iso().optional()
  }),

  // 🎯 CẬP NHẬT LỊCH HẸN
  updateAppointment: Joi.object({
    appointmentDate: Joi.date().iso().min('now').optional(),
    duration: Joi.number().integer().min(15).max(180).optional(),
    type: Joi.string().valid('CONSULTATION', 'FOLLOW_UP', 'CHECKUP', 'SURGERY', 'TEST', 'OTHER').optional(),
    mode: Joi.string().valid('IN_PERSON', 'TELEMEDICINE', 'PHONE').optional(),
    location: Joi.string().optional(),
    room: Joi.string().optional(),
    reason: Joi.string().max(500).optional(),
    description: Joi.string().max(1000).optional(),
    symptoms: Joi.array().items(Joi.string()).optional(),
    preparationInstructions: Joi.string().max(500).optional()
  }),

  // 🎯 HỦY LỊCH HẸN
  cancelAppointment: Joi.object({
    reason: Joi.string().max(500).required()
      .messages({
        'string.empty': 'Lý do hủy là bắt buộc',
        'string.max': 'Lý do hủy không được vượt quá 500 ký tự',
        'any.required': 'Vui lòng nhập lý do hủy'
      }),
    notes: Joi.string().max(1000).optional()
  }),

  // 🎯 TẠO LỊCH LÀM VIỆC
  createSchedule: Joi.object({
    doctorId: commonSchemas.objectId.required(),
    date: Joi.date().iso().min('now').required(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    slotDuration: Joi.number().integer().min(15).max(60).default(30),
    breaks: Joi.array().items(
      Joi.object({
        start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
      })
    ).optional()
  }),

  // 🎯 LẤY LỊCH LÀM VIỆC
  getDoctorSchedule: Joi.object({
    date: Joi.date().iso().optional(),
    week: Joi.date().iso().optional()
  })
};

module.exports = appointmentValidation;