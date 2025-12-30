// src/services/patient.service.js
const mongoose = require('mongoose');
const Patient = require('../models/patient.model');
const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');
const MedicalRecord = require('../models/medicalRecord.model');
const Prescription = require('../models/prescription.model');
const Bill = require('../models/bill.model');
const AuditLog = require('../models/auditLog.model');
const { ROLES } = require('../constants/roles');
const { generatePatientId, calculatePatientPriority } = require('../utils/healthcare.utils');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');

// Fallback LabResult model if missing from codebase
let LabResult;
try {
  // eslint-disable-next-line global-require
  LabResult = require('../models/labResult.model');
} catch (err) {
  const labResultSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    labOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabOrder' },
    results: mongoose.Schema.Types.Mixed,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }, { timestamps: true });
  LabResult = mongoose.models.LabResult || mongoose.model('LabResult', labResultSchema);
}

class PatientService {
  async registerPatient(data) {
    const userPayload = {
      email: data.email,
      password: data.password,
      role: ROLES.PATIENT,
      status: 'ACTIVE',
      personalInfo: {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        phone: data.phone,
        address: data.address,
        emergencyContact: data.emergencyInfo
      }
    };

    const user = await User.create(userPayload);

    const patient = await Patient.create({
      userId: user._id,
      patientId: await generatePatientId(),
      bloodType: data.bloodType,
      height: data.height,
      weight: data.weight,
      emergencyInfo: data.emergencyInfo,
      allergies: data.allergies || [],
      chronicConditions: data.chronicConditions || [],
      familyHistory: data.familyHistory || [],
      lifestyle: data.lifestyle,
      insurance: data.insurance,
      preferences: data.preferences,
      tags: data.tags || [],
      riskLevel: calculatePatientPriority({
        dateOfBirth: data.dateOfBirth,
        chronicConditions: data.chronicConditions,
        allergies: data.allergies
      })
    });

    return patient.populate('userId');
  }

  async searchPatients(query) {
    const { q, keyword, bloodType, riskLevel, page = 1, limit = 10 } = query;
    const searchTerm = q || keyword;
    const filter = {};

    if (bloodType) filter.bloodType = bloodType;
    if (riskLevel) filter.riskLevel = riskLevel;

    if (searchTerm) {
      // Search in User collection for names/phones
      const users = await User.find({
        role: ROLES.PATIENT,
        $or: [
          { 'personalInfo.firstName': new RegExp(searchTerm, 'i') },
          { 'personalInfo.lastName': new RegExp(searchTerm, 'i') },
          { 'personalInfo.phone': new RegExp(searchTerm, 'i') },
          { email: new RegExp(searchTerm, 'i') }
        ]
      }).select('_id');

      const userIds = users.map(u => u._id);

      filter.$or = [
        { patientId: new RegExp(searchTerm, 'i') },
        { tags: new RegExp(searchTerm, 'i') },
        { userId: { $in: userIds } }
      ];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Patient.find(filter).populate('userId').skip(skip).limit(parseInt(limit)),
      Patient.countDocuments(filter)
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

  async advancedSearch(params) {
    const filter = {};
    if (params.gender) filter['userId.personalInfo.gender'] = params.gender;
    if (params.ageRange) {
      const now = new Date();
      const minDate = new Date(now);
      const maxDate = new Date(now);
      minDate.setFullYear(now.getFullYear() - params.ageRange.max);
      maxDate.setFullYear(now.getFullYear() - params.ageRange.min);
      filter['userId.personalInfo.dateOfBirth'] = { $gte: minDate, $lte: maxDate };
    }
    if (params.chronicCondition) filter['chronicConditions.condition'] = new RegExp(params.chronicCondition, 'i');
    if (params.allergy) filter['allergies.allergen'] = new RegExp(params.allergy, 'i');

    return Patient.find(filter).populate('userId');
  }

  async getPatients(params) {
    const { page = 1, limit = 10, admissionStatus, riskLevel } = params;
    const filter = {};
    if (admissionStatus) filter.admissionStatus = admissionStatus;
    if (riskLevel) filter.riskLevel = riskLevel;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Patient.find(filter).populate('userId').skip(skip).limit(parseInt(limit)),
      Patient.countDocuments(filter)
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

  async getPatientById(id) {
    const patient = await Patient.findOne({ $or: [{ _id: id }, { patientId: id }] }).populate('userId');
    if (!patient) throw new AppError('Bệnh nhân không tồn tại', 404, ERROR_CODES.PATIENT_DATA_ACCESS_DENIED);
    return patient;
  }

  async getPatientSensitiveData(id, reason) {
    if (!reason) {
      throw new AppError('Cần lý do để truy cập thông tin nhạy cảm', 400, ERROR_CODES.PATIENT_DATA_ACCESS_DENIED);
    }
    const patient = await Patient.findById(id).select('+sensitiveFields');
    if (!patient) throw new AppError('Bệnh nhân không tồn tại', 404, ERROR_CODES.PATIENT_DATA_ACCESS_DENIED);

    await AuditLog.create({
      action: 'PATIENT_SENSITIVE_VIEW',
      resourceId: id,
      details: { reason }
    });

    return patient;
  }

  async updatePatient(id, data) {
    const patient = await Patient.findByIdAndUpdate(id, data, { new: true });
    if (!patient) throw new AppError('Bệnh nhân không tồn tại', 404, ERROR_CODES.PATIENT_DATA_ACCESS_DENIED);
    return patient;
  }

  async deletePatient(id) {
    return Patient.findByIdAndDelete(id);
  }

  async admitPatient(id, data) {
    const patient = await this.getPatientById(id);
    patient.admissionStatus = 'ADMITTED';
    patient.currentAdmission = {
      admissionDate: data.admissionDate || new Date(),
      department: data.department,
      room: data.room,
      bed: data.bed,
      diagnosis: data.diagnosis,
      attendingDoctor: data.attendingDoctor,
      admittedBy: data.admittedBy,
      notes: data.notes
    };
    patient.admissionHistory = patient.admissionHistory || [];
    patient.admissionHistory.push(patient.currentAdmission);
    await patient.save();
    return patient;
  }

  async dischargePatient(id, data) {
    const patient = await this.getPatientById(id);
    if (!patient.currentAdmission) {
      throw new AppError('Bệnh nhân chưa nhập viện', 400, ERROR_CODES.INVALID_STATE);
    }
    const historyEntry = patient.admissionHistory[patient.admissionHistory.length - 1];
    if (historyEntry) {
      historyEntry.dischargeDate = data.dischargeDate || new Date();
      historyEntry.dischargeReason = data.dischargeReason;
      historyEntry.condition = data.condition;
      historyEntry.dischargedBy = data.dischargedBy;
    }
    patient.admissionStatus = 'DISCHARGED';
    patient.currentAdmission = null;
    await patient.save();
    return patient;
  }

  async getPatientInsurance(id) {
    const patient = await Patient.findById(id);
    return patient.insurance;
  }

  async updatePatientInsurance(id, data) {
    return await Patient.findByIdAndUpdate(id, { insurance: data }, { new: true });
  }

  async getPatientAllergies(id) {
    const patient = await this.getPatientById(id);
    return patient.allergies;
  }

  async addPatientAllergy(id, data) {
    const patient = await this.getPatientById(id);
    patient.allergies.push(data);
    await patient.save();
    return data;
  }

  async updatePatientAllergy(id, allergyId, data) {
    const patient = await this.getPatientById(id);
    const allergy = patient.allergies.id(allergyId);
    Object.assign(allergy, data);
    await patient.save();
    return allergy;
  }

  async deletePatientAllergy(id, allergyId) {
    const patient = await this.getPatientById(id);
    patient.allergies.id(allergyId).remove();
    await patient.save();
    return { deleted: true };
  }

  async getPatientFamilyHistory(id) {
    const patient = await this.getPatientById(id);
    return patient.familyHistory;
  }

  async addFamilyHistory(id, data) {
    const patient = await this.getPatientById(id);
    patient.familyHistory.push(data);
    await patient.save();
    return data;
  }

  async updateFamilyHistory(id, historyId, data) {
    const patient = await this.getPatientById(id);
    const history = patient.familyHistory.id(historyId);
    Object.assign(history, data);
    await patient.save();
    return history;
  }

  async deleteFamilyHistory(id, historyId) {
    const patient = await this.getPatientById(id);
    patient.familyHistory.id(historyId).remove();
    await patient.save();
    return { deleted: true };
  }

  async getEmergencyContacts(id) {
    const patient = await this.getPatientById(id);
    return patient.emergencyContacts;
  }

  async addEmergencyContact(id, data) {
    const patient = await this.getPatientById(id);
    patient.emergencyContacts.push(data);
    await patient.save();
    return data;
  }

  async updateEmergencyContact(id, contactId, data) {
    const patient = await this.getPatientById(id);
    const contact = patient.emergencyContacts.id(contactId);
    Object.assign(contact, data);
    await patient.save();
    return contact;
  }

  async deleteEmergencyContact(id, contactId) {
    const patient = await this.getPatientById(id);
    patient.emergencyContacts.id(contactId).remove();
    await patient.save();
    return { deleted: true };
  }

  async getPatientConsents(id) {
    const patient = await this.getPatientById(id);
    return patient.consents;
  }

  async addPatientConsent(id, data) {
    const patient = await this.getPatientById(id);
    patient.consents.push(data);
    await patient.save();
    return data;
  }

  async exportPatientRecordPDF(id) {
    const patient = await this.getPatientById(id);
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.fontSize(18).text('HỒ SƠ BỆNH NHÂN', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Mã bệnh nhân: ${patient.patientId}`);
    doc.text(`Họ tên: ${patient.userId?.fullName || `${patient.userId?.personalInfo?.firstName || ''} ${patient.userId?.personalInfo?.lastName || ''}`}`);
    doc.text(`Nhóm máu: ${patient.bloodType}`);
    doc.text(`Chiều cao: ${patient.height || '-'} cm, Cân nặng: ${patient.weight || '-'} kg`);
    doc.end();
    return Buffer.concat(buffers);
  }

  async generatePatientQRCode(id) {
    return QRCode.toBuffer('Patient ID: ' + id);
  }

  async getPatientAccessLogs(id) {
    return AuditLog.find({ resourceId: id });
  }

  async getPatientStats() {
    const total = await Patient.countDocuments();
    const byRisk = await Patient.aggregate([
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ]);
    return { total, byRisk };
  }

  async getPatientStatistics(id) {
    const [appointments, prescriptions, bills] = await Promise.all([
      Appointment.countDocuments({ patientId: id }),
      Prescription.countDocuments({ patientId: id }),
      Bill.countDocuments({ patientId: id })
    ]);
    return { appointments, prescriptions, bills };
  }

  async getPatientAppointments(id, params) {
    return Appointment.find({ patientId: id });
  }

  async getPatientMedicalRecords(id, params) {
    return MedicalRecord.find({ patientId: id });
  }

  async getPatientPrescriptions(id, params) {
    return Prescription.find({ patientId: id });
  }

  async getPatientBills(id, params) {
    return Bill.find({ patientId: id });
  }

  async getPatientLabResults(id, params) {
    return LabResult.find({ patientId: id });
  }
}

module.exports = new PatientService();