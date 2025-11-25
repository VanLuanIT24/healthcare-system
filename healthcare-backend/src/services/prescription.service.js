const Prescription = require('../models/prescription.model');
const Medication = require('../models/medication.model');
const Patient = require('../models/patient.model');
const { generateMedicalCode } = require('../utils/healthcare.utils');
const { AppError } = require('../middlewares/error.middleware');

class PrescriptionService {
  
  // Tạo đơn thuốc cho bệnh nhân
  async createPrescription(patientId, prescriptionData, doctorId) {
    try {
      // Kiểm tra bệnh nhân tồn tại
      const patient = await Patient.findOne({ userId: patientId });
      if (!patient) {
        throw new AppError('Bệnh nhân không tồn tại', 404);
      }

      // Tạo prescription ID
      const prescriptionId = await generateMedicalCode('PR');

      // Kiểm tra tồn kho và thông tin thuốc
      for (let med of prescriptionData.medications) {
        const medication = await Medication.findById(med.medicationId);
        if (!medication) {
          throw new AppError(`Thuốc ${med.medicationId} không tồn tại`, 404);
        }
        
        // Kiểm tra tồn kho
        const stockCheck = medication.checkAvailability(med.totalQuantity);
        if (!stockCheck.available) {
          throw new AppError(`Thuốc ${medication.name} không đủ tồn kho. Còn ${stockCheck.currentStock}`, 400);
        }

        // Thêm thông tin thuốc vào prescription
        med.name = medication.name;
        med.genericName = medication.genericName;
      }

      // Kiểm tra tương tác thuốc
      const interactions = await this.checkDrugInteractions(prescriptionData.medications);

      const prescription = new Prescription({
        prescriptionId,
        patientId,
        doctorId,
        ...prescriptionData,
        drugInteractionsChecked: true,
        interactionsFound: interactions,
        createdBy: doctorId,
        status: 'ACTIVE'
      });

      await prescription.save();
      
      // Populate thông tin trước khi trả về
      await prescription.populate('medications.medicationId');
      await prescription.populate('patientId', 'personalInfo');
      
      return prescription;
    } catch (error) {
      throw error;
    }
  }

  // Lấy thông tin đơn thuốc
  async getPrescription(prescriptionId) {
    const prescription = await Prescription.findOne({ prescriptionId })
      .populate('patientId', 'personalInfo')
      .populate('doctorId', 'personalInfo')
      .populate('medications.medicationId')
      .populate('dispenseHistory.dispensedBy', 'personalInfo')
      .populate('dispenseHistory.medicationId');

    if (!prescription) {
      throw new AppError('Đơn thuốc không tồn tại', 404);
    }

    return prescription;
  }

  // Cập nhật đơn thuốc
  async updatePrescription(prescriptionId, updateData, userId) {
    const prescription = await Prescription.findOne({ prescriptionId });
    
    if (!prescription) {
      throw new AppError('Đơn thuốc không tồn tại', 404);
    }

    // Chỉ cho phép cập nhật nếu ở trạng thái DRAFT
    if (prescription.status !== 'DRAFT') {
      throw new AppError('Chỉ có thể cập nhật đơn thuốc ở trạng thái DRAFT', 400);
    }

    Object.assign(prescription, updateData);
    prescription.lastModifiedBy = userId;

    await prescription.save();
    return prescription;
  }

  // Lấy tất cả đơn thuốc của bệnh nhân
  async getPatientPrescriptions(patientId, options = {}) {
    const { page = 1, limit = 10, status } = options;
    const skip = (page - 1) * limit;

    const query = { patientId };
    if (status) {
      query.status = status;
    }

    const prescriptions = await Prescription.find(query)
      .populate('doctorId', 'personalInfo')
      .populate('medications.medicationId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Prescription.countDocuments(query);

    return {
      prescriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Phát thuốc cho bệnh nhân
  async dispenseMedication(prescriptionId, dispenseData, pharmacistId) {
    const prescription = await Prescription.findOne({ prescriptionId });
    
    if (!prescription) {
      throw new AppError('Đơn thuốc không tồn tại', 404);
    }

    if (prescription.status !== 'ACTIVE') {
      throw new AppError('Chỉ có thể phát thuốc cho đơn thuốc ACTIVE', 400);
    }

    // Kiểm tra thuốc trong đơn
    const medication = prescription.medications.id(dispenseData.medicationId);
    if (!medication) {
      throw new AppError('Thuốc không có trong đơn', 404);
    }

    // Kiểm tra tồn kho
    const medicationStock = await Medication.findById(dispenseData.medicationId);
    const stockCheck = medicationStock.checkAvailability(dispenseData.quantity);
    if (!stockCheck.available) {
      throw new AppError(`Không đủ tồn kho. Còn ${stockCheck.currentStock}`, 400);
    }

    // Phát thuốc
    prescription.dispenseMedication(
      dispenseData.medicationId,
      dispenseData.quantity,
      pharmacistId,
      {
        batchNumber: dispenseData.batchNumber,
        expiryDate: dispenseData.expiryDate,
        notes: dispenseData.notes
      }
    );

    // Cập nhật tồn kho
    medicationStock.updateStock(dispenseData.quantity, 'OUT');
    await medicationStock.save();

    await prescription.save();
    return prescription;
  }

  // Lấy đơn thuốc theo trạng thái (cho nhà thuốc)
  async getPharmacyOrders(status, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Prescription.find(query)
      .populate('patientId', 'personalInfo')
      .populate('doctorId', 'personalInfo')
      .populate('medications.medicationId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Prescription.countDocuments(query);

    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Kiểm tra tương tác thuốc
  async checkDrugInteraction(drugs) {
    // Trong thực tế, sẽ tích hợp với API kiểm tra tương tác thuốc
    // Ở đây mô phỏng logic cơ bản
    
    const interactions = [];
    const drugNames = drugs.map(d => d.name.toLowerCase());

    // Danh sách tương tác thuốc phổ biến (mô phỏng)
    const commonInteractions = [
      {
        drugs: ['warfarin', 'aspirin'],
        severity: 'MAJOR',
        description: 'Tăng nguy cơ chảy máu',
        recommendation: 'Theo dõi chặt chẽ chỉ số đông máu'
      },
      {
        drugs: ['simvastatin', 'clarithromycin'],
        severity: 'MAJOR', 
        description: 'Tăng nguy cơ tiêu cơ vân',
        recommendation: 'Tránh dùng đồng thời'
      }
    ];

    // Kiểm tra tương tác
    for (let interaction of commonInteractions) {
      const hasAllDrugs = interaction.drugs.every(drug => 
        drugNames.some(name => name.includes(drug))
      );
      
      if (hasAllDrugs) {
        interactions.push({
          medication1: interaction.drugs[0],
          medication2: interaction.drugs[1],
          severity: interaction.severity,
          description: interaction.description,
          recommendation: interaction.recommendation
        });
      }
    }

    return interactions;
  }

  // Ghi nhận bệnh nhân đã dùng thuốc
  async recordMedicationAdministration(patientId, medData, nurseId) {
    // Trong thực tế, sẽ có model MedicationAdministration riêng
    // Ở đây ghi log vào hệ thống
    
    const administrationRecord = {
      patientId,
      medicationId: medData.medicationId,
      prescriptionId: medData.prescriptionId,
      dose: medData.dose,
      time: medData.time,
      administeredBy: nurseId,
      notes: medData.notes,
      vitalSigns: medData.vitalSigns,
      status: 'ADMINISTERED'
    };

    // Ghi log vào database (trong thực tế sẽ là model riêng)
    console.log('Medication Administration Record:', administrationRecord);
    
    return administrationRecord;
  }

  // Hủy đơn thuốc
  async cancelPrescription(prescriptionId, reason, userId) {
    const prescription = await Prescription.findOne({ prescriptionId });
    
    if (!prescription) {
      throw new AppError('Đơn thuốc không tồn tại', 404);
    }

    if (!['DRAFT', 'ACTIVE'].includes(prescription.status)) {
      throw new AppError('Không thể hủy đơn thuốc ở trạng thái hiện tại', 400);
    }

    prescription.status = 'CANCELLED';
    prescription.notes = prescription.notes ? 
      `${prescription.notes}\nHủy: ${reason}` : `Hủy: ${reason}`;
    prescription.lastModifiedBy = userId;

    await prescription.save();
    return prescription;
  }

  // Lấy lịch sử sử dụng thuốc
  async getMedicationHistory(patientId, options = {}) {
    const { page = 1, limit = 20, medicationId } = options;
    const skip = (page - 1) * limit;

    const query = { patientId };
    if (medicationId) {
      query['medications.medicationId'] = medicationId;
    }

    const prescriptions = await Prescription.find(query)
      .populate('doctorId', 'personalInfo')
      .populate('medications.medicationId')
      .populate('dispenseHistory.medicationId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Tổng hợp lịch sử
    const history = prescriptions.flatMap(prescription => 
      prescription.medications.map(med => ({
        prescriptionId: prescription.prescriptionId,
        medication: med.name,
        genericName: med.genericName,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        prescribedDate: prescription.issueDate,
        prescribedBy: prescription.doctorId,
        status: prescription.status
      }))
    );

    const total = await Prescription.countDocuments(query);

    return {
      history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Kiểm tra thuốc có trong danh mục bảo hiểm
  async checkMedicationCoverage(patientId, medicationId) {
    const medication = await Medication.findById(medicationId);
    if (!medication) {
      throw new AppError('Thuốc không tồn tại', 404);
    }

    // Trong thực tế, sẽ tích hợp với hệ thống bảo hiểm
    // Ở đây mô phỏng kết quả
    
    const coverage = {
      medicationId: medication._id,
      medicationName: medication.name,
      covered: medication.insurance.covered,
      priorAuthorization: medication.insurance.priorAuthorization,
      coverageDetails: {
        patientCost: medication.insurance.covered ? medication.pricing.insurancePrice : medication.pricing.sellingPrice,
        insuranceCoverage: medication.insurance.covered ? (medication.pricing.sellingPrice - medication.pricing.insurancePrice) : 0
      },
      limitations: medication.insurance.quantityLimits ? 'Giới hạn số lượng' : 'Không giới hạn'
    };

    return coverage;
  }

  // Cập nhật trạng thái phát thuốc
  async updateDispenseStatus(prescriptionId, status, pharmacistId) {
    const validStatuses = ['DISPENSED', 'PARTIAL', 'PENDING'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Trạng thái không hợp lệ', 400);
    }

    const prescription = await Prescription.findOne({ prescriptionId });
    if (!prescription) {
      throw new AppError('Đơn thuốc không tồn tại', 404);
    }

    prescription.status = status;
    prescription.lastModifiedBy = pharmacistId;

    await prescription.save();
    return prescription;
  }

  // Kiểm tra số lượng thuốc tồn kho
  async getMedicationStock(medicationId) {
    const medication = await Medication.findById(medicationId);
    if (!medication) {
      throw new AppError('Thuốc không tồn tại', 404);
    }

    return {
      medicationId: medication._id,
      name: medication.name,
      currentStock: medication.stock.current,
      reorderLevel: medication.stock.reorderLevel,
      isLowStock: medication.isLowStock,
      isOutOfStock: medication.isOutOfStock,
      lastRestocked: medication.stock.lastRestocked
    };
  }

  // Thêm thuốc mới vào kho
  async addMedication(medicationData, userId) {
    const medicationId = await generateMedicalCode('MED');
    
    const medication = new Medication({
      medicationId,
      ...medicationData,
      createdBy: userId
    });

    await medication.save();
    return medication;
  }

  // Cập nhật thông tin thuốc
  async updateMedication(medicationId, updateData, userId) {
    const medication = await Medication.findOne({ medicationId });
    if (!medication) {
      throw new AppError('Thuốc không tồn tại', 404);
    }

    Object.assign(medication, updateData);
    medication.lastModifiedBy = userId;

    await medication.save();
    return medication;
  }
}

module.exports = new PrescriptionService();