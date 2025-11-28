const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patient.controller");
const patientValidation = require("../validations/patient.validation");
const {
  validateBody,
  validateParams,
  validateQuery,
} = require("../middlewares/validation.middleware");
const {
  requireRole,
  requirePermission,
  requirePatientDataAccess,
  requireModuleAccess,
} = require("../middlewares/rbac.middleware");
const { ROLES, PERMISSIONS } = require("../constants/roles");
const { authenticate } = require("../middlewares/auth.middleware");

/**
 * 🏥 PATIENT ROUTES
 * Quản lý tất cả endpoints liên quan đến bệnh nhân
 */

// 🎯 APPLY AUTH MIDDLEWARE CHO TẤT CẢ ROUTES
router.use(authenticate);

// 🎯 ĐĂNG KÝ BỆNH NHÂN
router.post(
  "/register",
  requireRole(ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.PATIENT_CREATE),
  validateBody(patientValidation.registerPatient),
  patientController.registerPatient
);

// 🎯 TÌM KIẾM BỆNH NHÂN
router.get(
  "/search",
  requireRole(
    ROLES.RECEPTIONIST,
    ROLES.DOCTOR,
    ROLES.NURSE,
    ROLES.HOSPITAL_ADMIN,
    ROLES.DEPARTMENT_HEAD,
    ROLES.PHARMACIST,
    ROLES.LAB_TECHNICIAN
  ),
  requirePermission(PERMISSIONS.PATIENT_VIEW),
  validateQuery(patientValidation.searchPatients),
  patientController.searchPatients
);

// 🎯 LẤY THÔNG TIN NHÂN KHẨU
router.get(
  "/:patientId/demographics",
  requireRole(
    ROLES.DOCTOR,
    ROLES.NURSE,
    ROLES.HOSPITAL_ADMIN,
    ROLES.DEPARTMENT_HEAD,
    ROLES.PATIENT
  ),
  requirePatientDataAccess("patientId"),
  patientController.getPatientDemographics
);

// 🎯 CẬP NHẬT THÔNG TIN NHÂN KHẨU
router.put(
  "/:patientId/demographics",
  requireRole(
    ROLES.DOCTOR,
    ROLES.NURSE,
    ROLES.HOSPITAL_ADMIN,
    ROLES.DEPARTMENT_HEAD
  ),
  requirePermission(PERMISSIONS.PATIENT_UPDATE),
  requirePatientDataAccess("patientId"),
  validateBody(patientValidation.updateDemographics),
  patientController.updatePatientDemographics
);

// 🎯 NHẬP VIỆN
router.post(
  "/:patientId/admit",
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.PATIENT_ADMIT),
  validateBody(patientValidation.admitPatient),
  patientController.admitPatient
);

// 🎯 XUẤT VIỆN
router.post(
  "/:patientId/discharge",
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.PATIENT_DISCHARGE),
  validateBody(patientValidation.dischargePatient),
  patientController.dischargePatient
);

// 🎯 THÔNG TIN BẢO HIỂM
router.get(
  "/:patientId/insurance",
  requireRole(
    ROLES.RECEPTIONIST,
    ROLES.BILLING_STAFF,
    ROLES.HOSPITAL_ADMIN,
    ROLES.DEPARTMENT_HEAD
  ),
  requirePermission(PERMISSIONS.PATIENT_VIEW),
  requirePatientDataAccess("patientId"),
  patientController.getPatientInsurance
);

// 🎯 CẬP NHẬT BẢO HIỂM
router.put(
  "/:patientId/insurance",
  requireRole(ROLES.RECEPTIONIST, ROLES.BILLING_STAFF, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.PATIENT_UPDATE),
  validateBody(patientValidation.updateInsurance),
  patientController.updatePatientInsurance
);

module.exports = router;
