// src/routes/patient.routes.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { validate } = require('../middlewares/validation.middleware');
const { schemas } = require('../validations/patient.validation');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware'); // Assume this exists for file upload
const { ROLES } = require('../constants/roles');

/**
 * @swagger
 * /api/patients/register:
 *   post:
 *     summary: Đăng ký bệnh nhân mới
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - dateOfBirth
 *               - gender
 *               - phone
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Nguyễn Văn A
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               address:
 *                 type: string
 *               emergencyContact:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   relationship:
 *                     type: string
 *                   phone:
 *                     type: string
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/register', 
  authMiddleware,
  roleMiddleware([ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.registerPatient, 'body'),
  auditLog(AUDIT_ACTIONS.PATIENT_CREATE),
  patientController.registerPatient
);

/**
 * @swagger
 * /api/patients/search:
 *   get:
 *     summary: Tìm kiếm bệnh nhân
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm (tên, mã BN, SĐT)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Kết quả tìm kiếm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Patient'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/search', 
  authMiddleware,
  roleMiddleware([ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.searchPatients, 'query'),
  auditLog(AUDIT_ACTIONS.PATIENT_VIEW),
  patientController.searchPatients
);

/**
 * @swagger
 * /api/patients/advanced-search:
 *   post:
 *     summary: Tìm kiếm bệnh nhân nâng cao
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ageRange:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: integer
 *                   max:
 *                     type: integer
 *               gender:
 *                 type: string
 *               bloodType:
 *                 type: string
 *               hasInsurance:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Kết quả tìm kiếm nâng cao
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/advanced-search', 
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.advancedSearch, 'body'),
  auditLog(AUDIT_ACTIONS.PATIENT_VIEW),
  patientController.advancedSearch
);

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Lấy danh sách tất cả bệnh nhân
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách bệnh nhân
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Patient'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/', 
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN]),
  validate(schemas.getPatients, 'query'),
  auditLog(AUDIT_ACTIONS.PATIENT_VIEW),
  patientController.getPatients
);

/**
 * @swagger
 * /api/patients/{patientId}:
 *   get:
 *     summary: Lấy thông tin bệnh nhân theo ID
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bệnh nhân
 *     responses:
 *       200:
 *         description: Thông tin bệnh nhân
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Patient'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:patientId', 
  authMiddleware,
  roleMiddleware([ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  auditLog(AUDIT_ACTIONS.PATIENT_VIEW),
  patientController.getPatientById
);

/**
 * @swagger
 * /api/patients/{patientId}/sensitive:
 *   get:
 *     summary: Lấy dữ liệu nhạy cảm của bệnh nhân
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dữ liệu nhạy cảm
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/:patientId/sensitive', 
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  auditLog(AUDIT_ACTIONS.PATIENT_VIEW),
  patientController.getPatientSensitiveData
);

/**
 * @swagger
 * /api/patients/{patientId}:
 *   put:
 *     summary: Cập nhật thông tin bệnh nhân
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               emergencyContact:
 *                 type: object
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:patientId', 
  authMiddleware,
  roleMiddleware([ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  validate(schemas.updatePatient, 'body'),
  auditLog(AUDIT_ACTIONS.PATIENT_UPDATE),
  patientController.updatePatient
);

/**
 * @swagger
 * /api/patients/{patientId}:
 *   delete:
 *     summary: Xóa bệnh nhân
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.delete('/:patientId', 
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  auditLog(AUDIT_ACTIONS.PATIENT_DELETE),
  patientController.deletePatient
);

// Nhập viện
router.post('/:patientId/admit', 
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  validate(schemas.admitPatient, 'body'),
  auditLog(AUDIT_ACTIONS.PATIENT_UPDATE),
  patientController.admitPatient
);

// Xuất viện
router.post('/:patientId/discharge', 
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  validate(schemas.dischargePatient, 'body'),
  auditLog(AUDIT_ACTIONS.PATIENT_UPDATE),
  patientController.dischargePatient
);

// ===============================================
// TEMP DISABLED: Patient document handlers missing in controller
// TODO: Implement getPatientDocuments/uploadPatientDocument/deletePatientDocument in controller
// ===============================================
// // Lấy tài liệu
// router.get('/:patientId/documents', 
//   authMiddleware,
//   roleMiddleware([ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
//   validate(schemas.patientIdParams, 'params'),
//   auditLog(AUDIT_ACTIONS.PATIENT_VIEW),
//   patientController.getPatientDocuments
// );

// // Upload tài liệu
// router.post('/:patientId/documents', 
//   authMiddleware,
//   uploadMiddleware.single('file'),
//   roleMiddleware([ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
//   validate(schemas.patientIdParams, 'params'),
//   validate(schemas.uploadDocument, 'body'),
//   auditLog(AUDIT_ACTIONS.PATIENT_UPDATE),
//   patientController.uploadPatientDocument
// );

// // Xóa tài liệu
// router.delete('/:patientId/documents/:documentId', 
//   authMiddleware,
//   roleMiddleware([ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
//   validate(schemas.deleteDocument, 'params'),
//   auditLog(AUDIT_ACTIONS.PATIENT_UPDATE),
//   patientController.deletePatientDocument
// );

// Lấy bảo hiểm
router.get('/:patientId/insurance', 
  authMiddleware,
  roleMiddleware([ROLES.BILLING_STAFF, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  auditLog(AUDIT_ACTIONS.PATIENT_VIEW),
  patientController.getPatientInsurance
);

// Cập nhật bảo hiểm
router.put('/:patientId/insurance', 
  authMiddleware,
  roleMiddleware([ROLES.BILLING_STAFF, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  validate(schemas.updateInsurance, 'body'),
  auditLog(AUDIT_ACTIONS.PATIENT_UPDATE),
  patientController.updatePatientInsurance
);

// Lấy dị ứng
router.get('/:patientId/allergies', 
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  auditLog(AUDIT_ACTIONS.PATIENT_VIEW),
  patientController.getPatientAllergies
);

// Thêm dị ứng
router.post('/:patientId/allergies', 
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  validate(schemas.addAllergy, 'body'),
  auditLog(AUDIT_ACTIONS.PATIENT_UPDATE),
  patientController.addPatientAllergy
);

// Cập nhật dị ứng
router.put('/:patientId/allergies/:allergyId', 
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.allergyParams, 'params'),
  validate(schemas.updateAllergy, 'body'),
  auditLog(AUDIT_ACTIONS.PATIENT_UPDATE),
  patientController.updatePatientAllergy
);

// Xóa dị ứng
router.delete('/:patientId/allergies/:allergyId', 
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.allergyParams, 'params'),
  auditLog(AUDIT_ACTIONS.PATIENT_UPDATE),
  patientController.deletePatientAllergy
);

// Lấy tiền sử gia đình
router.get('/:patientId/family-history', 
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  auditLog(AUDIT_ACTIONS.PATIENT_VIEW),
  patientController.getPatientFamilyHistory
);

// Thêm tiền sử gia đình
router.post('/:patientId/family-history', 
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  validate(schemas.addFamilyHistory, 'body'),
  auditLog(AUDIT_ACTIONS.PATIENT_UPDATE),
  patientController.addFamilyHistory
);

// Cập nhật tiền sử gia đình
router.put('/:patientId/family-history/:historyId', 
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.familyHistoryParams, 'params'),
  validate(schemas.updateFamilyHistory, 'body'),
  auditLog(AUDIT_ACTIONS.PATIENT_UPDATE),
  patientController.updateFamilyHistory
);

// Xóa tiền sử gia đình
router.delete('/:patientId/family-history/:historyId', 
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.familyHistoryParams, 'params'),
  auditLog(AUDIT_ACTIONS.PATIENT_UPDATE),
  patientController.deleteFamilyHistory
);

// Lấy liên hệ khẩn cấp
router.get('/:patientId/emergency-contacts', 
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  auditLog(AUDIT_ACTIONS.PATIENT_VIEW),
  patientController.getEmergencyContacts
);

// Thêm liên hệ khẩn cấp
router.post('/:patientId/emergency-contacts', 
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  validate(schemas.addEmergencyContact, 'body'),
  auditLog(AUDIT_ACTIONS.PATIENT_UPDATE),
  patientController.addEmergencyContact
);

// Cập nhật liên hệ khẩn cấp
router.put('/:patientId/emergency-contacts/:contactId', 
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.emergencyContactParams, 'params'),
  validate(schemas.updateEmergencyContact, 'body'),
  auditLog(AUDIT_ACTIONS.PATIENT_UPDATE),
  patientController.updateEmergencyContact
);

// Xóa liên hệ khẩn cấp
router.delete('/:patientId/emergency-contacts/:contactId', 
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.emergencyContactParams, 'params'),
  auditLog(AUDIT_ACTIONS.PATIENT_UPDATE),
  patientController.deleteEmergencyContact
);

// Lấy consents
router.get('/:patientId/consents', 
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  auditLog(AUDIT_ACTIONS.PATIENT_VIEW),
  patientController.getPatientConsents
);

// Thêm consent
router.post('/:patientId/consents', 
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  validate(schemas.addConsent, 'body'),
  auditLog(AUDIT_ACTIONS.PATIENT_UPDATE),
  patientController.addPatientConsent
);

// Export PDF
router.get('/:patientId/export-pdf', 
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  auditLog(AUDIT_ACTIONS.DATA_EXPORT),
  patientController.exportPatientRecordPDF
);

// Tạo QR code
router.get('/:patientId/qrcode', 
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  auditLog(AUDIT_ACTIONS.DATA_EXPORT),
  patientController.generatePatientQRCode
);

// Lấy access logs
router.get('/:patientId/access-logs', 
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  auditLog(AUDIT_ACTIONS.SYSTEM_VIEW_AUDIT_LOG),
  patientController.getPatientAccessLogs
);

// Lấy stats chung
router.get('/stats', 
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN]),
  patientController.getPatientStats
);

// Lấy thống kê bệnh nhân
router.get('/:patientId/statistics', 
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  patientController.getPatientStatistics
);

// Lấy lịch hẹn
router.get('/:patientId/appointments', 
  authMiddleware,
  roleMiddleware([ROLES.PATIENT, ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  validate(schemas.getLinkedData, 'query'),
  patientController.getPatientAppointments
);

// Lấy hồ sơ y tế
router.get('/:patientId/medical-records', 
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  validate(schemas.getLinkedData, 'query'),
  patientController.getPatientMedicalRecords
);

// Lấy đơn thuốc
router.get('/:patientId/prescriptions', 
  authMiddleware,
  roleMiddleware([ROLES.PATIENT, ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  validate(schemas.getLinkedData, 'query'),
  patientController.getPatientPrescriptions
);

// Lấy hóa đơn
router.get('/:patientId/bills', 
  authMiddleware,
  roleMiddleware([ROLES.PATIENT, ROLES.BILLING_STAFF, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  validate(schemas.getLinkedData, 'query'),
  patientController.getPatientBills
);

// ===============================================
// TẠM THỜI COMMENT ĐOẠN NÀY ĐỂ SERVER KHÔNG CRASH
// Lý do: patientController.getPatientLabResults chưa được định nghĩa/export
// Sau này implement xong thì bỏ comment
// ===============================================
/*
router.get('/:patientId/lab-results', 
  authMiddleware,
  roleMiddleware([ROLES.PATIENT, ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.patientIdParams, 'params'),
  validate(schemas.getLinkedData, 'query'),
  patientController.getPatientLabResults
);
*/

module.exports = router;