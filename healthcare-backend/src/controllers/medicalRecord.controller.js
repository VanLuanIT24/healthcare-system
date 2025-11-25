const medicalRecordService = require('../services/medicalRecord.service');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

/**
 * 🏥 MEDICAL RECORD CONTROLLER
 * Xử lý request/response cho hồ sơ bệnh án
 */

class MedicalRecordController {
  
  /**
   * 🎯 TẠO HỒ SƠ BỆNH ÁN MỚI
   */
  async createMedicalRecord(req, res, next) {
    try {
      const { patientId } = req.params;
      const recordData = req.body;
      
      console.log('🏥 [MEDICAL] Creating medical record for patient:', patientId);

      const medicalRecord = await medicalRecordService.createMedicalRecord(
        patientId, 
        recordData,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_CREATE, {
        resource: 'MedicalRecord',
        resourceId: medicalRecord._id,
        metadata: { 
          recordId: medicalRecord.recordId,
          patientId: medicalRecord.patientId._id,
          doctorId: medicalRecord.doctorId._id
        }
      })(req, res, () => {});

      res.status(201).json({
        success: true,
        message: 'Tạo hồ sơ bệnh án thành công',
        data: medicalRecord
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN HỒ SƠ BỆNH ÁN
   */
  async getMedicalRecord(req, res, next) {
    try {
      const { recordId } = req.params;
      
      console.log('🔍 [MEDICAL] Getting medical record:', recordId);

      const medicalRecord = await medicalRecordService.getMedicalRecord(recordId);

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_VIEW, {
        resource: 'MedicalRecord',
        resourceId: recordId,
        metadata: { patientId: medicalRecord.patientId._id }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Lấy thông tin hồ sơ bệnh án thành công',
        data: medicalRecord
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 LẤY TẤT CẢ HỒ SƠ BỆNH ÁN CỦA BỆNH NHÂN
   */
  async getPatientMedicalRecords(req, res, next) {
    try {
      const { patientId } = req.params;
      const filters = req.query;
      
      console.log('📋 [MEDICAL] Getting medical records for patient:', patientId);

      const result = await medicalRecordService.getPatientMedicalRecords(patientId, filters);

      res.json({
        success: true,
        message: 'Lấy danh sách hồ sơ bệnh án thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 CẬP NHẬT HỒ SƠ BỆNH ÁN
   */
  async updateMedicalRecord(req, res, next) {
    try {
      const { recordId } = req.params;
      const updateData = req.body;
      
      console.log('✏️ [MEDICAL] Updating medical record:', recordId);

      const updatedRecord = await medicalRecordService.updateMedicalRecord(
        recordId, 
        updateData,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, {
        resource: 'MedicalRecord',
        resourceId: recordId,
        metadata: { 
          updatedBy: req.user._id,
          updatedFields: Object.keys(updateData)
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Cập nhật hồ sơ bệnh án thành công',
        data: updatedRecord
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 GHI NHẬN DẤU HIỆU SINH TỒN
   */
  async recordVitalSigns(req, res, next) {
    try {
      const { patientId } = req.params;
      const vitalData = req.body;
      
      console.log('❤️ [MEDICAL] Recording vital signs for patient:', patientId);

      const result = await medicalRecordService.recordVitalSigns(
        patientId, 
        vitalData,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, {
        resource: 'MedicalRecord',
        category: 'VITAL_SIGNS',
        metadata: { 
          patientId,
          recordedBy: req.user._id,
          vitalSigns: Object.keys(vitalData)
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Ghi nhận dấu hiệu sinh tồn thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 LẤY LỊCH SỬ DẤU HIỆU SINH TỒN
   */
  async getVitalSignsHistory(req, res, next) {
    try {
      const { patientId } = req.params;
      const { timeframe } = req.query;
      
      console.log('📊 [MEDICAL] Getting vital signs history for patient:', patientId);

      const result = await medicalRecordService.getVitalSignsHistory(patientId, timeframe);

      res.json({
        success: true,
        message: 'Lấy lịch sử dấu hiệu sinh tồn thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 THÊM TIỀN SỬ BỆNH LÝ
   */
  async addMedicalHistory(req, res, next) {
    try {
      const { patientId } = req.params;
      const historyData = req.body;
      
      console.log('📝 [MEDICAL] Adding medical history for patient:', patientId);

      const result = await medicalRecordService.addMedicalHistory(
        patientId, 
        historyData,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, {
        resource: 'MedicalRecord',
        category: 'MEDICAL_HISTORY',
        metadata: { 
          patientId,
          addedBy: req.user._id,
          historyType: historyData.category
        }
      })(req, res, () => {});

      res.status(201).json({
        success: true,
        message: 'Thêm tiền sử bệnh lý thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 LẤY TOÀN BỘ TIỀN SỬ BỆNH LÝ
   */
  async getMedicalHistory(req, res, next) {
    try {
      const { patientId } = req.params;
      
      console.log('📚 [MEDICAL] Getting medical history for patient:', patientId);

      const result = await medicalRecordService.getMedicalHistory(patientId);

      res.json({
        success: true,
        message: 'Lấy tiền sử bệnh lý thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 LƯU TRỮ HỒ SƠ BỆNH ÁN
   */
  async archiveMedicalRecord(req, res, next) {
    try {
      const { recordId } = req.params;
      
      console.log('📦 [MEDICAL] Archiving medical record:', recordId);

      const result = await medicalRecordService.archiveMedicalRecord(
        recordId, 
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, {
        resource: 'MedicalRecord',
        resourceId: recordId,
        category: 'ARCHIVE',
        metadata: { archivedBy: req.user._id }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Lưu trữ hồ sơ bệnh án thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }
  /**
 * 🎯 LẤY LỊCH SỬ PHẪU THUẬT
 */
async getSurgicalHistory(req, res, next) {
  try {
    const { patientId } = req.params;
    
    console.log('🔪 [MEDICAL] Getting surgical history for patient:', patientId);

    const result = await medicalRecordService.getSurgicalHistory(patientId);

    res.json({
      success: true,
      message: 'Lấy lịch sử phẫu thuật thành công',
      data: result
    });

  } catch (error) {
    next(error);
  }
}

/**
 * 🎯 LẤY TIỀN SỬ SẢN KHOA
 */
async getObstetricHistory(req, res, next) {
  try {
    const { patientId } = req.params;
    
    console.log('🤰 [MEDICAL] Getting obstetric history for patient:', patientId);

    const result = await medicalRecordService.getObstetricHistory(patientId);

    res.json({
      success: true,
      message: 'Lấy tiền sử sản khoa thành công',
      data: result
    });

  } catch (error) {
    next(error);
  }
}

/**
 * 🎯 THÊM THÔNG TIN PHẪU THUẬT
 */
async addSurgicalHistory(req, res, next) {
  try {
    const { patientId } = req.params;
    const surgeryData = req.body;
    
    console.log('🔪 [MEDICAL] Adding surgical history for patient:', patientId);

    const result = await medicalRecordService.addSurgicalHistory(
      patientId, 
      surgeryData,
      req.user._id
    );

    // 🎯 AUDIT LOG
    await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, {
      resource: 'MedicalRecord',
      category: 'SURGICAL_HISTORY',
      metadata: { 
        patientId,
        addedBy: req.user._id,
        procedure: surgeryData.procedure
      }
    })(req, res, () => {});

    res.status(201).json({
      success: true,
      message: 'Thêm thông tin phẫu thuật thành công',
      data: result
    });

  } catch (error) {
    next(error);
  }
}

/**
 * 🎯 GHI NHẬN PHÁT HIỆN LÂM SÀNG
 */
async recordClinicalFindings(req, res, next) {
  try {
    const findingsData = req.body;
    
    console.log('🔍 [MEDICAL] Recording clinical findings');

    const result = await medicalRecordService.recordClinicalFindings(
      findingsData.consultationId,
      findingsData,
      req.user._id
    );

    // 🎯 AUDIT LOG
    await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_CREATE, {
      resource: 'MedicalRecord',
      category: 'CLINICAL_FINDINGS',
      metadata: { 
        patientId: findingsData.patientId,
        recordedBy: req.user._id
      }
    })(req, res, () => {});

    res.status(201).json({
      success: true,
      message: 'Ghi nhận phát hiện lâm sàng thành công',
      data: result
    });

  } catch (error) {
    next(error);
  }
}

/**
 * 🎯 TÌM KIẾM HỒ SƠ THEO CHẨN ĐOÁN
 */
async searchMedicalRecordsByDiagnosis(req, res, next) {
  try {
    const filters = req.query;
    
    console.log('🔍 [MEDICAL] Searching medical records by diagnosis:', filters.diagnosis);

    const result = await medicalRecordService.searchMedicalRecordsByDiagnosis(
      filters.diagnosis, 
      filters
    );

    res.json({
      success: true,
      message: 'Tìm kiếm hồ sơ theo chẩn đoán thành công',
      data: result
    });

  } catch (error) {
    next(error);
  }
}

/**
 * 🎯 THỐNG KÊ HỒ SƠ BỆNH ÁN
 */
async getMedicalRecordsStats(req, res, next) {
  try {
    const { timeframe } = req.query;
    
    console.log('📊 [MEDICAL] Getting medical records statistics for timeframe:', timeframe);

    const result = await medicalRecordService.getMedicalRecordsStats(timeframe);

    res.json({
      success: true,
      message: 'Lấy thống kê hồ sơ bệnh án thành công',
      data: result
    });

  } catch (error) {
    next(error);
  }
}
}

module.exports = new MedicalRecordController();