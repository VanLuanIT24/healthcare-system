// src/controllers/clinical.controller.js
const clinicalService = require('../services/clinical.service');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

class ClinicalController {
  async createConsultation(req, res, next) {
    try {
      const { patientId } = req.params;
      const data = req.body;
      const doctorId = req.user._id; // Assume current user is doctor
      const consultation = await clinicalService.createConsultation(patientId, doctorId, data, req.user._id);
      await auditLog(AUDIT_ACTIONS.CONSULTATION_CREATE, { resourceId: consultation._id })(req, res, () => {});
      res.status(201).json({ success: true, data: consultation });
    } catch (error) {
      next(error);
    }
  }

  async getConsultation(req, res, next) {
    try {
      const { id } = req.params;
      const consultation = await clinicalService.getConsultation(id);
      await auditLog(AUDIT_ACTIONS.CONSULTATION_VIEW, { resourceId: id })(req, res, () => {});
      res.json({ success: true, data: consultation });
    } catch (error) {
      next(error);
    }
  }

  async updateConsultation(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updated = await clinicalService.updateConsultation(id, data, req.user._id);
      await auditLog(AUDIT_ACTIONS.CONSULTATION_UPDATE, { resourceId: id })(req, res, () => {});
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async completeConsultation(req, res, next) {
    try {
      const { id } = req.params;
      const completed = await clinicalService.completeConsultation(id, req.user._id);
      await auditLog(AUDIT_ACTIONS.CONSULTATION_COMPLETE, { resourceId: id })(req, res, () => {});
      res.json({ success: true, data: completed });
    } catch (error) {
      next(error);
    }
  }

  async approveConsultation(req, res, next) {
    try {
      const { id } = req.params;
      const approved = await clinicalService.approveConsultation(id, req.user._id);
      await auditLog(AUDIT_ACTIONS.CONSULTATION_APPROVE, { resourceId: id })(req, res, () => {});
      res.json({ success: true, data: approved });
    } catch (error) {
      next(error);
    }
  }

  async recordSymptoms(req, res, next) {
    try {
      const { consultationId } = req.params;
      const { symptoms } = req.body;
      const recorded = await clinicalService.recordSymptoms(consultationId, symptoms, req.user._id);
      await auditLog(AUDIT_ACTIONS.SYMPTOMS_RECORD, { resourceId: consultationId })(req, res, () => {});
      res.json({ success: true, data: recorded });
    } catch (error) {
      next(error);
    }
  }

  async recordPhysicalExam(req, res, next) {
    try {
      const { consultationId } = req.params;
      const exam = req.body;
      const recorded = await clinicalService.recordPhysicalExam(consultationId, exam, req.user._id);
      await auditLog(AUDIT_ACTIONS.PHYSICAL_EXAM_RECORD, { resourceId: consultationId })(req, res, () => {});
      res.json({ success: true, data: recorded });
    } catch (error) {
      next(error);
    }
  }

  async addDiagnosis(req, res, next) {
    try {
      const { consultationId } = req.params;
      const diagnosis = req.body;
      const added = await clinicalService.addDiagnosis(consultationId, diagnosis, req.user._id);
      await auditLog(AUDIT_ACTIONS.DIAGNOSIS_ADD, { resourceId: consultationId })(req, res, () => {});
      res.json({ success: true, data: added });
    } catch (error) {
      next(error);
    }
  }

  async getPatientConsultations(req, res, next) {
    try {
      const { patientId } = req.params;
      const params = req.query;
      const consultations = await clinicalService.getPatientConsultations(patientId, params);
      res.json({ success: true, data: consultations });
    } catch (error) {
      next(error);
    }
  }

  async searchICD10(req, res, next) {
    try {
      const { q } = req.query;
      const results = await clinicalService.searchICD10(q);
      res.json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  }

  async getPatientDiagnoses(req, res, next) {
    try {
      const { patientId } = req.params;
      const params = req.query;
      const diagnoses = await clinicalService.getPatientDiagnoses(patientId, params);
      res.json({ success: true, data: diagnoses });
    } catch (error) {
      next(error);
    }
  }

  async createTreatmentPlan(req, res, next) {
    try {
      const { patientId } = req.params;
      const plan = req.body;
      const created = await clinicalService.createTreatmentPlan(patientId, plan, req.user._id);
      await auditLog(AUDIT_ACTIONS.TREATMENT_PLAN_CREATE, { resourceId: created._id })(req, res, () => {});
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  }

  async recordProgressNote(req, res, next) {
    try {
      const { patientId } = req.params;
      const note = req.body;
      const recorded = await clinicalService.recordProgressNote(patientId, note, req.user._id);
      await auditLog(AUDIT_ACTIONS.PROGRESS_NOTE_RECORD, { resourceId: patientId })(req, res, () => {});
      res.json({ success: true, data: recorded });
    } catch (error) {
      next(error);
    }
  }

  async recordNursingNote(req, res, next) {
    try {
      const { patientId } = req.params;
      const note = req.body;
      const recorded = await clinicalService.recordNursingNote(patientId, note, req.user._id);
      await auditLog(AUDIT_ACTIONS.NURSING_NOTE_RECORD, { resourceId: patientId })(req, res, () => {});
      res.json({ success: true, data: recorded });
    } catch (error) {
      next(error);
    }
  }

  async getMedicalRecord(req, res, next) {
    try {
      const { patientId } = req.params;
      const record = await clinicalService.getMedicalRecord(patientId);
      res.json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  }

  async exportMedicalRecordPDF(req, res, next) {
    try {
      const { patientId } = req.params;
      const pdfBuffer = await clinicalService.exportMedicalRecordPDF(patientId);
      res.setHeader('Content-Type', 'application/pdf');
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  async recordVitalSigns(req, res, next) {
    try {
      const { patientId } = req.params;
      const vitals = req.body;
      const recorded = await clinicalService.recordVitalSigns(patientId, vitals, req.user._id);
      await auditLog(AUDIT_ACTIONS.VITAL_SIGNS_RECORD, { resourceId: patientId })(req, res, () => {});
      res.json({ success: true, data: recorded });
    } catch (error) {
      next(error);
    }
  }

  async getVitalSignsHistory(req, res, next) {
    try {
      const { patientId } = req.params;
      const params = req.query;
      const history = await clinicalService.getVitalSignsHistory(patientId, params);
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  async getVitalSignsTrend(req, res, next) {
    try {
      const { patientId } = req.params;
      const { type, days } = req.query;
      const trend = await clinicalService.getVitalSignsTrend(patientId, type, days);
      res.json({ success: true, data: trend });
    } catch (error) {
      next(error);
    }
  }

  async getClinicalTemplates(req, res, next) {
    try {
      const { specialty } = req.query;
      const templates = await clinicalService.getClinicalTemplates(specialty);
      res.json({ success: true, data: templates });
    } catch (error) {
      next(error);
    }
  }

  async saveClinicalTemplate(req, res, next) {
    try {
      const template = req.body;
      const saved = await clinicalService.saveClinicalTemplate(template, req.user._id);
      res.json({ success: true, data: saved });
    } catch (error) {
      next(error);
    }
  }

  async getConsultationAccessLogs(req, res, next) {
    try {
      const { consultationId } = req.params;
      const logs = await clinicalService.getConsultationAccessLogs(consultationId);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClinicalController();