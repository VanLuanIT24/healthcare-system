const patientService = require('../services/patient.service');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

/**
 * 🏥 PATIENT CONTROLLER - QUẢN LÝ BỆNH NHÂN
 * Core business logic cho healthcare system
 */

class PatientController {
  
  async registerPatient(req, res, next) {
  try {
    // 🎯 DEBUG CHI TIẾT DỮ LIỆU ĐẦU VÀO
    console.log('🔍 [CONTROLLER - registerPatient] Full request details:', {
      body: req.body,
      bodyType: typeof req.body,
      bodyKeys: req.body ? Object.keys(req.body) : 'NO BODY',
      bodyRaw: JSON.stringify(req.body),
      headers: req.headers,
      user: req.user ? {
        _id: req.user._id,
        role: req.user.role,
        email: req.user.email
      } : 'No user'
    });

    // 🎯 KIỂM TRA DỮ LIỆU ĐẦU VÀO KỸ HƠN
    if (!req.body) {
      console.log('❌ [CONTROLLER] Request body is completely missing');
      throw new AppError('Dữ liệu đăng ký không hợp lệ: thiếu body', 400, ERROR_CODES.VALIDATION_FAILED);
    }

    if (!req.body.email) {
      console.log('❌ [CONTROLLER] Email is missing in body:', {
        availableKeys: Object.keys(req.body),
        bodyContent: req.body
      });
      throw new AppError('Email là bắt buộc', 400, ERROR_CODES.VALIDATION_FAILED);
    }

    console.log('👤 [PATIENT] Registering new patient:', req.body.email);
    
    const patientData = {
      ...req.body,
      createdBy: req.user._id
    };

    console.log('📦 [CONTROLLER] Patient data prepared:', {
      email: patientData.email,
      hasPassword: !!patientData.password,
      createdBy: patientData.createdBy,
      totalKeys: Object.keys(patientData).length
    });

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
    console.error('❌ [CONTROLLER] Register patient error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      bodyReceived: req.body
    });
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
  
  /**
   * 🎯 LẤY THÔNG TIN LIÊN LẠC BỆNH NHÂN
   */
  async getPatientContacts(req, res, next) {
    try {
      const { patientId } = req.params;
      
      console.log('📞 [PATIENT] Getting contacts for:', patientId);

      const contacts = await patientService.getPatientContacts(patientId);

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.PATIENT_VIEW, {
        resource: 'Patient',
        resourceId: patientId,
        category: 'CONTACTS'
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Lấy thông tin liên lạc thành công',
        data: contacts
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN DỊ ỨNG
   */
  async getPatientAllergies(req, res, next) {
    try {
      const { patientId } = req.params;
      const { activeOnly = 'true' } = req.query;
      
      console.log('🤧 [PATIENT] Getting allergies for:', patientId);

      const allergies = await patientService.getPatientAllergies(
        patientId, 
        activeOnly === 'true'
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.PATIENT_VIEW, {
        resource: 'Patient',
        resourceId: patientId,
        category: 'ALLERGIES'
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Lấy thông tin dị ứng thành công',
        data: allergies
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 CẬP NHẬT THÔNG TIN DỊ ỨNG
   */
  async updatePatientAllergies(req, res, next) {
    try {
      const { patientId } = req.params;
      const allergyUpdates = req.body;
      
      console.log('✏️ [PATIENT] Updating allergies for:', patientId);

      const updatedPatient = await patientService.updatePatientAllergies(
        patientId, 
        allergyUpdates,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.PATIENT_UPDATE, {
        resource: 'Patient',
        resourceId: patientId,
        category: 'ALLERGIES',
        metadata: { 
          operation: allergyUpdates.operation,
          allergen: allergyUpdates.allergyData?.allergen 
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Cập nhật thông tin dị ứng thành công',
        data: updatedPatient
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
      
      console.log('🏦 [PATIENT] Getting insurance for:', patientId);

      const insurance = await patientService.getPatientInsurance(patientId);

      // 🎯 AUDIT LOG
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
   * 🎯 LẤY TIỀN SỬ GIA ĐÌNH
   */
  async getPatientFamilyHistory(req, res, next) {
    try {
      const { patientId } = req.params;
      
      console.log('👨‍👩‍👧‍👦 [PATIENT] Getting family history for:', patientId);

      const familyHistory = await patientService.getPatientFamilyHistory(patientId);

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.PATIENT_VIEW, {
        resource: 'Patient',
        resourceId: patientId,
        category: 'FAMILY_HISTORY'
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Lấy thông tin tiền sử gia đình thành công',
        data: familyHistory
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 CẬP NHẬT TIỀN SỬ GIA ĐÌNH
   */
  async updatePatientFamilyHistory(req, res, next) {
    try {
      const { patientId } = req.params;
      const familyHistoryData = req.body;
      
      console.log('✏️ [PATIENT] Updating family history for:', patientId);

      const updatedPatient = await patientService.updatePatientFamilyHistory(
        patientId, 
        familyHistoryData,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.PATIENT_UPDATE, {
        resource: 'Patient',
        resourceId: patientId,
        category: 'FAMILY_HISTORY',
        metadata: { 
          operation: familyHistoryData.operation,
          condition: familyHistoryData.historyData?.condition 
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Cập nhật thông tin tiền sử gia đình thành công',
        data: updatedPatient
      });

    } catch (error) {
      next(error);
    }
  }
}


module.exports = new PatientController();