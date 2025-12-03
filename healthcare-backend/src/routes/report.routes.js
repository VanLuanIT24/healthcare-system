const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');

// All report routes require authentication and admin/doctor role
router.use(authenticate);
router.use(requireRole('SUPER_ADMIN', 'ADMIN', 'DOCTOR'));

// Clinical reports
router.get('/clinical', ReportController.getClinicalReport);

// Financial reports
router.get('/financial', ReportController.getFinancialReport);

// Pharmacy reports
router.get('/pharmacy', ReportController.getPharmacyReport);

// HR reports
router.get('/hr', ReportController.getHRReport);

module.exports = router;
