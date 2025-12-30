// src/controllers/medicalRecord.controller.js
const medicalRecordService = require('../services/medicalRecord.service');
const { AppError } = require('../middlewares/error.middleware');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

class MedicalRecordController {
  async createMedicalRecord(req, res, next) {
    try {
      const data = req.body;
      const record = await medicalRecordService.createMedicalRecord(data, req.user._id);

      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_CREATE, { resourceId: record._id })(req, res, () => {});

      res.status(201).json({
        success: true,
        message: 'Tạo hồ sơ bệnh án thành công',
        data: record
      });
    } catch (error) {
      next(error);
    }
  }

  async getMedicalRecord(req, res, next) {
    try {
      const { recordId } = req.params;
      const record = await medicalRecordService.getMedicalRecord(recordId);

      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_VIEW, { resourceId: recordId })(req, res, () => {});

      res.json({
        success: true,
        data: record
      });
    } catch (error) {
      next(error);
    }
  }

  async getPatientMedicalRecords(req, res, next) {
    try {
      const { patientId } = req.params;
      const filters = req.query;
      const result = await medicalRecordService.getPatientMedicalRecords(patientId, filters);

      res.json({
        success: true,
        data: result.records,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMedicalRecord(req, res, next) {
    try {
      const { recordId } = req.params;
      const data = req.body;
      const updated = await medicalRecordService.updateMedicalRecord(recordId, data, req.user._id);

      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, { resourceId: recordId })(req, res, () => {});

      res.json({
        success: true,
        message: 'Cập nhật hồ sơ bệnh án thành công',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  async recordVitalSigns(req, res, next) {
    try {
      const { patientId } = req.params;
      const vitals = req.body;
      const recorded = await medicalRecordService.recordVitalSigns(patientId, vitals, req.user._id);

      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, { resourceId: patientId, category: 'VITAL_SIGNS' })(req, res, () => {});

      res.json({
        success: true,
        message: 'Ghi nhận dấu hiệu sinh tồn thành công',
        data: recorded
      });
    } catch (error) {
      next(error);
    }
  }

  async getVitalSignsHistory(req, res, next) {
    try {
      const { patientId } = req.params;
      const filters = req.query;
      const history = await medicalRecordService.getVitalSignsHistory(patientId, filters);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }

  async addMedicalHistory(req, res, next) {
    try {
      const { patientId } = req.params;
      const history = req.body;
      const added = await medicalRecordService.addMedicalHistory(patientId, history, req.user._id);

      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, { resourceId: patientId, category: 'MEDICAL_HISTORY' })(req, res, () => {});

      res.json({
        success: true,
        message: 'Thêm tiền sử bệnh lý thành công',
        data: added
      });
    } catch (error) {
      next(error);
    }
  }

  async getMedicalHistory(req, res, next) {
    try {
      const { patientId } = req.params;
      const history = await medicalRecordService.getMedicalHistory(patientId);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }

  async addSurgicalHistory(req, res, next) {
    try {
      const { patientId } = req.params;
      const surgery = req.body;
      const added = await medicalRecordService.addSurgicalHistory(patientId, surgery, req.user._id);

      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, { resourceId: patientId, category: 'SURGICAL_HISTORY' })(req, res, () => {});

      res.json({
        success: true,
        message: 'Thêm lịch sử phẫu thuật thành công',
        data: added
      });
    } catch (error) {
      next(error);
    }
  }

  async getSurgicalHistory(req, res, next) {
    try {
      const { patientId } = req.params;
      const history = await medicalRecordService.getSurgicalHistory(patientId);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }

  async getObstetricHistory(req, res, next) {
    try {
      const { patientId } = req.params;
      const history = await medicalRecordService.getObstetricHistory(patientId);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }

  async recordClinicalFindings(req, res, next) {
    try {
      const { recordId } = req.params;
      const findings = req.body;
      const recorded = await medicalRecordService.recordClinicalFindings(recordId, findings, req.user._id);

      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, { resourceId: recordId, category: 'CLINICAL_FINDINGS' })(req, res, () => {});

      res.json({
        success: true,
        message: 'Ghi nhận phát hiện lâm sàng thành công',
        data: recorded
      });
    } catch (error) {
      next(error);
    }
  }

  async archiveMedicalRecord(req, res, next) {
    try {
      const { recordId } = req.params;
      const archived = await medicalRecordService.archiveMedicalRecord(recordId, req.user._id);

      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_ARCHIVE, { resourceId: recordId })(req, res, () => {});

      res.json({
        success: true,
        message: 'Lưu trữ hồ sơ bệnh án thành công',
        data: archived
      });
    } catch (error) {
      next(error);
    }
  }

  async searchMedicalRecordsByDiagnosis(req, res, next) {
    try {
      const { diagnosis } = req.query;
      const filters = req.query;
      const result = await medicalRecordService.searchMedicalRecordsByDiagnosis(diagnosis, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getMedicalRecordsStats(req, res, next) {
    try {
      const { timeframe } = req.query;
      const stats = await medicalRecordService.getMedicalRecordsStats(timeframe);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MedicalRecordController();