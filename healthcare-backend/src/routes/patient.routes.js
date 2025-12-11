// src/routes/patient.routes.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const patientValidation = require('../validations/patient.validation');
const { validateBody, validateQuery } = require('../middlewares/validation.middleware');
const { 
  requireRole, 
  requirePermission, 
  requirePatientDataAccess 
} = require('../middlewares/rbac.middleware');
const { ROLES, PERMISSIONS } = require('../constants/roles');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

// 🎯 QUAN TRỌNG: Debug middleware đầu tiên để kiểm tra body
router.use((req, res, next) => {
  console.log('🔍 [PATIENT ROUTE - FIRST MIDDLEWARE]', {
    method: req.method,
    url: req.url,
    contentType: req.headers['content-type'],
    hasBody: !!req.body,
    body: req.body,
    bodyKeys: req.body ? Object.keys(req.body) : 'NO BODY'
  });
  next();
});

router.use(authenticate);

// 1. ĐĂNG KÝ BỆNH NHÂN - THÊM DEBUG TRƯỚC VALIDATION
router.post(
  '/register',
  // 🎯 DEBUG CHI TIẾT TRƯỚC KHI VALIDATION
  (req, res, next) => {
    console.log('🔍 [REGISTER - DEEP DEBUG]', {
      bodyExists: !!req.body,
      bodyType: typeof req.body,
      bodyKeys: req.body ? Object.keys(req.body) : 'NO BODY',
      bodySample: req.body ? {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        hasAddress: !!req.body.address,
        addressType: req.body.address ? typeof req.body.address : 'NO ADDRESS'
      } : 'NO BODY',
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      user: req.user ? {
        id: req.user._id,
        role: req.user.role,
        email: req.user.email
      } : 'No user'
    });
    next();
  },
  validateBody(patientValidation.registerPatient),
  requireRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD, ROLES.RECEPTIONIST),
  requirePermission(PERMISSIONS['AUTH.REGISTER_PATIENT']),
  patientController.registerPatient
);


// 2. TÌM KIẾM BỆNH NHÂN - Phải đặt trước /:patientId
router.get(
  '/search',
  validateQuery(patientValidation.searchPatients),
  requireRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.BILLING_STAFF),
  requirePermission(PERMISSIONS['PATIENT.VIEW']),
  patientController.searchPatients
);

// 2.1. LẤY DANH SÁCH TẤT CẢ BỆNH NHÂN
router.get(
  '/',
  validateQuery(patientValidation.searchPatients),
  requireRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.BILLING_STAFF),
  requirePermission(PERMISSIONS['PATIENT.VIEW']),
  patientController.getAllPatients
);

// 2.2. LẤY THỐNG KÊ BỆNH NHÂN
router.get(
  '/stats',
  requireRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS['PATIENT.VIEW']),
  patientController.getPatientStats
);

// 2.5. LẤY BỆNH NHÂN THEO ID (FULL DATA) - Đặt sau /search
router.get('/:patientId',
  requireRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.PATIENT),
  patientController.getPatientById
);

// 3. THÔNG TIN NHÂN KHẨU
router.get('/:patientId/demographics',
  requireRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.PATIENT),
  requirePatientDataAccess('patientId'),
  patientController.getPatientDemographics
);

router.put('/:patientId/demographics',
  validateBody(patientValidation.updateDemographics),
  requireRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD, ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS['PATIENT.UPDATE']),
  requirePatientDataAccess('patientId'),
  patientController.updatePatientDemographics
);

// 4. NHẬP/XUẤT VIỆN
router.post('/:patientId/admit',
  validateBody(patientValidation.admitPatient),
  requireRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD, ROLES.DOCTOR),
  requirePermission(PERMISSIONS['PATIENT.ADMIT']),
  requirePatientDataAccess('patientId'),
  patientController.admitPatient
);

router.post('/:patientId/discharge',
  validateBody(patientValidation.dischargePatient),
  requireRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD, ROLES.DOCTOR),
  requirePermission(PERMISSIONS['PATIENT.DISCHARGE']),
  requirePatientDataAccess('patientId'),
  patientController.dischargePatient
);

// 5. BẢO HIỂM
router.get('/:patientId/insurance',
  requireRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.BILLING_STAFF),
  requirePermission(PERMISSIONS['PATIENT.VIEW_SENSITIVE']),
  requirePatientDataAccess('patientId'),
  patientController.getPatientInsurance
);

router.put('/:patientId/insurance',
  validateBody(patientValidation.updateInsurance),
  requireRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.BILLING_STAFF),
  requirePermission(PERMISSIONS['PATIENT.UPDATE']),
  requirePatientDataAccess('patientId'),
  patientController.updatePatientInsurance
);

// 6. LIÊN HỆ - PAT-7
router.get('/:patientId/contacts',
  requireRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD, ROLES.DOCTOR, ROLES.NURSE),
  requirePatientDataAccess('patientId'),
  patientController.getPatientContacts
);

// 7. DỊ ỨNG & TIỀN SỬ
router.get('/:patientId/allergies',
  requireRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT),
  requirePatientDataAccess('patientId'),
  validateQuery(patientValidation.getAllergies),
  patientController.getPatientAllergies
);

router.put('/:patientId/allergies',
  validateBody(patientValidation.updateAllergies),
  requireRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD, ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS['MEDICAL.UPDATE_RECORDS']),
  requirePatientDataAccess('patientId'),
  patientController.updatePatientAllergies
);

router.get('/:patientId/family-history',
  requireRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD, ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS['MEDICAL.VIEW_RECORDS']),
  requirePatientDataAccess('patientId'),
  patientController.getPatientFamilyHistory
);

router.put('/:patientId/family-history',
  validateBody(patientValidation.updateFamilyHistory),
  requireRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD, ROLES.DOCTOR),
  requirePermission(PERMISSIONS['MEDICAL.UPDATE_RECORDS']),
  requirePatientDataAccess('patientId'),
  patientController.updatePatientFamilyHistory
);

module.exports = router;