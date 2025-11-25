const clinicalService = require('../services/clinical.service');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

/**
 * 🩺 CLINICAL CONTROLLER
 * Xử lý request/response cho khám chữa bệnh
 */

class ClinicalController {
  
  /**
   * 🎯 TẠO PHIÊN KHÁM BỆNH/TƯ VẤN
   */
  async createConsultation(req, res, next) {
    try {
      const { patientId, doctorId } = req.params;
      const consultationData = req.body;
      
      console.log('🩺 [CLINICAL] Creating consultation for patient:', patientId);

      const consultation = await clinicalService.createConsultation(
        patientId, 
        doctorId,
        consultationData,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_CREATE, {
        resource: 'Consultation',
        resourceId: consultation._id,
        metadata: { 
          consultationId: consultation.consultationId,
          patientId: consultation.patientId._id,
          doctorId: consultation.doctorId._id
        }
      })(req, res, () => {});

      res.status(201).json({
        success: true,
        message: 'Tạo phiên khám thành công',
        data: consultation
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN PHIÊN KHÁM
   */
  async getConsultation(req, res, next) {
    try {
      const { consultationId } = req.params;
      
      console.log('🔍 [CLINICAL] Getting consultation:', consultationId);

      const consultation = await clinicalService.getConsultation(consultationId);

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_VIEW, {
        resource: 'Consultation',
        resourceId: consultationId,
        metadata: { patientId: consultation.patientId._id }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Lấy thông tin phiên khám thành công',
        data: consultation
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 CẬP NHẬT THÔNG TIN PHIÊN KHÁM
   */
  async updateConsultation(req, res, next) {
    try {
      const { consultationId } = req.params;
      const updateData = req.body;
      
      console.log('✏️ [CLINICAL] Updating consultation:', consultationId);

      const updatedConsultation = await clinicalService.updateConsultation(
        consultationId, 
        updateData,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, {
        resource: 'Consultation',
        resourceId: consultationId,
        metadata: { 
          updatedBy: req.user._id,
          updatedFields: Object.keys(updateData)
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Cập nhật phiên khám thành công',
        data: updatedConsultation
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 THÊM CHẨN ĐOÁN VÀO PHIÊN KHÁM
   */
  async addDiagnosis(req, res, next) {
    try {
      const { consultationId } = req.params;
      const diagnosisData = req.body;
      
      console.log('🩺 [CLINICAL] Adding diagnosis to consultation:', consultationId);

      const diagnosis = await clinicalService.addDiagnosis(
        consultationId, 
        diagnosisData,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, {
        resource: 'Diagnosis',
        resourceId: diagnosis._id,
        metadata: { 
          consultationId,
          diagnosisName: diagnosis.diagnosisName,
          diagnosedBy: req.user._id
        }
      })(req, res, () => {});

      res.status(201).json({
        success: true,
        message: 'Thêm chẩn đoán thành công',
        data: diagnosis
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 LẤY DANH SÁCH CHẨN ĐOÁN CỦA BỆNH NHÂN
   */
  async getPatientDiagnoses(req, res, next) {
    try {
      const { patientId } = req.params;
      const filters = req.query;
      
      console.log('📋 [CLINICAL] Getting diagnoses for patient:', patientId);

      const result = await clinicalService.getPatientDiagnoses(patientId, filters);

      res.json({
        success: true,
        message: 'Lấy danh sách chẩn đoán thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 GHI NHẬN TRIỆU CHỨNG BỆNH NHÂN
   */
  async recordSymptoms(req, res, next) {
    try {
      const { consultationId } = req.params;
      const { symptoms } = req.body;
      
      console.log('🤒 [CLINICAL] Recording symptoms for consultation:', consultationId);

      const result = await clinicalService.recordSymptoms(
        consultationId, 
        symptoms,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, {
        resource: 'Consultation',
        resourceId: consultationId,
        category: 'SYMPTOMS_RECORDING',
        metadata: { 
          symptomsCount: symptoms.length,
          recordedBy: req.user._id
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Ghi nhận triệu chứng thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 GHI KẾT QUẢ KHÁM THỰC THỂ
   */
  async recordPhysicalExam(req, res, next) {
    try {
      const { consultationId } = req.params;
      const examData = req.body;
      
      console.log('👨‍⚕️ [CLINICAL] Recording physical exam for consultation:', consultationId);

      const result = await clinicalService.recordPhysicalExam(
        consultationId, 
        examData,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, {
        resource: 'Consultation',
        resourceId: consultationId,
        category: 'PHYSICAL_EXAM',
        metadata: { recordedBy: req.user._id }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Ghi kết quả khám thực thể thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 ĐÁNH DẤU HOÀN THÀNH PHIÊN KHÁM
   */
  async completeConsultation(req, res, next) {
    try {
      const { consultationId } = req.params;
      
      console.log('✅ [CLINICAL] Completing consultation:', consultationId);

      const result = await clinicalService.completeConsultation(
        consultationId, 
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, {
        resource: 'Consultation',
        resourceId: consultationId,
        category: 'CONSULTATION_COMPLETION',
        metadata: { completedBy: req.user._id }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Hoàn thành phiên khám thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 CẬP NHẬT THÔNG TIN CHẨN ĐOÁN
   */
  async updateDiagnosis(req, res, next) {
    try {
      const { diagnosisId } = req.params;
      const updateData = req.body;
      
      console.log('✏️ [CLINICAL] Updating diagnosis:', diagnosisId);

      const result = await clinicalService.updateDiagnosis(
        diagnosisId, 
        updateData,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, {
        resource: 'Diagnosis',
        resourceId: diagnosisId,
        metadata: { 
          updatedBy: req.user._id,
          updatedFields: Object.keys(updateData)
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Cập nhật chẩn đoán thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 TẠO KẾ HOẠCH ĐIỀU TRỊ
   */
  async createTreatmentPlan(req, res, next) {
    try {
      const { patientId } = req.params;
      const planData = req.body;
      
      console.log('📋 [CLINICAL] Creating treatment plan for patient:', patientId);

      const result = await clinicalService.createTreatmentPlan(
        patientId, 
        planData,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_CREATE, {
        resource: 'TreatmentPlan',
        category: 'TREATMENT_PLAN_CREATION',
        metadata: { 
          patientId,
          createdBy: req.user._id
        }
      })(req, res, () => {});

      res.status(201).json({
        success: true,
        message: 'Tạo kế hoạch điều trị thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN KẾ HOẠCH ĐIỀU TRỊ
   */
  async getTreatmentPlan(req, res, next) {
    try {
      const { planId } = req.params;
      
      console.log('📋 [CLINICAL] Getting treatment plan:', planId);

      const result = await clinicalService.getTreatmentPlan(planId);

      res.json({
        success: true,
        message: 'Lấy thông tin kế hoạch điều trị thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 GHI NHẬN TIẾN TRIỂN CỦA BỆNH NHÂN
   */
  async recordProgressNote(req, res, next) {
    try {
      const { patientId } = req.params;
      const noteData = req.body;
      
      console.log('📝 [CLINICAL] Recording progress note for patient:', patientId);

      const result = await clinicalService.recordProgressNote(
        patientId, 
        noteData,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, {
        resource: 'MedicalRecord',
        category: 'PROGRESS_NOTE',
        metadata: { 
          patientId,
          recordedBy: req.user._id
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Ghi nhận tiến triển thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 CẬP NHẬT KẾ HOẠCH ĐIỀU TRỊ
   */
  async updateTreatmentPlan(req, res, next) {
    try {
      const { planId } = req.params;
      const updateData = req.body;
      
      console.log('✏️ [CLINICAL] Updating treatment plan:', planId);

      const result = await clinicalService.updateTreatmentPlan(
        planId, 
        updateData,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, {
        resource: 'TreatmentPlan',
        resourceId: planId,
        metadata: { 
          updatedBy: req.user._id,
          updatedFields: Object.keys(updateData)
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Cập nhật kế hoạch điều trị thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 ĐÁNH DẤU HOÀN THÀNH ĐIỀU TRỊ
   */
  async completeTreatmentPlan(req, res, next) {
    try {
      const { planId } = req.params;
      
      console.log('✅ [CLINICAL] Completing treatment plan:', planId);

      const result = await clinicalService.completeTreatmentPlan(
        planId, 
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, {
        resource: 'TreatmentPlan',
        resourceId: planId,
        category: 'TREATMENT_COMPLETION',
        metadata: { completedBy: req.user._id }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Hoàn thành điều trị thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 LẤY TẤT CẢ NHẬN XÉT TIẾN TRIỂN
   */
  async getProgressNotes(req, res, next) {
    try {
      const { patientId } = req.params;
      const filters = req.query;
      
      console.log('📋 [CLINICAL] Getting progress notes for patient:', patientId);

      const result = await clinicalService.getProgressNotes(patientId, filters);

      res.json({
        success: true,
        message: 'Lấy nhận xét tiến triển thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 GHI NHẬN CỦA ĐIỀU DƯỠNG
   */
  async recordNursingNote(req, res, next) {
    try {
      const { patientId } = req.params;
      const noteData = req.body;
      
      console.log('👩‍⚕️ [CLINICAL] Recording nursing note for patient:', patientId);

      const result = await clinicalService.recordNursingNote(
        patientId, 
        noteData,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, {
        resource: 'MedicalRecord',
        category: 'NURSING_NOTE',
        metadata: { 
          patientId,
          recordedBy: req.user._id
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Ghi nhận của điều dưỡng thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 GHI TÓM TẮT TÌNH TRẠNG KHI XUẤT VIỆN
   */
  async recordDischargeSummary(req, res, next) {
    try {
      const { patientId } = req.params;
      const summaryData = req.body;
      
      console.log('🏥 [CLINICAL] Recording discharge summary for patient:', patientId);

      const result = await clinicalService.recordDischargeSummary(
        patientId, 
        summaryData,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE, {
        resource: 'MedicalRecord',
        category: 'DISCHARGE_SUMMARY',
        metadata: { 
          patientId,
          dischargedBy: req.user._id
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Ghi tóm tắt xuất viện thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClinicalController();