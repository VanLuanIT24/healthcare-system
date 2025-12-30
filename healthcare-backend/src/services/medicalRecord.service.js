// src/services/medicalRecord.service.js
const MedicalRecord = require('../models/medicalRecord.model');
const Patient = require('../models/patient.model');
const User = require('../models/user.model');
const { generateMedicalCode } = require('../utils/healthcare.utils');
const { AppError } = require('../middlewares/error.middleware');

class MedicalRecordService {
  async createMedicalRecord(data, createdBy) {
    const { patientId, ...recordData } = data;

    const patient = await Patient.findById(patientId);
    if (!patient) throw new AppError('Không tìm thấy bệnh nhân', 404);

    const record = await MedicalRecord.create({
      recordId: generateMedicalCode('MR'),
      patientId,
      ...recordData,
      createdBy
    });

    return record;
  }

  async getMedicalRecord(recordId) {
    const record = await MedicalRecord.findOne({ recordId })
      .populate('patientId')
      .populate('doctorId')
      .populate('createdBy')
      .populate('lastModifiedBy');

    if (!record) throw new AppError('Không tìm thấy hồ sơ bệnh án', 404);
    return record;
  }

  async getPatientMedicalRecords(patientId, filters = {}) {
    const { page = 1, limit = 10, status, visitType, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const query = { patientId };
    if (status) query.status = status;
    if (visitType) query.visitType = visitType;
    if (startDate || endDate) {
      query.visitDate = {};
      if (startDate) query.visitDate.$gte = new Date(startDate);
      if (endDate) query.visitDate.$lte = new Date(endDate);
    }

    const [records, total] = await Promise.all([
      MedicalRecord.find(query)
        .populate('patientId')
        .populate('doctorId')
        .sort({ visitDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      MedicalRecord.countDocuments(query)
    ]);

    return {
      records,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateMedicalRecord(recordId, data, updatedBy) {
    const record = await MedicalRecord.findOne({ recordId });
    if (!record) throw new AppError('Không tìm thấy hồ sơ bệnh án', 404);

    Object.assign(record, data);
    record.lastModifiedBy = updatedBy;
    await record.save();

    return record;
  }

  async recordVitalSigns(patientId, vitals, recordedBy) {
    const record = await MedicalRecord.findOne({ patientId }).sort({ visitDate: -1 });
    if (!record) throw new AppError('Không tìm thấy hồ sơ bệnh án', 404);

    record.vitalSigns = {
      ...record.vitalSigns,
      ...vitals,
      recordedAt: new Date(),
      recordedBy
    };

    await record.save();
    return record;
  }

  async getVitalSignsHistory(patientId, filters = {}) {
    const { timeframe = '7d' } = filters;
    const days = timeframe === '24h' ? 1 : timeframe === '30d' ? 30 : 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await MedicalRecord.find({
      patientId,
      'vitalSigns.recordedAt': { $gte: startDate }
    }).sort({ 'vitalSigns.recordedAt': -1 });

    return records.map(r => r.vitalSigns);
  }

  async addMedicalHistory(patientId, history, addedBy) {
    const record = await MedicalRecord.findOne({ patientId }).sort({ visitDate: -1 });
    if (!record) throw new AppError('Không tìm thấy hồ sơ bệnh án', 404);

    if (!record.medicalHistory) record.medicalHistory = [];
    record.medicalHistory.push({ ...history, addedBy, addedAt: new Date() });

    await record.save();
    return record;
  }

  async getMedicalHistory(patientId) {
    const records = await MedicalRecord.find({ patientId })
      .select('medicalHistory')
      .sort({ visitDate: -1 });

    return records.flatMap(r => r.medicalHistory || []);
  }

  async addSurgicalHistory(patientId, surgery, addedBy) {
    const record = await MedicalRecord.findOne({ patientId }).sort({ visitDate: -1 });
    if (!record) throw new AppError('Không tìm thấy hồ sơ bệnh án', 404);

    if (!record.surgicalHistory) record.surgicalHistory = [];
    record.surgicalHistory.push({ ...surgery, addedBy, addedAt: new Date() });

    await record.save();
    return record;
  }

  async getSurgicalHistory(patientId) {
    const records = await MedicalRecord.find({ patientId })
      .select('surgicalHistory')
      .sort({ visitDate: -1 });

    return records.flatMap(r => r.surgicalHistory || []);
  }

  async getObstetricHistory(patientId) {
    const records = await MedicalRecord.find({ patientId })
      .select('obstetricHistory')
      .sort({ visitDate: -1 });

    return records.flatMap(r => r.obstetricHistory || []);
  }

  async recordClinicalFindings(recordId, findings, recordedBy) {
    const record = await MedicalRecord.findOne({ recordId });
    if (!record) throw new AppError('Không tìm thấy hồ sơ bệnh án', 404);

    record.clinicalFindings = {
      ...record.clinicalFindings,
      ...findings,
      recordedBy,
      recordedAt: new Date()
    };

    await record.save();
    return record;
  }

  async archiveMedicalRecord(recordId, archivedBy) {
    const record = await MedicalRecord.findOne({ recordId });
    if (!record) throw new AppError('Không tìm thấy hồ sơ bệnh án', 404);

    record.status = 'ARCHIVED';
    record.archivedBy = archivedBy;
    record.archivedAt = new Date();

    await record.save();
    return record;
  }

  async searchMedicalRecordsByDiagnosis(diagnosis, filters = {}) {
    const { page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const records = await MedicalRecord.find({
      'diagnoses.diagnosis': new RegExp(diagnosis, 'i')
    })
      .populate('patientId')
      .populate('doctorId')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MedicalRecord.countDocuments({
      'diagnoses.diagnosis': new RegExp(diagnosis, 'i')
    });

    return {
      records,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getMedicalRecordsStats(timeframe = '30d') {
    const days = timeframe === '7d' ? 7 : timeframe === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await MedicalRecord.aggregate([
      { $match: { visitDate: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    return stats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
  }
}

module.exports = new MedicalRecordService();