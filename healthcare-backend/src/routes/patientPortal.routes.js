// src/routes/patientPortal.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const { ROLES } = require('../constants/roles');
const Appointment = require('../models/appointment.model');
const Prescription = require('../models/prescription.model');
const LabOrder = require('../models/labOrder.model');
const MedicalRecord = require('../models/medicalRecord.model');
const Consultation = require('../models/consultation.model');
const Diagnosis = require('../models/diagnosis.model');

/**
 * 🏥 PATIENT PORTAL ROUTES
 * Routes cho bệnh nhân xem thông tin cá nhân
 */

router.use(authenticate);
router.use(requireRole(ROLES.PATIENT));

// 📅 Lấy danh sách lịch hẹn của bệnh nhân
router.get('/appointments', async (req, res, next) => {
  try {
    const patientId = req.user.patientId;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID not found in user profile'
      });
    }

    const appointments = await Appointment.find({ patient: patientId })
      .populate('doctor', 'personalInfo.firstName personalInfo.lastName professionalInfo.specialization')
      .populate('patient', 'personalInfo.firstName personalInfo.lastName')
      .sort({ appointmentDate: -1 })
      .limit(50);

    res.json({
      success: true,
      data: appointments,
      total: appointments.length
    });
  } catch (error) {
    next(error);
  }
});

// 💊 Lấy danh sách đơn thuốc
router.get('/prescriptions', async (req, res, next) => {
  try {
    const patientId = req.user.patientId;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID not found in user profile'
      });
    }

    const prescriptions = await Prescription.find({ patient: patientId })
      .populate('doctor', 'personalInfo.firstName personalInfo.lastName')
      .populate('patient', 'personalInfo.firstName personalInfo.lastName')
      .populate('medications.medication')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: prescriptions,
      total: prescriptions.length
    });
  } catch (error) {
    next(error);
  }
});

// 🔬 Lấy kết quả xét nghiệm
router.get('/lab-results', async (req, res, next) => {
  try {
    const patientId = req.user.patientId;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID not found in user profile'
      });
    }

    const labResults = await LabOrder.find({ patient: patientId })
      .populate('doctor', 'personalInfo.firstName personalInfo.lastName')
      .populate('patient', 'personalInfo.firstName personalInfo.lastName')
      .populate('tests')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: labResults,
      total: labResults.length
    });
  } catch (error) {
    next(error);
  }
});

// 📋 Lấy lịch sử khám bệnh
router.get('/medical-history', async (req, res, next) => {
  try {
    const patientId = req.user.patientId;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID not found in user profile'
      });
    }

    // Lấy medical records
    const medicalRecords = await MedicalRecord.find({ patient: patientId })
      .populate('doctor', 'personalInfo.firstName personalInfo.lastName')
      .sort({ createdAt: -1 })
      .limit(20);

    // Lấy consultations
    const consultations = await Consultation.find({ patient: patientId })
      .populate('doctor', 'personalInfo.firstName personalInfo.lastName')
      .populate('diagnoses')
      .sort({ consultationDate: -1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        medicalRecords,
        consultations,
        total: medicalRecords.length + consultations.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// 📊 Lấy dashboard statistics
router.get('/stats', async (req, res, next) => {
  try {
    const patientId = req.user.patientId;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID not found in user profile'
      });
    }

    const [appointmentsCount, prescriptionsCount, labResultsCount, recordsCount] = await Promise.all([
      Appointment.countDocuments({ patient: patientId }),
      Prescription.countDocuments({ patient: patientId }),
      LabOrder.countDocuments({ patient: patientId }),
      MedicalRecord.countDocuments({ patient: patientId })
    ]);

    // Lấy upcoming appointments
    const upcomingAppointments = await Appointment.find({
      patient: patientId,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['SCHEDULED', 'CONFIRMED'] }
    })
      .populate('doctor', 'personalInfo.firstName personalInfo.lastName')
      .sort({ appointmentDate: 1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalAppointments: appointmentsCount,
          totalPrescriptions: prescriptionsCount,
          totalLabResults: labResultsCount,
          totalRecords: recordsCount
        },
        upcomingAppointments
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
