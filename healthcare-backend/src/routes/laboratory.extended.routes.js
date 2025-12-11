// src/routes/laboratory.extended.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');

/**
 * 🔬 LABORATORY EXTENDED ROUTES
 * Các endpoints bổ sung cho laboratory management
 */

router.use(authenticate);

/**
 * Lab Tests Catalog
 */
// GET /api/lab/tests - Danh sách test có sẵn
router.get('/lab/tests',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN'),
  async (req, res) => {
    try {
      const LabTest = require('../models/labTest.model');
      const { page = 1, limit = 20, category, search } = req.query;

      const query = {};
      if (category) query.category = category;
      if (search) {
        query.$or = [
          { name: new RegExp(search, 'i') },
          { code: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') }
        ];
      }

      const tests = await LabTest.find(query)
        .sort({ name: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await LabTest.countDocuments(query);

      res.json({
        success: true,
        data: {
          tests,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// GET /api/lab/tests/:id - Chi tiết test
router.get('/lab/tests/:id',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN'),
  async (req, res) => {
    try {
      const LabTest = require('../models/labTest.model');
      const test = await LabTest.findById(req.params.id);

      if (!test) {
        return res.status(404).json({
          success: false,
          message: 'Lab test not found'
        });
      }

      res.json({
        success: true,
        data: test
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// GET /api/lab/tests/search - Tìm kiếm test
router.get('/lab/tests/search',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN'),
  async (req, res) => {
    try {
      const LabTest = require('../models/labTest.model');
      const { q, limit = 10 } = req.query;

      if (!q) {
        return res.json({
          success: true,
          data: []
        });
      }

      const tests = await LabTest.find({
        $or: [
          { name: new RegExp(q, 'i') },
          { code: new RegExp(q, 'i') },
          { description: new RegExp(q, 'i') }
        ]
      })
        .select('name code category price')
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: tests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * Lab Statistics
 */
// GET /api/lab/stats - Thống kê lab
router.get('/lab/stats',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'LAB_TECHNICIAN'),
  async (req, res) => {
    try {
      const LabOrder = require('../models/labOrder.model');
      const { startDate, endDate } = req.query;

      const dateQuery = {};
      if (startDate || endDate) {
        dateQuery.createdAt = {};
        if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
        if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
      }

      const [
        totalOrders,
        pendingCollection,
        inProgress,
        completed,
        cancelled
      ] = await Promise.all([
        LabOrder.countDocuments(dateQuery),
        LabOrder.countDocuments({ ...dateQuery, status: 'PENDING' }),
        LabOrder.countDocuments({ ...dateQuery, status: 'IN_PROGRESS' }),
        LabOrder.countDocuments({ ...dateQuery, status: 'COMPLETED' }),
        LabOrder.countDocuments({ ...dateQuery, status: 'CANCELLED' })
      ]);

      res.json({
        success: true,
        data: {
          totalOrders,
          pendingCollection,
          inProgress,
          completed,
          cancelled
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * Pending Collections
 */
// GET /api/lab/orders/pending-collection
router.get('/lab/orders/pending-collection',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'LAB_TECHNICIAN', 'NURSE'),
  async (req, res) => {
    try {
      const LabOrder = require('../models/labOrder.model');
      
      const orders = await LabOrder.find({
        status: 'PENDING',
        'tests.status': 'PENDING'
      })
        .populate('patient', 'firstName lastName dateOfBirth')
        .populate('orderedBy', 'firstName lastName')
        .sort({ createdAt: 1 });

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * In Progress Tests
 */
// GET /api/lab/orders/in-progress
router.get('/lab/orders/in-progress',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'LAB_TECHNICIAN'),
  async (req, res) => {
    try {
      const LabOrder = require('../models/labOrder.model');
      
      const orders = await LabOrder.find({
        status: 'IN_PROGRESS',
        'tests.status': 'IN_PROGRESS'
      })
        .populate('patient', 'firstName lastName dateOfBirth')
        .populate('orderedBy', 'firstName lastName')
        .sort({ createdAt: 1 });

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * Awaiting Review
 */
// GET /api/lab/results/awaiting-review
router.get('/lab/results/awaiting-review',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'LAB_TECHNICIAN', 'DOCTOR'),
  async (req, res) => {
    try {
      const LabOrder = require('../models/labOrder.model');
      
      const orders = await LabOrder.find({
        'tests.status': 'COMPLETED',
        'tests.reviewedBy': { $exists: false }
      })
        .populate('patient', 'firstName lastName dateOfBirth')
        .populate('orderedBy', 'firstName lastName')
        .sort({ 'tests.completedAt': 1 });

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * Specimen Tracking
 */
// PATCH /api/lab/orders/:orderId/specimen-status
router.patch('/lab/orders/:orderId/specimen-status',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'LAB_TECHNICIAN', 'NURSE'),
  async (req, res) => {
    try {
      const LabOrder = require('../models/labOrder.model');
      const { status } = req.body;

      const order = await LabOrder.findById(req.params.orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Lab order not found'
        });
      }

      order.specimenStatus = status;
      order.specimenUpdatedAt = new Date();
      order.specimenUpdatedBy = req.user._id;

      await order.save();

      res.json({
        success: true,
        message: 'Specimen status updated successfully',
        data: order
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

module.exports = router;
