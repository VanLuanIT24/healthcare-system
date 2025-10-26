const patientService = require('../services/patient.service');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

/**
 * 🏥 PATIENT CONTROLLER - QUẢN LÝ BỆNH NHÂN
 * Core business logic cho healthcare system
 */

class PatientController {
  
  /**
   * 🎯 ĐĂNG KÝ BỆNH NHÂN MỚI
   */
  async registerPatient(req, res, next) {
    try {
      console.log('👤 [PATIENT] Registering new patient:', req.body.email);
      
      const patientData = {
        ...req.body,
        createdBy: req.user._id
      };

      const patient = await patientService.registerPatient(patientData);
      
      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.PATIENT_CREATE, {
        resource: 'Patient',
        resourceId: patient._id,
        metadata: { patientId: patient.patientId }
      })(req, res, () => {});

      res.status(201).json({
        success: true,
        message: 'Đăng ký bệnh nhân thành công',
        data: patient
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 TÌM KIẾM BỆNH NHÂN
   */
  async searchPatients(req, res, next) {
    try {
      const { 
        keyword, 
        page = 1, 
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      console.log('🔍 [PATIENT] Searching patients:', { keyword, page, limit });

      const result = await patientService.searchPatients({
        keyword,
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder
      });

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.PATIENT_VIEW, {
        resource: 'Patient',
        category: 'SEARCH'
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Tìm kiếm bệnh nhân thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN NHÂN KHẨU BỆNH NHÂN
   */
  async getPatientDemographics(req, res, next) {
    try {
      const { patientId } = req.params;
      
      console.log('📋 [PATIENT] Getting demographics for:', patientId);

      const demographics = await patientService.getPatientDemographics(patientId);

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.PATIENT_VIEW, {
        resource: 'Patient',
        resourceId: patientId,
        category: 'DEMOGRAPHICS'
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Lấy thông tin bệnh nhân thành công',
        data: demographics
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 CẬP NHẬT THÔNG TIN NHÂN KHẨU
   */
  async updatePatientDemographics(req, res, next) {
    try {
      const { patientId } = req.params;
      const updateData = req.body;
      
      console.log('✏️ [PATIENT] Updating demographics for:', patientId);

      const updatedPatient = await patientService.updatePatientDemographics(
        patientId, 
        updateData,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.PATIENT_UPDATE, {
        resource: 'Patient',
        resourceId: patientId,
        category: 'DEMOGRAPHICS',
        metadata: { updatedFields: Object.keys(updateData) }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Cập nhật thông tin bệnh nhân thành công',
        data: updatedPatient
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 NHẬP VIỆN BỆNH NHÂN
   */
  async admitPatient(req, res, next) {
    try {
      const { patientId } = req.params;
      const admissionData = req.body;
      
      console.log('🏥 [PATIENT] Admitting patient:', patientId);

      const admission = await patientService.admitPatient(
        patientId, 
        admissionData,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.PATIENT_UPDATE, {
        resource: 'Patient',
        resourceId: patientId,
        category: 'ADMISSION',
        metadata: { 
          department: admissionData.department,
          room: admissionData.room 
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Nhập viện bệnh nhân thành công',
        data: admission
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 XUẤT VIỆN BỆNH NHÂN
   */
  async dischargePatient(req, res, next) {
    try {
      const { patientId } = req.params;
      const dischargeData = req.body;
      
      console.log('🎉 [PATIENT] Discharging patient:', patientId);

      const discharge = await patientService.dischargePatient(
        patientId, 
        dischargeData,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.PATIENT_UPDATE, {
        resource: 'Patient',
        resourceId: patientId,
        category: 'DISCHARGE',
        metadata: { 
          dischargeReason: dischargeData.dischargeReason,
          condition: dischargeData.condition 
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Xuất viện bệnh nhân thành công',
        data: discharge
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN BẢO HIỂM
   */
  async getPatientInsurance(req, res, next) {
    try {
      const { patientId } = req.params;
      
      console.log ('🏦 [PATIENT] Getting insurance for:', patientId);

      const insurance = await patientService.getPatientInsurance(patientId);

      // 🎯 AUDIT LOG - Insurance data is sensitive
      await auditLog(AUDIT_ACTIONS.PATIENT_VIEW, {
        resource: 'Patient',
        resourceId: patientId,
        category: 'INSURANCE'
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Lấy thông tin bảo hiểm thành công',
        data: insurance
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 CẬP NHẬT THÔNG TIN BẢO HIỂM
   */
  async updatePatientInsurance(req, res, next) {
    try {
      const { patientId } = req.params;
      const insuranceData = req.body;
      
      console.log('💳 [PATIENT] Updating insurance for:', patientId);

      const updatedInsurance = await patientService.updatePatientInsurance(
        patientId, 
        insuranceData,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.PATIENT_UPDATE, {
        resource: 'Patient',
        resourceId: patientId,
        category: 'INSURANCE',
        metadata: { 
          provider: insuranceData.provider,
          policyNumber: insuranceData.policyNumber 
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Cập nhật thông tin bảo hiểm thành công',
        data: updatedInsurance
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PatientController();