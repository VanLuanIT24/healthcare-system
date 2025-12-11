// src/routes/report.extended.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');

/**
 * 📊 REPORT EXTENDED ROUTES
 * Các endpoints bổ sung cho advanced reporting
 */

router.use(authenticate);
router.use(requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'));

/**
 * Financial Reports
 */
// GET /api/reports/financial/by-department
router.get('/reports/financial/by-department', async (req, res) => {
  try {
    const Bill = require('../models/bill.model');
    const { startDate, endDate } = req.query;

    const matchQuery = { status: 'PAID' };
    if (startDate || endDate) {
      matchQuery.paidAt = {};
      if (startDate) matchQuery.paidAt.$gte = new Date(startDate);
      if (endDate) matchQuery.paidAt.$lte = new Date(endDate);
    }

    const departmentRevenue = await Bill.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$department',
          totalRevenue: { $sum: '$totalAmount' },
          totalBills: { $sum: 1 },
          averageBill: { $avg: '$totalAmount' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({
      success: true,
      data: departmentRevenue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/reports/financial/by-payment-method
router.get('/reports/financial/by-payment-method', async (req, res) => {
  try {
    const Bill = require('../models/bill.model');
    const { startDate, endDate } = req.query;

    const matchQuery = { status: 'PAID' };
    if (startDate || endDate) {
      matchQuery.paidAt = {};
      if (startDate) matchQuery.paidAt.$gte = new Date(startDate);
      if (endDate) matchQuery.paidAt.$lte = new Date(endDate);
    }

    const paymentMethodStats = await Bill.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$paymentMethod',
          totalRevenue: { $sum: '$totalAmount' },
          totalBills: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({
      success: true,
      data: paymentMethodStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/reports/financial/export/pdf
router.get('/reports/financial/export/pdf', async (req, res) => {
  try {
    // Mock PDF export
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-report.pdf');
    res.send(Buffer.from('PDF placeholder'));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/reports/financial/export/excel
router.get('/reports/financial/export/excel', async (req, res) => {
  try {
    // Mock Excel export
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-report.xlsx');
    res.send(Buffer.from('Excel placeholder'));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Pharmacy Reports
 */
// GET /api/reports/pharmacy/medication-usage
router.get('/reports/pharmacy/medication-usage', async (req, res) => {
  try {
    const Prescription = require('../models/prescription.model');
    const { startDate, endDate } = req.query;

    const matchQuery = {};
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const medicationUsage = await Prescription.aggregate([
      { $match: matchQuery },
      { $unwind: '$medications' },
      {
        $group: {
          _id: '$medications.medication',
          totalQuantity: { $sum: '$medications.quantity' },
          totalPrescriptions: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'medications',
          localField: '_id',
          foreignField: '_id',
          as: 'medicationDetails'
        }
      },
      { $unwind: '$medicationDetails' },
      {
        $project: {
          medicationName: '$medicationDetails.name',
          totalQuantity: 1,
          totalPrescriptions: 1
        }
      },
      { $sort: { totalQuantity: -1 } }
    ]);

    res.json({
      success: true,
      data: medicationUsage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/reports/pharmacy/inventory
router.get('/reports/pharmacy/inventory', async (req, res) => {
  try {
    const Medication = require('../models/medication.model');
    
    const inventory = await Medication.find({ status: 'ACTIVE' })
      .select('name category currentStock minStockLevel price status')
      .sort({ currentStock: 1 });

    const stats = {
      totalMedications: inventory.length,
      lowStock: inventory.filter(m => m.currentStock <= m.minStockLevel).length,
      totalValue: inventory.reduce((sum, m) => sum + (m.currentStock * m.price), 0)
    };

    res.json({
      success: true,
      data: {
        inventory,
        stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/reports/pharmacy/export/pdf
router.get('/reports/pharmacy/export/pdf', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=pharmacy-report.pdf');
    res.send(Buffer.from('PDF placeholder'));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/reports/pharmacy/export/excel
router.get('/reports/pharmacy/export/excel', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=pharmacy-report.xlsx');
    res.send(Buffer.from('Excel placeholder'));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Clinical Reports
 */
// GET /api/reports/clinical/disease-statistics
router.get('/reports/clinical/disease-statistics', async (req, res) => {
  try {
    const Diagnosis = require('../models/diagnosis.model');
    const { startDate, endDate } = req.query;

    const matchQuery = {};
    if (startDate || endDate) {
      matchQuery.diagnosedAt = {};
      if (startDate) matchQuery.diagnosedAt.$gte = new Date(startDate);
      if (endDate) matchQuery.diagnosedAt.$lte = new Date(endDate);
    }

    const diseaseStats = await Diagnosis.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$icd10Code',
          count: { $sum: 1 },
          description: { $first: '$description' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      success: true,
      data: diseaseStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/reports/clinical/treatment-outcomes
router.get('/reports/clinical/treatment-outcomes', async (req, res) => {
  try {
    const MedicalRecord = require('../models/medicalRecord.model');
    const { startDate, endDate } = req.query;

    const matchQuery = {};
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const outcomes = await MedicalRecord.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$outcome',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: outcomes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/reports/clinical/export/pdf
router.get('/reports/clinical/export/pdf', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=clinical-report.pdf');
    res.send(Buffer.from('PDF placeholder'));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/reports/clinical/export/excel
router.get('/reports/clinical/export/excel', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=clinical-report.xlsx');
    res.send(Buffer.from('Excel placeholder'));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * HR Reports
 */
// GET /api/reports/hr/staff-performance
router.get('/reports/hr/staff-performance', async (req, res) => {
  try {
    const User = require('../models/user.model');
    const Appointment = require('../models/appointment.model');
    const { startDate, endDate } = req.query;

    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.appointmentDate = {};
      if (startDate) dateQuery.appointmentDate.$gte = new Date(startDate);
      if (endDate) dateQuery.appointmentDate.$lte = new Date(endDate);
    }

    const staffPerformance = await Appointment.aggregate([
      { $match: { ...dateQuery, status: 'COMPLETED' } },
      {
        $group: {
          _id: '$doctor',
          totalAppointments: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'doctorDetails'
        }
      },
      { $unwind: '$doctorDetails' },
      {
        $project: {
          doctorName: {
            $concat: ['$doctorDetails.firstName', ' ', '$doctorDetails.lastName']
          },
          totalAppointments: 1,
          specialization: '$doctorDetails.specialization'
        }
      },
      { $sort: { totalAppointments: -1 } }
    ]);

    res.json({
      success: true,
      data: staffPerformance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/reports/hr/attendance
router.get('/reports/hr/attendance', async (req, res) => {
  try {
    // Mock attendance data
    res.json({
      success: true,
      data: {
        message: 'Attendance tracking not yet implemented',
        attendance: []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/reports/hr/export/pdf
router.get('/reports/hr/export/pdf', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=hr-report.pdf');
    res.send(Buffer.from('PDF placeholder'));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/reports/hr/export/excel
router.get('/reports/hr/export/excel', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=hr-report.xlsx');
    res.send(Buffer.from('Excel placeholder'));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Custom Report Builder
 */
// GET /api/reports/templates
router.get('/reports/templates', async (req, res) => {
  try {
    // Mock templates
    const templates = [
      {
        id: '1',
        name: 'Monthly Revenue Report',
        type: 'FINANCIAL',
        description: 'Monthly revenue breakdown by department'
      },
      {
        id: '2',
        name: 'Patient Demographics',
        type: 'CLINICAL',
        description: 'Patient distribution by age, gender, location'
      }
    ];

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/reports/custom
router.post('/reports/custom', async (req, res) => {
  try {
    const customReport = {
      id: Date.now().toString(),
      ...req.body,
      createdBy: req.user._id,
      createdAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Custom report created successfully',
      data: customReport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/reports/custom/:reportId
router.get('/reports/custom/:reportId', async (req, res) => {
  try {
    // Mock custom report retrieval
    res.json({
      success: true,
      data: {
        id: req.params.reportId,
        name: 'Custom Report',
        config: {}
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/reports/custom/:reportId/execute
router.post('/reports/custom/:reportId/execute', async (req, res) => {
  try {
    // Mock report execution
    res.json({
      success: true,
      data: {
        reportId: req.params.reportId,
        executedAt: new Date(),
        results: []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/reports/templates
router.post('/reports/templates', async (req, res) => {
  try {
    const template = {
      id: Date.now().toString(),
      ...req.body,
      createdBy: req.user._id,
      createdAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Report template saved successfully',
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/reports/templates/:templateId
router.put('/reports/templates/:templateId', async (req, res) => {
  try {
    const template = {
      id: req.params.templateId,
      ...req.body,
      updatedAt: new Date()
    };

    res.json({
      success: true,
      message: 'Report template updated successfully',
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/reports/templates/:templateId
router.delete('/reports/templates/:templateId', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Report template deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
