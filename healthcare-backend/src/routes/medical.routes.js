// src/routes/medical.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const { ROLES } = require('../constants/roles');
const Appointment = require('../models/appointment.model');
const Patient = require('../models/patient.model');
const Consultation = require('../models/consultation.model');
const Prescription = require('../models/prescription.model');
const User = require('../models/user.model');

/**
 * 🩺 MEDICAL STAFF ROUTES
 * Routes cho bác sĩ và nhân viên y tế
 */

router.use(authenticate);
router.use(requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN));

// 👥 Lấy danh sách bệnh nhân
router.get('/patients', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } }
      ];
    }

    const [patients, total] = await Promise.all([
      Patient.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Patient.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: patients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// 📅 Lấy lịch hẹn của bác sĩ
router.get('/appointments', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, date } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    
    // Nếu là bác sĩ, chỉ xem lịch hẹn của mình
    if (req.user.role === ROLES.DOCTOR) {
      query.doctor = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: startDate, $lte: endDate };
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('doctor', 'personalInfo.firstName personalInfo.lastName professionalInfo.specialization')
        .populate('patient', 'personalInfo.firstName personalInfo.lastName personalInfo.phone')
        .sort({ appointmentDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Appointment.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// 📊 Dashboard statistics cho bác sĩ
router.get('/dashboard/stats', async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === ROLES.DOCTOR) {
      query.doctor = req.user._id;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPatients,
      todayAppointments,
      pendingAppointments,
      completedToday,
      activePrescriptions
    ] = await Promise.all([
      Patient.countDocuments(),
      Appointment.countDocuments({
        ...query,
        appointmentDate: { $gte: today, $lt: tomorrow }
      }),
      Appointment.countDocuments({
        ...query,
        status: { $in: ['SCHEDULED', 'CONFIRMED'] }
      }),
      Appointment.countDocuments({
        ...query,
        appointmentDate: { $gte: today, $lt: tomorrow },
        status: 'COMPLETED'
      }),
      Prescription.countDocuments({
        ...query,
        status: 'ACTIVE'
      })
    ]);

    // Lấy upcoming appointments
    const upcomingAppointments = await Appointment.find({
      ...query,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['SCHEDULED', 'CONFIRMED'] }
    })
      .populate('patient', 'personalInfo.firstName personalInfo.lastName personalInfo.phone')
      .sort({ appointmentDate: 1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalPatients,
          todayAppointments,
          pendingAppointments,
          completedToday,
          activePrescriptions
        },
        upcomingAppointments
      }
    });
  } catch (error) {
    next(error);
  }
});

// 📋 Lấy thông tin chi tiết bệnh nhân
router.get('/patients/:patientId', async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // Lấy lịch sử khám
    const [appointments, prescriptions, labOrders, consultations] = await Promise.all([
      Appointment.find({ patient: patientId })
        .populate('doctor', 'personalInfo.firstName personalInfo.lastName')
        .sort({ appointmentDate: -1 })
        .limit(10),
      Prescription.find({ patient: patientId })
        .populate('doctor', 'personalInfo.firstName personalInfo.lastName')
        .populate('medications.medication')
        .sort({ createdAt: -1 })
        .limit(10),
      require('../models/labOrder.model').find({ patient: patientId })
        .populate('doctor', 'personalInfo.firstName personalInfo.lastName')
        .sort({ createdAt: -1 })
        .limit(10),
      Consultation.find({ patient: patientId })
        .populate('doctor', 'personalInfo.firstName personalInfo.lastName')
        .populate('diagnoses')
        .sort({ consultationDate: -1 })
        .limit(10)
    ]);

    res.json({
      success: true,
      data: {
        patient,
        history: {
          appointments,
          prescriptions,
          labOrders,
          consultations
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
