/**
 * MEDICATION ROUTES
 * Định tuyến API cho quản lý thuốc
 */

const express = require('express');
const router = express.Router();

const MedicationController = require('../controllers/medication.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validateQuery, validateBody, validateParams } = require('../middlewares/validation.middleware');
const { requireRole, requirePermission } = require('../middlewares/rbac.middleware');
const medicationValidation = require('../validations/medication.validation');

/**
 * 🔒 TẤT CẢ ROUTES YÊU CẦU AUTHENTICATION
 */
router.use(authenticate);

/**
 * GET /api/medications/stats
 * Lấy thống kê kho thuốc
 * Quyền: ADMIN, DOCTOR, PHARMACIST
 */
router.get(
  '/stats',
  requireRole(['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'PHARMACIST']),
  MedicationController.getMedicationStats
);

/**
 * GET /api/medications/low-stock
 * Lấy danh sách thuốc sắp hết
 * Quyền: ADMIN, PHARMACIST
 */
router.get(
  '/low-stock',
  requireRole(['SUPER_ADMIN', 'ADMIN', 'PHARMACIST']),
  validateQuery(medicationValidation.getLowStock),
  MedicationController.getLowStockMedications
);

/**
 * GET /api/medications/search
 * Tìm kiếm thuốc (autocomplete)
 * Quyền: ADMIN, DOCTOR, NURSE, PHARMACIST
 */
router.get(
  '/search',
  requireRole(['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'PHARMACIST']),
  validateQuery(medicationValidation.searchMedications),
  MedicationController.searchMedications
);

/**
 * GET /api/medications
 * Lấy danh sách thuốc với phân trang và lọc
 * Quyền: ADMIN, DOCTOR, NURSE, PHARMACIST
 */
router.get(
  '/',
  requireRole(['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'PHARMACIST']),
  validateQuery(medicationValidation.getMedications),
  MedicationController.getMedications
);

/**
 * GET /api/medications/:id
 * Lấy thông tin chi tiết thuốc
 * Quyền: ADMIN, DOCTOR, NURSE, PHARMACIST
 */
router.get(
  '/:id',
  requireRole(['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'PHARMACIST']),
  validateParams(medicationValidation.medicationId),
  MedicationController.getMedicationById
);

/**
 * POST /api/medications
 * Tạo thuốc mới
 * Quyền: ADMIN, PHARMACIST
 */
router.post(
  '/',
  requireRole(['SUPER_ADMIN', 'ADMIN', 'PHARMACIST']),
  validateBody(medicationValidation.createMedication),
  MedicationController.createMedication
);

/**
 * PUT /api/medications/:id
 * Cập nhật thông tin thuốc
 * Quyền: ADMIN, PHARMACIST
 */
router.put(
  '/:id',
  requireRole(['SUPER_ADMIN', 'ADMIN', 'PHARMACIST']),
  validateParams(medicationValidation.medicationId),
  validateBody(medicationValidation.updateMedication),
  MedicationController.updateMedication
);

/**
 * POST /api/medications/:id/stock
 * Cập nhật tồn kho (nhập/xuất)
 * Quyền: ADMIN, PHARMACIST
 */
router.post(
  '/:id/stock',
  requireRole(['SUPER_ADMIN', 'ADMIN', 'PHARMACIST']),
  validateParams(medicationValidation.medicationId),
  validateBody(medicationValidation.updateStock),
  MedicationController.updateStock
);

/**
 * DELETE /api/medications/:id
 * Xóa thuốc (soft delete)
 * Quyền: ADMIN only
 */
router.delete(
  '/:id',
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  validateParams(medicationValidation.medicationId),
  MedicationController.deleteMedication
);

module.exports = router;
