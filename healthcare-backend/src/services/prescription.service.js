const Prescription = require('../models/prescription.model');
const Medication = require('../models/medication.model');
const Patient = require('../models/patient.model');
const { generateMedicalCode } = require('../utils/healthcare.utils');
const { AppError } = require('../middlewares/error.middleware');

class PrescriptionService {
  
  /**
   * 💊 TẠO ĐƠN THUỐC CHO BỆNH NHÂN - CẢI TIẾN VỚI VALIDATION ĐẦY ĐỦ
   */
  async createPrescription(patientId, prescriptionData, doctorId) {
    try {
      console.log('💊 [PHARMACY] Creating prescription for patient:', patientId);

      // 🎯 KIỂM TRA BỆNH NHÂN TỒN TẠI VÀ LẤY THÔNG TIN
      const patient = await Patient.findOne({ userId: patientId })
        .populate('userId', 'personalInfo dateOfBirth');
      
      if (!patient) {
        throw new AppError('Bệnh nhân không tồn tại', 404);
      }

      // 🎯 TÍNH TUỔI VÀ LẤY CÂN NẶNG
      const patientAge = patient.userId?.dateOfBirth 
        ? Math.floor((new Date() - new Date(patient.userId.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
        : null;
      
      const patientWeight = patient.vitalSigns?.weight || null;

      console.log('👤 [PHARMACY] Patient info - Age:', patientAge, 'Weight:', patientWeight, 'kg');

      // 🎯 TẠO PRESCRIPTION ID
      const prescriptionId = await generateMedicalCode('PR');

      // 🎯 KIỂM TRA TỒN KHO VÀ THÔNG TIN THUỐC
      for (let med of prescriptionData.medications) {
        const medication = await Medication.findById(med.medicationId);
        if (!medication) {
          throw new AppError(`Thuốc ${med.medicationId} không tồn tại`, 404);
        }
        
        // ✅ KIỂM TRA TỒN KHO
        const stockCheck = medication.checkAvailability(med.totalQuantity);
        if (!stockCheck.available) {
          throw new AppError(
            `Thuốc ${medication.name} không đủ tồn kho. Còn ${stockCheck.currentStock}, cần ${med.totalQuantity}`, 
            400
          );
        }

        // ✅ VALIDATE LIỀU LƯỢNG DỰA TRÊN TUỔI
        if (patientAge !== null) {
          const ageValidation = this.validateDosageByAge(
            medication.name, 
            med.dosage, 
            patientAge
          );
          
          if (!ageValidation.valid) {
            console.warn('⚠️ [PHARMACY] Age-based dosage warning:', ageValidation.message);
            if (!med.warnings) med.warnings = [];
            med.warnings.push(ageValidation.message);
          }
        }

        // ✅ VALIDATE LIỀU LƯỢNG DỰA TRÊN CÂN NẶNG
        if (patientWeight !== null) {
          const weightValidation = this.validateDosageByWeight(
            medication.name,
            med.dosage,
            patientWeight
          );
          
          if (!weightValidation.valid) {
            console.warn('⚠️ [PHARMACY] Weight-based dosage warning:', weightValidation.message);
            if (!med.warnings) med.warnings = [];
            med.warnings.push(weightValidation.message);
          }
        }

        // 🎯 THÊM THÔNG TIN THUỐC VÀO PRESCRIPTION
        med.name = medication.name;
        med.genericName = medication.genericName;
        med.validatedForAge = patientAge;
        med.validatedForWeight = patientWeight;
      }

      // 🔴 KIỂM TRA TƯƠNG TÁC THUỐC
      const interactionCheck = await this.checkDrugInteractions(prescriptionData.medications);

      // 🚨 NẾU CÓ TƯƠNG TÁC NGUY HIỂM → BLOCK ĐƠN THUỐC
      if (interactionCheck.criticalCount > 0) {
        const criticalInteractions = interactionCheck.interactions
          .filter(i => i.severity === 'MAJOR' && i.action === 'BLOCK_PRESCRIPTION')
          .map(i => `${i.medication1} + ${i.medication2}: ${i.description}`)
          .join('; ');

        throw new AppError(
          `KHÔNG THỂ kê đơn do tương tác thuốc nguy hiểm: ${criticalInteractions}`,
          400,
          'CRITICAL_DRUG_INTERACTION'
        );
      }

      // ⚠️ CÓ TƯƠNG TÁC MAJOR NHƯNG CHO PHÉP (VỚI CẢNH BÁO)
      if (interactionCheck.hasInteractions) {
        console.warn('⚠️ [PHARMACY] Drug interactions detected:', interactionCheck.totalInteractions);
      }

      // 🎯 TẠO PRESCRIPTION
      const prescription = new Prescription({
        prescriptionId,
        patientId,
        doctorId,
        ...prescriptionData,
        drugInteractionsChecked: true,
        interactionsFound: interactionCheck.interactions || [],
        patientAgeAtPrescription: patientAge,
        patientWeightAtPrescription: patientWeight,
        createdBy: doctorId,
        status: interactionCheck.moderateCount > 0 ? 'PENDING_REVIEW' : 'ACTIVE'
      });

      await prescription.save();
      
      // 🎯 POPULATE THÔNG TIN TRƯỚC KHI TRẢ VỀ
      await prescription.populate('medications.medicationId');
      await prescription.populate('patientId', 'personalInfo');
      
      console.log('✅ [PHARMACY] Prescription created:', prescriptionId, 'Status:', prescription.status);

      return {
        prescription,
        interactionWarning: interactionCheck.hasInteractions ? interactionCheck : null
      };

    } catch (error) {
      console.error('❌ [PHARMACY] Create prescription failed:', error.message);
      throw error;
    }
  }

  /**
   * 👶 VALIDATE LIỀU LƯỢNG DỰA TRÊN TUỔI
   */
  validateDosageByAge(medicationName, dosage, age) {
    // Quy tắc liều lượng theo tuổi (ví dụ cơ bản)
    
    // Trẻ em dưới 12 tuổi
    if (age < 12) {
      // Paracetamol: 10-15 mg/kg/dose, max 60mg/kg/day
      if (medicationName.toLowerCase().includes('paracetamol')) {
        const doseMatch = dosage.match(/(\d+)\s*mg/);
        if (doseMatch) {
          const doseAmount = parseInt(doseMatch[1]);
          if (doseAmount > 500) {
            return {
              valid: false,
              message: `Liều paracetamol ${doseAmount}mg có thể quá cao cho trẻ ${age} tuổi (khuyến cáo <500mg/lần)`
            };
          }
        }
      }

      // Aspirin: KHÔNG dùng cho trẻ <12 tuổi (nguy cơ Reye syndrome)
      if (medicationName.toLowerCase().includes('aspirin')) {
        return {
          valid: false,
          message: `KHÔNG NÊN dùng aspirin cho trẻ dưới 12 tuổi (nguy cơ Reye syndrome)`
        };
      }
    }

    // Người cao tuổi (>65 tuổi)
    if (age > 65) {
      // Benzodiazepines: Giảm liều cho người cao tuổi
      if (medicationName.toLowerCase().includes('diazepam') || 
          medicationName.toLowerCase().includes('alprazolam')) {
        return {
          valid: true,
          message: `Cân nhắc giảm liều cho người cao tuổi ${age} tuổi (nguy cơ ngã, lú lẫn)`
        };
      }

      // Digoxin: Giảm liều cho người cao tuổi
      if (medicationName.toLowerCase().includes('digoxin')) {
        return {
          valid: true,
          message: `Người cao tuổi cần liều thấp hơn digoxin (0.125mg/ngày)`
        };
      }
    }

    return { valid: true };
  }

  /**
   * ⚖️ VALIDATE LIỀU LƯỢNG DỰA TRÊN CÂN NẶNG
   */
  validateDosageByWeight(medicationName, dosage, weight) {
    // Quy tắc liều lượng theo cân nặng (mg/kg)

    // Gentamicin: 5-7 mg/kg/day
    if (medicationName.toLowerCase().includes('gentamicin')) {
      const doseMatch = dosage.match(/(\d+)\s*mg/);
      if (doseMatch) {
        const doseAmount = parseInt(doseMatch[1]);
        const maxDose = weight * 7;
        if (doseAmount > maxDose) {
          return {
            valid: false,
            message: `Liều gentamicin ${doseAmount}mg vượt quá khuyến cáo cho cân nặng ${weight}kg (max: ${maxDose}mg/ngày)`
          };
        }
      }
    }

    // Vancomycin: 15-20 mg/kg/dose
    if (medicationName.toLowerCase().includes('vancomycin')) {
      const doseMatch = dosage.match(/(\d+)\s*mg/);
      if (doseMatch) {
        const doseAmount = parseInt(doseMatch[1]);
        const maxDose = weight * 20;
        if (doseAmount > maxDose) {
          return {
            valid: false,
            message: `Liều vancomycin ${doseAmount}mg vượt quá khuyến cáo cho cân nặng ${weight}kg (max: ${maxDose}mg/lần)`
          };
        }
      }
    }

    // Cảnh báo nếu bệnh nhân gầy hoặc béo phì
    if (weight < 40) {
      return {
        valid: true,
        message: `Bệnh nhân gầy (${weight}kg) - Cân nhắc giảm liều thuốc`
      };
    }

    if (weight > 100) {
      return {
        valid: true,
        message: `Bệnh nhân béo phì (${weight}kg) - Cân nhắc điều chỉnh liều dựa trên ideal body weight`
      };
    }

    return { valid: true };
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

    // Kiểm tra tồn kho - use medication.medicationId (the actual Medication document _id)
    const medicationStock = await Medication.findById(medication.medicationId);
    if (!medicationStock) {
      throw new AppError('Không tìm thấy thông tin thuốc', 404);
    }
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

  /**
   * 💊 KIỂM TRA TƯƠNG TÁC THUỐC - CẢI TIẾN VỚI DATABASE TƯƠNG TÁC MỞ RỘNG
   */
  async checkDrugInteraction(drugs) {
    try {
      console.log('💊 [PHARMACY] Checking drug interactions for', drugs.length, 'medications');

      const interactions = [];
      const drugNames = drugs.map(d => d.name ? d.name.toLowerCase() : '');

      // 🔴 DANH SÁCH TƯƠNG TÁC THUỐC NGHIÊM TRỌNG (MAJOR)
      const majorInteractions = [
        {
          drugs: ['warfarin', 'aspirin'],
          severity: 'MAJOR',
          category: 'BLEEDING_RISK',
          description: 'Tăng nguy cơ chảy máu nghiêm trọng do tác dụng kháng đông máu cộng hưởng',
          recommendation: 'KHÔNG NÊN dùng đồng thời. Nếu bắt buộc phải theo dõi chặt chẽ INR và dấu hiệu chảy máu',
          action: 'ALERT_DOCTOR'
        },
        {
          drugs: ['simvastatin', 'clarithromycin'],
          severity: 'MAJOR',
          category: 'MUSCLE_DAMAGE',
          description: 'Tăng nguy cơ tiêu cơ vân (rhabdomyolysis) nghiêm trọng',
          recommendation: 'TRÁNH dùng đồng thời. Tạm ngừng simvastatin khi dùng clarithromycin',
          action: 'ALERT_DOCTOR'
        },
        {
          drugs: ['metformin', 'contrast'],
          severity: 'MAJOR',
          category: 'KIDNEY_TOXICITY',
          description: 'Tăng nguy cơ toan chuyển hóa do lactate (lactic acidosis)',
          recommendation: 'Ngừng metformin trước khi chụp CT có thuốc cản quang ít nhất 48h',
          action: 'ALERT_DOCTOR'
        },
        {
          drugs: ['digoxin', 'amiodarone'],
          severity: 'MAJOR',
          category: 'CARDIAC_TOXICITY',
          description: 'Tăng nguy cơ độc tính tim do tăng nồng độ digoxin',
          recommendation: 'Giảm liều digoxin xuống 50% khi bắt đầu dùng amiodarone',
          action: 'ALERT_DOCTOR'
        },
        {
          drugs: ['ssri', 'maoi'],
          severity: 'MAJOR',
          category: 'SEROTONIN_SYNDROME',
          description: 'Nguy cơ hội chứng serotonin (serotonin syndrome) đe dọa tính mạng',
          recommendation: 'TRÁNH tuyệt đối. Cách nhau ít nhất 14 ngày khi chuyển đổi',
          action: 'BLOCK_PRESCRIPTION'
        }
      ];

      // 🟠 DANH SÁCH TƯƠNG TÁC VỪA PHẢI (MODERATE)
      const moderateInteractions = [
        {
          drugs: ['ibuprofen', 'aspirin'],
          severity: 'MODERATE',
          category: 'BLEEDING_RISK',
          description: 'Tăng nguy cơ xuất huyết tiêu hóa',
          recommendation: 'Theo dõi triệu chứng đau bụng, đại tiện phân đen',
          action: 'WARNING'
        },
        {
          drugs: ['amlodipine', 'simvastatin'],
          severity: 'MODERATE',
          category: 'MUSCLE_PAIN',
          description: 'Tăng nồng độ simvastatin trong máu, tăng nguy cơ đau cơ',
          recommendation: 'Không dùng simvastatin >20mg/ngày khi kết hợp với amlodipine',
          action: 'WARNING'
        },
        {
          drugs: ['ciprofloxacin', 'theophylline'],
          severity: 'MODERATE',
          category: 'DRUG_LEVEL_INCREASE',
          description: 'Tăng nồng độ theophylline, nguy cơ co giật',
          recommendation: 'Theo dõi nồng độ theophylline trong máu, điều chỉnh liều nếu cần',
          action: 'WARNING'
        },
        {
          drugs: ['omeprazole', 'clopidogrel'],
          severity: 'MODERATE',
          category: 'REDUCED_EFFICACY',
          description: 'Giảm hiệu quả kháng kết tập tiểu cầu của clopidogrel',
          recommendation: 'Cân nhắc dùng pantoprazole thay cho omeprazole',
          action: 'WARNING'
        }
      ];

      // 🟢 DANH SÁCH TƯƠNG TÁC NHẸ (MINOR)
      const minorInteractions = [
        {
          drugs: ['calcium', 'iron'],
          severity: 'MINOR',
          category: 'ABSORPTION',
          description: 'Giảm hấp thu sắt khi dùng đồng thời với calcium',
          recommendation: 'Cách nhau ít nhất 2 giờ khi uống',
          action: 'INFO'
        },
        {
          drugs: ['tetracycline', 'dairy'],
          severity: 'MINOR',
          category: 'ABSORPTION',
          description: 'Sữa làm giảm hấp thu tetracycline',
          recommendation: 'Uống thuốc trước hoặc sau 2 giờ khi ăn sản phẩm từ sữa',
          action: 'INFO'
        }
      ];

      // 🎯 KIỂM TRA TƯƠNG TÁC
      const allInteractions = [...majorInteractions, ...moderateInteractions, ...minorInteractions];

      for (let interaction of allInteractions) {
        const matchedDrugs = [];
        
        // Kiểm tra xem có ít nhất 2 thuốc trong danh sách tương tác không
        interaction.drugs.forEach(drugPattern => {
          const matched = drugNames.find(name => 
            name && (name.includes(drugPattern) || drugPattern.includes(name))
          );
          if (matched) matchedDrugs.push(matched);
        });

        if (matchedDrugs.length >= 2) {
          interactions.push({
            medication1: matchedDrugs[0],
            medication2: matchedDrugs[1],
            severity: interaction.severity,
            category: interaction.category,
            description: interaction.description,
            recommendation: interaction.recommendation,
            action: interaction.action,
            detected: true,
            checkedAt: new Date()
          });

          console.log(`⚠️ [PHARMACY] ${interaction.severity} interaction detected:`, matchedDrugs.join(' + '));
        }
      }

      // 🔴 NẾU CÓ TƯƠNG TÁC MAJOR/BLOCK → BẮT BUỘC CẢNH BÁO
      const criticalInteractions = interactions.filter(i => 
        i.severity === 'MAJOR' && i.action === 'BLOCK_PRESCRIPTION'
      );

      if (criticalInteractions.length > 0) {
        console.error('🚨 [PHARMACY] CRITICAL DRUG INTERACTIONS DETECTED - PRESCRIPTION SHOULD BE BLOCKED');
      }

      console.log('✅ [PHARMACY] Drug interaction check completed:', interactions.length, 'interactions found');

      return {
        hasInteractions: interactions.length > 0,
        totalInteractions: interactions.length,
        criticalCount: interactions.filter(i => i.severity === 'MAJOR').length,
        moderateCount: interactions.filter(i => i.severity === 'MODERATE').length,
        minorCount: interactions.filter(i => i.severity === 'MINOR').length,
        interactions: interactions,
        recommendation: criticalInteractions.length > 0 
          ? 'KHÔNG NÊN kê đơn - Tương tác thuốc nguy hiểm' 
          : interactions.length > 0 
            ? 'CẨN TRỌNG - Có tương tác thuốc cần theo dõi' 
            : 'KHÔNG CÓ tương tác thuốc đáng kể'
      };

    } catch (error) {
      console.error('❌ [PHARMACY] Check drug interaction failed:', error.message);
      return {
        hasInteractions: false,
        totalInteractions: 0,
        interactions: [],
        error: error.message
      };
    }
  }

  /**
   * 💊 WRAPPER METHOD - MAINTAIN COMPATIBILITY
   */
  async checkDrugInteractions(medications) {
    return await this.checkDrugInteraction(medications);
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

  /**
   * 💊 THÊM THUỐC VÀO ĐƠN THUỐC - PRESC-1
   */
  async addMedicationToPrescription(prescriptionId, medicationData) {
    try {
      console.log('💊 [PHARMACY] Adding medication to prescription:', prescriptionId);

      const prescription = await Prescription.findById(prescriptionId);
      if (!prescription) {
        throw new AppError('Không tìm thấy đơn thuốc', 404);
      }

      if (prescription.status === 'CANCELLED') {
        throw new AppError('Không thể thêm thuốc vào đơn đã hủy', 400);
      }

      // Kiểm tra thuốc tồn tại
      const medication = await Medication.findById(medicationData.medicationId);
      if (!medication) {
        throw new AppError('Không tìm thấy thuốc', 404);
      }

      // Kiểm tra tồn kho
      const totalQty = medicationData.totalQuantity || medicationData.quantity || 0;
      const stockCheck = medication.checkAvailability(totalQty);
      if (!stockCheck.available) {
        throw new AppError(
          `Thuốc ${medication.name} không đủ tồn kho. Còn ${stockCheck.currentStock}, cần ${totalQty}`,
          400
        );
      }

      // Thêm thuốc vào đơn
      prescription.medications.push(medicationData);
      await prescription.save();

      await prescription.populate('medications.medicationId');
      return prescription;

    } catch (error) {
      console.error('❌ [PHARMACY] Add medication to prescription failed:', error.message);
      throw error;
    }
  }

  /**
   * 💊 CẬP NHẬT THUỐC TRONG ĐƠN - PRESC-2
   */
  async updateMedicationInPrescription(prescriptionId, medicationId, updateData) {
    try {
      console.log('💊 [PHARMACY] Updating medication in prescription:', prescriptionId);

      const prescription = await Prescription.findById(prescriptionId);
      if (!prescription) {
        throw new AppError('Không tìm thấy đơn thuốc', 404);
      }

      if (prescription.status === 'CANCELLED') {
        throw new AppError('Không thể cập nhật đơn đã hủy', 400);
      }

      // Tìm thuốc trong đơn
      const medIndex = prescription.medications.findIndex(
        med => med.medicationId.toString() === medicationId
      );

      if (medIndex === -1) {
        throw new AppError('Không tìm thấy thuốc trong đơn', 404);
      }

      // Cập nhật thông tin
      Object.assign(prescription.medications[medIndex], updateData);
      await prescription.save();

      await prescription.populate('medications.medicationId');
      return prescription;

    } catch (error) {
      console.error('❌ [PHARMACY] Update medication in prescription failed:', error.message);
      throw error;
    }
  }
}

module.exports = new PrescriptionService();