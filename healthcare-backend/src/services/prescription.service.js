// src/services/prescription.service.js
const Prescription = require('../models/prescription.model');
const Medication = require('../models/medication.model');
const Patient = require('../models/patient.model');
const { generateMedicalCode } = require('../utils/healthcare.utils');
const { AppError } = require('../middlewares/error.middleware');
const PDFDocument = require('pdfkit');
const moment = require('moment');

class PrescriptionService {
  async createPrescription(data, doctorId) {
    const prescriptionId = `PR${generateMedicalCode(8)}`;

    const prescription = await Prescription.create({
      prescriptionId,
      doctorId,
      ...data,
      status: 'ACTIVE',
      issueDate: new Date()
    });

    await prescription.populate([
      { path: 'patientId', select: 'personalInfo' },
      { path: 'doctorId', select: 'personalInfo professionalInfo' },
      { path: 'medications.medicationId' }
    ]);

    // Check interactions & allergies
    const warnings = await this.validatePrescriptionSafety(prescription);

    return { prescription, warnings };
  }

  async validatePrescriptionSafety(prescription) {
    const warnings = { interactions: [], allergies: [] };

    // Check interactions
    const interactionResult = await this.checkDrugInteractions(
      prescription.medications.map(m => ({ name: m.name || m.medicationId.name, medicationId: m.medicationId._id || m.medicationId }))
    );
    if (interactionResult.hasInteractions) {
      warnings.interactions = interactionResult.interactions;
    }

    // Check allergies
    const allergyResult = await this.checkPatientAllergies(
      prescription.patientId._id,
      prescription.medications.map(m => m.medicationId._id || m.medicationId)
    );
    if (allergyResult.hasAllergies) {
      warnings.allergies = allergyResult.allergies;
    }

    return warnings.interactions.length || warnings.allergies.length ? warnings : null;
  }

  async getPrescription(id) {
    const prescription = await Prescription.findOne({
      $or: [{ _id: id }, { prescriptionId: id }]
    }).populate([
      'patientId',
      'doctorId',
      'medications.medicationId',
      'dispenseHistory.dispensedBy'
    ]);

    if (!prescription) throw new AppError('Không tìm thấy đơn thuốc', 404);
    return prescription;
  }

  async updatePrescription(id, data, updatedBy) {
    const prescription = await this.getPrescription(id);
    if (!['DRAFT', 'ACTIVE'].includes(prescription.status)) {
      throw new AppError('Không thể cập nhật đơn thuốc đã hoàn tất hoặc hủy', 400);
    }

    Object.assign(prescription, data);
    prescription.lastModifiedBy = updatedBy;
    await prescription.save();

    return prescription;
  }

  async cancelPrescription(id, reason, cancelledBy) {
    const prescription = await this.getPrescription(id);
    if (prescription.status === 'CANCELLED') {
      throw new AppError('Đơn thuốc đã bị hủy trước đó', 400);
    }

    prescription.status = 'CANCELLED';
    prescription.notes = prescription.notes ? `${prescription.notes}\nHủy: ${reason}` : `Hủy: ${reason}`;
    prescription.lastModifiedBy = cancelledBy;
    await prescription.save();

    return prescription;
  }

  async getPrescriptions(filters = {}) {
    const { page = 1, limit = 20, status, doctorId, patientId } = filters;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (doctorId) query.doctorId = doctorId;
    if (patientId) query.patientId = patientId;

    const [items, total] = await Promise.all([
      Prescription.find(query)
        .populate('patientId', 'personalInfo')
        .populate('doctorId', 'personalInfo')
        .sort({ issueDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Prescription.countDocuments(query)
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

  async getPatientPrescriptions(patientId, filters = {}) {
    return this.getPrescriptions({ ...filters, patientId });
  }

  async generatePrescriptionPDF(id) {
    const prescription = await this.getPrescription(id);
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // Header
    doc.fontSize(20).text('ĐƠN THUỐC', { align: 'center' });
    doc.moveDown();

    // Info
    doc.fontSize(12).text(`Mã đơn: ${prescription.prescriptionId}`);
    doc.text(`Ngày kê: ${moment(prescription.issueDate).format('DD/MM/YYYY')}`);
    doc.text(`Bác sĩ: ${prescription.doctorId.personalInfo.fullName}`);
    doc.text(`Bệnh nhân: ${prescription.patientId.personalInfo.fullName}`);
    doc.moveDown();

    // Medications
    prescription.medications.forEach((med, i) => {
      doc.text(`${i + 1}. ${med.name || med.medicationId.name}`);
      doc.text(`   Liều: ${med.dosage} - ${med.frequency}`);
      doc.text(`   Số lượng: ${med.totalQuantity} ${med.unit || ''}`);
      doc.moveDown(0.5);
    });

    doc.end();

    return Buffer.concat(buffers);
  }

  async approvePrescription(id, approvedBy) {
    const prescription = await this.getPrescription(id);
    prescription.approvedBy = approvedBy;
    prescription.approvalDate = new Date();
    await prescription.save();
    return prescription;
  }

  async dispenseMedication(prescriptionId, dispenseData, pharmacistId) {
    const prescription = await this.getPrescription(prescriptionId);

    const medIndex = prescription.medications.findIndex(
      m => (m.medicationId._id || m.medicationId).toString() === dispenseData.medicationId
    );

    if (medIndex === -1) throw new AppError('Thuốc không có trong đơn', 400);

    const medication = await Medication.findById(dispenseData.medicationId);
    if (medication.stock.current < dispenseData.quantity) {
      throw new AppError('Không đủ tồn kho', 400);
    }

    // Update stock
    medication.stock.current -= dispenseData.quantity;
    medication.stock.lastRestocked = new Date();
    await medication.save();

    // Record dispense
    prescription.dispenseHistory.push({
      ...dispenseData,
      dispensedBy: pharmacistId,
      date: new Date()
    });

    // Update status
    const totalDispensed = prescription.dispenseHistory.reduce((sum, d) => sum + d.quantity, 0);
    const totalPrescribed = prescription.medications.reduce((sum, m) => sum + m.totalQuantity, 0);

    if (totalDispensed >= totalPrescribed) {
      prescription.status = 'DISPENSED';
    }

    await prescription.save();
    return prescription;
  }

  async getDispenseHistory(id) {
    const prescription = await this.getPrescription(id);
    return prescription.dispenseHistory;
  }

  async checkDrugInteractions(medications) {
    const names = medications.map(m => m.name).filter(Boolean);
    if (!names.length) return { hasInteractions: false, interactions: [] };

    const dbMeds = await Medication.find({ name: { $in: names } });
    const interactions = [];

    dbMeds.forEach(med => {
      (med.safety?.interactions || []).forEach(interaction => {
        if (names.includes(interaction.medication)) {
          interactions.push({
            medication1: med.name,
            medication2: interaction.medication,
            severity: interaction.severity || 'UNKNOWN',
            description: interaction.effect
          });
        }
      });
    });

    return { hasInteractions: interactions.length > 0, interactions };
  }

  async checkPatientAllergies(patientId, medicationIds) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new AppError('Bệnh nhân không tồn tại', 404);
    }

    if (!patient.allergies?.length) return { hasAllergies: false, allergies: [] };

    const meds = await Medication.find({ _id: { $in: medicationIds } });
    const allergyHits = [];

    meds.forEach(med => {
      patient.allergies.forEach(allergy => {
        const match = [med.name, med.genericName, med.brandName]
          .filter(Boolean)
          .some(n => n.toLowerCase().includes(allergy.allergen.toLowerCase()));
        if (match) {
          allergyHits.push({
            medication: med.name,
            allergen: allergy.allergen,
            severity: allergy.severity,
            reaction: allergy.reaction
          });
        }
      });
    });

    return { hasAllergies: allergyHits.length > 0, allergies: allergyHits };
  }

  async getDosageSuggestions(medicationId, patientData) {
    const medication = await Medication.findById(medicationId);
    if (!medication) throw new AppError('Không tìm thấy thuốc', 404);

    const standard = `${medication.strength?.value || ''} ${medication.strength?.unit || ''} x 2 lần/ngày`.trim();
    let adjusted = null;

    if (patientData?.weight && patientData.weight < 40) {
      adjusted = 'Giảm 30% liều do cân nặng < 40kg';
    }

    if (patientData?.age && patientData.age > 65) {
      adjusted = 'Giảm 20% liều cho người cao tuổi';
    }

    return { standard, adjusted };
  }

  async searchMedications(query, filters = {}) {
    const regex = new RegExp(query, 'i');
    return await Medication.find({
      $or: [
        { name: regex },
        { genericName: regex },
        { brandName: regex },
        { medicationId: regex }
      ],
      status: 'ACTIVE',
      ...filters
    }).limit(20);
  }

  async getMedications(filters) {
    const { page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Medication.find({ status: 'ACTIVE' })
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Medication.countDocuments({ status: 'ACTIVE' })
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

  async getMedicationById(id) {
    const medication = await Medication.findById(id);
    if (!medication) throw new AppError('Không tìm thấy thuốc', 404);
    return medication;
  }

  async getLowStockAlerts() {
    return Medication.find({
      $expr: { $lte: ['$stock.current', '$stock.reorderLevel'] },
      status: 'ACTIVE'
    }).sort({ 'stock.current': 1 });
  }

  async getExpiringMedications(days) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    return await Medication.find({
      expiryDate: { $lte: expiryDate },
      status: 'ACTIVE'
    });
  }

  async getRecalledMedications() {
    return await Medication.find({ status: 'RECALLED' });
  }
}

module.exports = new PrescriptionService();