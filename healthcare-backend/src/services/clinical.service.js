// src/services/clinical.service.js
const mongoose = require('mongoose');
const Consultation = require('../models/consultation.model');
const Diagnosis = require('../models/diagnosis.model');
const MedicalRecord = require('../models/medicalRecord.model');
const User = require('../models/user.model');
const AuditLog = require('../models/auditLog.model');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const { generateMedicalCode } = require('../utils/healthcare.utils');
const PDFDocument = require('pdfkit');

// Lazily create template model if file missing
let Template;
try {
  // eslint-disable-next-line global-require
  Template = require('../models/clinicalTemplate.model');
} catch (err) {
  const templateSchema = new mongoose.Schema({
    name: String,
    specialty: String,
    content: mongoose.Schema.Types.Mixed,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }, { timestamps: true });
  Template = mongoose.models.ClinicalTemplate || mongoose.model('ClinicalTemplate', templateSchema);
}

class ClinicalService {
  async createConsultation(patientId, doctorId, data, createdBy) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const medicalRecord = new MedicalRecord({
        recordId: generateMedicalCode('MR'),
        patientId,
        doctorId,
        department: data.department || 'GENERAL',
        visitType: data.visitType || 'OUTPATIENT',
        chiefComplaint: data.chiefComplaint || data.reason || 'Khám bệnh',
        historyOfPresentIllness: data.historyOfPresentIllness,
        symptoms: data.symptoms || [],
        treatmentPlan: data.treatmentPlan,
        createdBy: createdBy || doctorId,
        status: 'DRAFT'
      });
      await medicalRecord.save({ session });

      const consultation = new Consultation({
        consultationId: generateMedicalCode('CONS'),
        medicalRecordId: medicalRecord._id,
        patientId,
        doctorId,
        consultationDate: data.consultationDate || new Date(),
        type: data.type || 'INITIAL',
        mode: data.mode || 'IN_PERSON',
        subjective: data.subjective,
        objective: data.objective,
        assessment: data.assessment,
        plan: data.plan,
        notes: data.notes,
        status: 'SCHEDULED'
      });
      await consultation.save({ session });

      await session.commitTransaction();
      return consultation;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getConsultation(id) {
    const consultation = await Consultation.findById(id).populate('patientId doctorId medicalRecordId');
    if (!consultation) {
      throw new AppError('Không tìm thấy tư vấn', 404, ERROR_CODES.MEDICAL_RECORD_NOT_FOUND);
    }
    return consultation;
  }

  async updateConsultation(id, data, updater) {
    const updated = await Consultation.findByIdAndUpdate(
      id,
      { ...data, lastModifiedBy: updater },
      { new: true }
    );
    if (!updated) throw new AppError('Không tìm thấy tư vấn', 404, ERROR_CODES.MEDICAL_RECORD_NOT_FOUND);
    return updated;
  }

  async completeConsultation(id, userId) {
    const updated = await Consultation.findByIdAndUpdate(
      id,
      { status: 'COMPLETED', endTime: new Date(), lastModifiedBy: userId },
      { new: true }
    );
    if (!updated) throw new AppError('Không tìm thấy tư vấn', 404, ERROR_CODES.MEDICAL_RECORD_NOT_FOUND);
    return updated;
  }

  async approveConsultation(id, approver) {
    const updated = await Consultation.findByIdAndUpdate(
      id,
      { status: 'APPROVED', approvedBy: approver, approvalDate: new Date() },
      { new: true }
    );
    if (!updated) throw new AppError('Không tìm thấy tư vấn', 404, ERROR_CODES.MEDICAL_RECORD_NOT_FOUND);
    return updated;
  }

  async recordSymptoms(consultationId, symptoms, userId) {
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) throw new AppError('Không tìm thấy tư vấn', 404, ERROR_CODES.MEDICAL_RECORD_NOT_FOUND);
    consultation.symptoms = symptoms;
    consultation.lastModifiedBy = userId;
    await consultation.save();
    return consultation;
  }

  async recordPhysicalExam(consultationId, exam, userId) {
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) throw new AppError('Không tìm thấy tư vấn', 404, ERROR_CODES.MEDICAL_RECORD_NOT_FOUND);
    consultation.physicalExam = exam;
    consultation.lastModifiedBy = userId;
    await consultation.save();
    return consultation;
  }

  async addDiagnosis(consultationId, diagnosis, doctorId) {
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) throw new AppError('Không tìm thấy tư vấn', 404, ERROR_CODES.MEDICAL_RECORD_NOT_FOUND);

    const newDiagnosis = new Diagnosis({
      diagnosisId: generateMedicalCode('DIAG'),
      consultationId,
      medicalRecordId: consultation.medicalRecordId,
      patientId: consultation.patientId,
      doctorId: doctorId || consultation.doctorId,
      diagnosisCode: diagnosis.diagnosisCode || diagnosis.code,
      diagnosisName: diagnosis.diagnosisName || diagnosis.name,
      category: diagnosis.category,
      type: diagnosis.type || 'PRIMARY',
      certainty: diagnosis.certainty || 'PROBABLE',
      severity: diagnosis.severity,
      onsetDate: diagnosis.onsetDate,
      description: diagnosis.description,
      clinicalFeatures: diagnosis.clinicalFeatures,
      diagnosticCriteria: diagnosis.diagnosticCriteria,
      treatmentStatus: diagnosis.treatmentStatus,
      followUpRequired: diagnosis.followUpRequired,
      followUpInterval: diagnosis.followUpInterval,
      notes: diagnosis.notes
    });
    await newDiagnosis.save();
    consultation.diagnoses = consultation.diagnoses || [];
    consultation.diagnoses.push(newDiagnosis._id);
    await consultation.save();
    return newDiagnosis;
  }

  async getPatientConsultations(patientId, params) {
    const { status, startDate, endDate, page = 1, limit = 10 } = params;
    const filter = { patientId };
    if (status) filter.status = status;
    if (startDate) filter.consultationDate = { ...filter.consultationDate, $gte: new Date(startDate) };
    if (endDate) filter.consultationDate = { ...filter.consultationDate, $lte: new Date(endDate) };

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Consultation.find(filter)
        .populate('doctorId medicalRecordId')
        .sort({ consultationDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Consultation.countDocuments(filter)
    ]);

    return {
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async searchICD10(query) {
    if (!query) return [];
    return Diagnosis.find({
      $or: [
        { diagnosisCode: new RegExp(query, 'i') },
        { diagnosisName: new RegExp(query, 'i') }
      ]
    }).limit(20);
  }

  async getPatientDiagnoses(patientId, params) {
    const { status, startDate, endDate, page = 1, limit = 10 } = params;
    const filter = { patientId };
    if (status) filter.status = status;
    if (startDate) filter.diagnosedDate = { ...filter.diagnosedDate, $gte: new Date(startDate) };
    if (endDate) filter.diagnosedDate = { ...filter.diagnosedDate, $lte: new Date(endDate) };

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Diagnosis.find(filter)
        .populate('doctorId')
        .sort({ diagnosedDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Diagnosis.countDocuments(filter)
    ]);

    return {
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createTreatmentPlan(patientId, plan, userId) {
    const medicalRecord = await this.getLatestRecord(patientId);
    medicalRecord.treatmentPlan = plan;
    medicalRecord.lastModifiedBy = userId;
    await medicalRecord.save();
    return medicalRecord;
  }

  async recordProgressNote(patientId, note, userId) {
    const medicalRecord = await this.getLatestRecord(patientId);
    medicalRecord.progressNotes = medicalRecord.progressNotes || [];
    medicalRecord.progressNotes.push({ ...note, createdBy: userId, createdAt: new Date() });
    medicalRecord.lastModifiedBy = userId;
    await medicalRecord.save();
    return medicalRecord;
  }

  async recordNursingNote(patientId, note, userId) {
    const medicalRecord = await this.getLatestRecord(patientId);
    medicalRecord.nursingNotes = medicalRecord.nursingNotes || [];
    medicalRecord.nursingNotes.push({ ...note, createdBy: userId, createdAt: new Date() });
    medicalRecord.lastModifiedBy = userId;
    await medicalRecord.save();
    return medicalRecord;
  }

  async getMedicalRecord(patientId) {
    return await MedicalRecord.findOne({ patientId }).sort({ createdAt: -1 });
  }

  async exportMedicalRecordPDF(patientId) {
    const record = await this.getMedicalRecord(patientId);
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));

    doc.fontSize(18).text('HỒ SƠ BỆNH ÁN', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Mã hồ sơ: ${record.recordId}`);
    doc.text(`Bệnh nhân: ${record.patientId}`);
    doc.text(`Bác sĩ phụ trách: ${record.doctorId}`);
    doc.text(`Ngày khám: ${new Date(record.visitDate).toLocaleString('vi-VN')}`);
    doc.moveDown();
    if (record.chiefComplaint) doc.text(`Lý do khám: ${record.chiefComplaint}`);
    if (record.historyOfPresentIllness) doc.text(`Bệnh sử: ${record.historyOfPresentIllness}`);
    doc.end();
    return Buffer.concat(buffers);
  }

  async recordVitalSigns(patientId, vitals, userId) {
    const medicalRecord = await this.getLatestRecord(patientId);
    medicalRecord.vitalSigns = { ...vitals, recordedBy: userId, recordedAt: new Date() };
    medicalRecord.lastModifiedBy = userId;
    await medicalRecord.save();
    return medicalRecord;
  }

  async getVitalSignsHistory(patientId, params) {
    const timeframe = params.timeframe || '7d';
    const now = new Date();
    const start = new Date(now);
    const map = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 };
    start.setDate(start.getDate() - (map[timeframe] || 7));

    const records = await MedicalRecord.find({
      patientId,
      createdAt: { $gte: start, $lte: now }
    }).select('vitalSigns createdAt');

    return records
      .filter(r => r.vitalSigns && Object.keys(r.vitalSigns).length)
      .map(r => ({ ...r.vitalSigns, recordedAt: r.vitalSigns.recordedAt || r.createdAt }));
  }

  async getVitalSignsTrend(patientId, type, days) {
    const history = await this.getVitalSignsHistory(patientId, { timeframe: `${days || 30}d` });
    const values = history.map(h => ({ value: h[type], at: h.recordedAt }));
    return {
      type,
      points: values.filter(v => v.value !== undefined && v.value !== null)
    };
  }

  async getClinicalTemplates(specialty) {
    return await Template.find({ specialty });
  }

  async saveClinicalTemplate(template) {
    return await new Template(template).save();
  }

  async getConsultationAccessLogs(consultationId) {
    return AuditLog.find({ resourceId: consultationId });
  }

  // ===== Helpers =====
  async getLatestRecord(patientId) {
    const record = await MedicalRecord.findOne({ patientId }).sort({ createdAt: -1 });
    if (!record) throw new AppError('Không tìm thấy hồ sơ bệnh án', 404, ERROR_CODES.MEDICAL_RECORD_NOT_FOUND);
    return record;
  }
}

module.exports = new ClinicalService();