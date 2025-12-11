const MedicalRecord = require('../models/medicalRecord.model');
const Patient = require('../models/patient.model');
const User = require('../models/user.model');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const { generateMedicalCode } = require('../utils/healthcare.utils');

/**
 * 🏥 MEDICAL RECORD SERVICE - BUSINESS LOGIC CHO HỒ SƠ BỆNH ÁN
 */

class MedicalRecordService {
  
  /**
   * 🎯 TẠO HỒ SƠ BỆNH ÁN MỚI
   */
  async createMedicalRecord(patientId, recordData, createdBy) {
    try {
      console.log('🏥 [MEDICAL] Creating medical record for patient:', patientId);

      // 🎯 KIỂM TRA BỆNH NHÂN
      const patient = await Patient.findById(patientId);
      
      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, ERROR_CODES.PATIENT_NOT_FOUND);
      }

      // 🎯 KIỂM TRA BÁC SĨ
      const doctor = await User.findOne({ 
        _id: recordData.doctorId, 
        role: 'DOCTOR',
        status: 'ACTIVE'
      });
      
      if (!doctor) {
        throw new AppError('Không tìm thấy bác sĩ', 404, ERROR_CODES.DOCTOR_NOT_FOUND);
      }

      // 🎯 TẠO MEDICAL RECORD ID
      const recordId = `MR${generateMedicalCode(8)}`;

      // 🎯 TẠO HỒ SƠ BỆNH ÁN
      const medicalRecord = new MedicalRecord({
        ...recordData,
        recordId,
        patientId,
        createdBy,
        status: 'DRAFT'
      });

      await medicalRecord.save();

      // 🎯 POPULATE KẾT QUẢ
      const result = await MedicalRecord.findById(medicalRecord._id)
        .populate('patientId', 'personalInfo email phone dateOfBirth gender address')
        .populate('doctorId', 'personalInfo email phone specialization department')
        .populate('createdBy', 'personalInfo email');

      console.log('✅ [MEDICAL] Medical record created successfully:', recordId);
      return result;

    } catch (error) {
      console.error('❌ [MEDICAL] Medical record creation failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN HỒ SƠ BỆNH ÁN THEO ID
   */
  async getMedicalRecord(recordId) {
    try {
      console.log('🔍 [MEDICAL] Getting medical record:', recordId);

      const medicalRecord = await MedicalRecord.findOne({ recordId })
        .populate('patientId', 'personalInfo email phone dateOfBirth gender address')
        .populate('doctorId', 'personalInfo email phone specialization department')
        .populate('createdBy', 'personalInfo email')
        .populate('lastModifiedBy', 'personalInfo email');

      if (!medicalRecord) {
        throw new AppError('Không tìm thấy hồ sơ bệnh án', 404, ERROR_CODES.MEDICAL_RECORD_NOT_FOUND);
      }

      return medicalRecord;

    } catch (error) {
      console.error('❌ [MEDICAL] Get medical record failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY TẤT CẢ HỒ SƠ BỆNH ÁN CỦA BỆNH NHÂN
   */
  async getPatientMedicalRecords(patientId, filters = {}) {
    try {
      console.log('📋 [MEDICAL] Getting medical records for patient:', patientId);

      const { 
        page = 1, 
        limit = 10,
        visitType,
        status,
        startDate,
        endDate,
        sortBy = 'visitDate',
        sortOrder = 'desc'
      } = filters;

      const skip = (page - 1) * limit;

      // 🎯 BUILD QUERY
      let query = { patientId };
      
      if (visitType) query.visitType = visitType;
      if (status) query.status = status;

      if (startDate || endDate) {
        query.visitDate = {};
        if (startDate) query.visitDate.$gte = new Date(startDate);
        if (endDate) query.visitDate.$lte = new Date(endDate);
      }

      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // 🎯 THỰC HIỆN TÌM KIẾM
      const [medicalRecords, total] = await Promise.all([
        MedicalRecord.find(query)
          .populate('patientId', 'personalInfo email phone dateOfBirth gender')
          .populate('doctorId', 'personalInfo email specialization department')
          .sort(sort)
          .skip(skip)
          .limit(limit),
        MedicalRecord.countDocuments(query)
      ]);

      // 🎯 TÍNH TOÁN PHÂN TRANG
      const totalPages = Math.ceil(total / limit);

      return {
        medicalRecords,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };

    } catch (error) {
      console.error('❌ [MEDICAL] Get patient medical records failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 CẬP NHẬT HỒ SƠ BỆNH ÁN
   */
  async updateMedicalRecord(recordId, updateData, updatedBy) {
    try {
      console.log('✏️ [MEDICAL] Updating medical record:', recordId);

      const medicalRecord = await MedicalRecord.findOne({ recordId });
      
      if (!medicalRecord) {
        throw new AppError('Không tìm thấy hồ sơ bệnh án', 404, ERROR_CODES.MEDICAL_RECORD_NOT_FOUND);
      }

      // 🎯 KIỂM TRA QUYỀN CHỈNH SỬA
      if (medicalRecord.status === 'ARCHIVED') {
        throw new AppError('Không thể chỉnh sửa hồ sơ đã lưu trữ', 400);
      }

      // 🎯 CẬP NHẬT THÔNG TIN
      const allowedFields = [
        'chiefComplaint', 'historyOfPresentIllness', 'symptoms', 'vitalSigns',
        'physicalExamination', 'diagnoses', 'treatmentPlan', 'privacyLevel'
      ];
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          medicalRecord[field] = updateData[field];
        }
      });

      medicalRecord.lastModifiedBy = updatedBy;

      // 🎯 NẾU CÓ ĐỦ THÔNG TIN, CHUYỂN SANG TRẠNG THÁI COMPLETED
      if (medicalRecord.status === 'DRAFT' && 
          medicalRecord.chiefComplaint && 
          medicalRecord.diagnoses && medicalRecord.diagnoses.length > 0) {
        medicalRecord.status = 'COMPLETED';
      }

      await medicalRecord.save();

      // 🎯 LẤY KẾT QUẢ MỚI NHẤT
      const updatedRecord = await MedicalRecord.findOne({ recordId })
        .populate('patientId', 'personalInfo email phone dateOfBirth gender')
        .populate('doctorId', 'personalInfo email specialization department')
        .populate('lastModifiedBy', 'personalInfo email');

      console.log('✅ [MEDICAL] Medical record updated:', recordId);
      return updatedRecord;

    } catch (error) {
      console.error('❌ [MEDICAL] Update medical record failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 GHI NHẬN DẤU HIỆU SINH TỒN
   */
  async recordVitalSigns(patientId, vitalData, recordedBy) {
    try {
      console.log('❤️ [MEDICAL] Recording vital signs for patient:', patientId);

      // 🎯 KIỂM TRA BỆNH NHÂN
      const patient = await User.findOne({ 
        _id: patientId, 
        role: 'PATIENT',
        status: 'ACTIVE'
      });
      
      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, ERROR_CODES.PATIENT_NOT_FOUND);
      }

      // 🎯 TÌM HỒ SƠ BỆNH ÁN GẦN NHẤT HOẶC TẠO MỚI
      let medicalRecord = await MedicalRecord.findOne({
        patientId,
        status: { $in: ['DRAFT', 'COMPLETED'] }
      }).sort({ visitDate: -1 });

      const now = new Date();

      // 🎯 NẾU KHÔNG CÓ HỒ SƠ HOẶC HỒ SƠ CŨ HƠN 24H, TẠO HỒ SƠ MỚI
      if (!medicalRecord || 
          (now - medicalRecord.visitDate) > (24 * 60 * 60 * 1000)) {
        
        const recordId = `MR${generateMedicalCode(8)}`;
        
        medicalRecord = new MedicalRecord({
          recordId,
          patientId,
          doctorId: recordedBy, // Có thể là nurse recording vitals
          department: 'EMERGENCY', // Default department
          visitType: 'OUTPATIENT',
          visitDate: now,
          chiefComplaint: 'Theo dõi dấu hiệu sinh tồn',
          status: 'DRAFT',
          createdBy: recordedBy
        });
      }

      // 🎯 CẬP NHẬT DẤU HIỆU SINH TỒN
      medicalRecord.vitalSigns = {
        ...medicalRecord.vitalSigns,
        ...vitalData,
        recordedAt: now,
        recordedBy
      };

      medicalRecord.lastModifiedBy = recordedBy;
      await medicalRecord.save();

      // 🎯 POPULATE KẾT QUẢ
      const result = await MedicalRecord.findById(medicalRecord._id)
        .populate('patientId', 'personalInfo email phone dateOfBirth gender')
        .populate('doctorId', 'personalInfo email')
        .populate('lastModifiedBy', 'personalInfo email');

      console.log('✅ [MEDICAL] Vital signs recorded for patient:', patientId);
      return result;

    } catch (error) {
      console.error('❌ [MEDICAL] Record vital signs failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY LỊCH SỬ DẤU HIỆU SINH TỒN
   */
  async getVitalSignsHistory(patientId, timeframe = '7d') {
    try {
      console.log('📊 [MEDICAL] Getting vital signs history for patient:', patientId);

      // 🎯 TÍNH THỜI GIAN BẮT ĐẦU
      const now = new Date();
      let startDate = new Date();
      
      switch (timeframe) {
        case '24h':
          startDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 7);
      }

      // 🎯 TÌM CÁC HỒ SƠ TRONG KHOẢNG THỜI GIAN
      const medicalRecords = await MedicalRecord.find({
        patientId,
        visitDate: { $gte: startDate },
        'vitalSigns.recordedAt': { $exists: true }
      })
      .select('visitDate vitalSigns')
      .sort({ visitDate: 1 });

      // 🎯 TRÍCH XUẤT DỮ LIỆU DẤU HIỆU SINH TỒN
      const vitalHistory = {
        bloodPressure: [],
        heartRate: [],
        respiratoryRate: [],
        temperature: [],
        oxygenSaturation: [],
        height: [],
        weight: []
      };

      medicalRecords.forEach(record => {
        const { vitalSigns, visitDate } = record;
        if (vitalSigns) {
          if (vitalSigns.bloodPressure) {
            vitalHistory.bloodPressure.push({
              date: visitDate,
              systolic: vitalSigns.bloodPressure.systolic,
              diastolic: vitalSigns.bloodPressure.diastolic
            });
          }
          if (vitalSigns.heartRate) {
            vitalHistory.heartRate.push({
              date: visitDate,
              value: vitalSigns.heartRate
            });
          }
          if (vitalSigns.respiratoryRate) {
            vitalHistory.respiratoryRate.push({
              date: visitDate,
              value: vitalSigns.respiratoryRate
            });
          }
          if (vitalSigns.temperature) {
            vitalHistory.temperature.push({
              date: visitDate,
              value: vitalSigns.temperature
            });
          }
          if (vitalSigns.oxygenSaturation) {
            vitalHistory.oxygenSaturation.push({
              date: visitDate,
              value: vitalSigns.oxygenSaturation
            });
          }
          if (vitalSigns.height) {
            vitalHistory.height.push({
              date: visitDate,
              value: vitalSigns.height
            });
          }
          if (vitalSigns.weight) {
            vitalHistory.weight.push({
              date: visitDate,
              value: vitalSigns.weight
            });
          }
        }
      });

      return {
        patientId,
        timeframe,
        startDate,
        endDate: now,
        vitalHistory,
        totalRecords: medicalRecords.length
      };

    } catch (error) {
      console.error('❌ [MEDICAL] Get vital signs history failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 THÊM TIỀN SỬ BỆNH LÝ
   */
  async addMedicalHistory(patientId, historyData, addedBy) {
    try {
      console.log('📝 [MEDICAL] Adding medical history for patient:', patientId);

      // 🎯 TÌM HOẶC TẠO HỒ SƠ BỆNH ÁN CHÍNH
      let medicalRecord = await MedicalRecord.findOne({
        patientId,
        visitType: 'OUTPATIENT',
        status: { $in: ['DRAFT', 'COMPLETED'] }
      }).sort({ visitDate: -1 });

      const now = new Date();

      if (!medicalRecord) {
        const recordId = `MR${generateMedicalCode(8)}`;
        
        medicalRecord = new MedicalRecord({
          recordId,
          patientId,
          doctorId: addedBy,
          department: 'GENERAL',
          visitType: 'OUTPATIENT',
          visitDate: now,
          chiefComplaint: 'Cập nhật tiền sử bệnh lý',
          status: 'DRAFT',
          createdBy: addedBy
        });
      }

      // 🎯 THÊM VÀO LỊCH SỬ BỆNH LÝ
      if (!medicalRecord.treatmentPlan) {
        medicalRecord.treatmentPlan = {};
      }

      if (!medicalRecord.treatmentPlan.medicalHistory) {
        medicalRecord.treatmentPlan.medicalHistory = [];
      }

      medicalRecord.treatmentPlan.medicalHistory.push({
        ...historyData,
        addedBy,
        addedAt: now
      });

      medicalRecord.lastModifiedBy = addedBy;
      await medicalRecord.save();

      console.log('✅ [MEDICAL] Medical history added for patient:', patientId);
      return await this.getMedicalRecord(medicalRecord.recordId);

    } catch (error) {
      console.error('❌ [MEDICAL] Add medical history failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY TOÀN BỘ TIỀN SỬ BỆNH LÝ
   */
  async getMedicalHistory(patientId) {
    try {
      console.log('📚 [MEDICAL] Getting medical history for patient:', patientId);

      // 🎯 LẤY TẤT CẢ HỒ SƠ BỆNH ÁN
      const medicalRecords = await MedicalRecord.find({ patientId })
        .select('visitDate treatmentPlan diagnoses chiefComplaint')
        .sort({ visitDate: -1 });

      // 🎯 TRÍCH XUẤT THÔNG TIN TIỀN SỬ
      const medicalHistory = {
        chronicConditions: [],
        surgeries: [],
        allergies: [],
        medications: [],
        familyHistory: [],
        encounterHistory: []
      };

      medicalRecords.forEach(record => {
        // 🎯 THÊM VÀO LỊCH SỬ KHÁM BỆNH
        medicalHistory.encounterHistory.push({
          date: record.visitDate,
          chiefComplaint: record.chiefComplaint,
          diagnoses: record.diagnoses
        });

        // 🎯 TRÍCH XUẤT THÔNG TIN TỪ TREATMENT PLAN
        if (record.treatmentPlan && record.treatmentPlan.medicalHistory) {
          record.treatmentPlan.medicalHistory.forEach(history => {
            switch (history.category) {
              case 'CHRONIC_CONDITION':
                medicalHistory.chronicConditions.push(history);
                break;
              case 'SURGERY':
                medicalHistory.surgeries.push(history);
                break;
              case 'ALLERGY':
                medicalHistory.allergies.push(history);
                break;
              case 'MEDICATION':
                medicalHistory.medications.push(history);
                break;
              case 'FAMILY_HISTORY':
                medicalHistory.familyHistory.push(history);
                break;
            }
          });
        }
      });

      return {
        patientId,
        medicalHistory,
        totalEncounters: medicalRecords.length
      };

    } catch (error) {
      console.error('❌ [MEDICAL] Get medical history failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY LỊCH SỬ PHẪU THUẬT
   */
  async getSurgicalHistory(patientId) {
    try {
      console.log('🔪 [MEDICAL] Getting surgical history for patient:', patientId);

      const medicalHistory = await this.getMedicalHistory(patientId);
      
      return {
        patientId,
        surgeries: medicalHistory.medicalHistory.surgeries,
        totalSurgeries: medicalHistory.medicalHistory.surgeries.length
      };

    } catch (error) {
      console.error('❌ [MEDICAL] Get surgical history failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY TIỀN SỬ SẢN KHOA (VỚI BỆNH NHÂN NỮ)
   */
  async getObstetricHistory(patientId) {
    try {
      console.log('🤰 [MEDICAL] Getting obstetric history for patient:', patientId);

      // 🎯 KIỂM TRA GIỚI TÍNH BỆNH NHÂN
      const patient = await User.findById(patientId);
      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404);
      }

      if (patient.personalInfo.gender !== 'FEMALE') {
        throw new AppError('Chỉ áp dụng cho bệnh nhân nữ', 400);
      }

      const medicalHistory = await this.getMedicalHistory(patientId);
      
      // 🎯 LỌC THÔNG TIN SẢN KHOA
      const obstetricHistory = {
        pregnancies: medicalHistory.medicalHistory.medications.filter(med => 
          med.category === 'PREGNANCY' || (med.condition && med.condition.toLowerCase().includes('thai'))
        ),
        deliveries: medicalHistory.medicalHistory.surgeries.filter(surgery =>
          (surgery.condition && surgery.condition.toLowerCase().includes('sinh')) || surgery.category === 'DELIVERY'
        ),
        complications: medicalHistory.medicalHistory.chronicConditions.filter(condition =>
          (condition.condition && condition.condition.toLowerCase().includes('sản')) || condition.category === 'OBSTETRIC'
        )
      };

      return {
        patientId,
        patientName: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
        obstetricHistory,
        summary: {
          totalPregnancies: obstetricHistory.pregnancies.length,
          totalDeliveries: obstetricHistory.deliveries.length,
          hasComplications: obstetricHistory.complications.length > 0
        }
      };

    } catch (error) {
      console.error('❌ [MEDICAL] Get obstetric history failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LƯU TRỮ HỒ SƠ BỆNH ÁN
   */
  async archiveMedicalRecord(recordId, archivedBy) {
    try {
      console.log('📦 [MEDICAL] Archiving medical record:', recordId);

      const medicalRecord = await MedicalRecord.findOne({ recordId });
      
      if (!medicalRecord) {
        throw new AppError('Không tìm thấy hồ sơ bệnh án', 404, ERROR_CODES.MEDICAL_RECORD_NOT_FOUND);
      }

      if (medicalRecord.status === 'ARCHIVED') {
        throw new AppError('Hồ sơ đã được lưu trữ', 400);
      }

      // 🎯 CHUYỂN SANG TRẠNG THÁI LƯU TRỮ
      medicalRecord.status = 'ARCHIVED';
      medicalRecord.lastModifiedBy = archivedBy;
      await medicalRecord.save();

      console.log('✅ [MEDICAL] Medical record archived:', recordId);
      return await this.getMedicalRecord(recordId);

    } catch (error) {
      console.error('❌ [MEDICAL] Archive medical record failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 THÊM THÔNG TIN PHẪU THUẬT VÀO LỊCH SỬ
   */
  async addSurgicalHistory(patientId, surgeryData, addedBy) {
    try {
      console.log('🔪 [MEDICAL] Adding surgical history for patient:', patientId);

      const surgicalHistoryData = {
        ...surgeryData,
        category: 'SURGERY',
        addedBy,
        addedAt: new Date()
      };

      // 🎯 SỬ DỤNG HÀM addMedicalHistory ĐỂ THÊM
      const result = await this.addMedicalHistory(patientId, surgicalHistoryData, addedBy);

      console.log('✅ [MEDICAL] Surgical history added for patient:', patientId);
      return result;

    } catch (error) {
      console.error('❌ [MEDICAL] Add surgical history failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 GHI NHẬN CÁC PHÁT HIỆN LÂM SÀNG KHI KHÁM
   */
  async recordClinicalFindings(consultationId, findings, recordedBy) {
    try {
      console.log('🔍 [MEDICAL] Recording clinical findings for record:', consultationId);

      // Tìm medical record hiện tại
      const medicalRecord = await MedicalRecord.findOne({ recordId: consultationId });
      if (!medicalRecord) {
        throw new AppError('Không tìm thấy hồ sơ bệnh án', 404);
      }

      // Cập nhật clinical findings
      medicalRecord.physicalExamination = {
        findings: findings.findings || 'No findings',
        observations: findings.observations || findings.examination || '',
        notes: findings.notes || ''
      };
      
      // Cập nhật department và chief complaint nếu có
      if (findings.department) {
        medicalRecord.department = findings.department;
      }
      if (findings.chiefComplaint) {
        medicalRecord.chiefComplaint = findings.chiefComplaint;
      }
      
      medicalRecord.status = 'COMPLETED';
      medicalRecord.lastModifiedBy = recordedBy;

      console.log('💾 [MEDICAL] Updating medical record with clinical findings');

      await medicalRecord.save();

      // 🎯 POPULATE KẾT QUẢ
      const result = await MedicalRecord.findById(medicalRecord._id)
        .populate('patientId', 'personalInfo email phone dateOfBirth gender')
        .populate('doctorId', 'personalInfo email specialization');

      console.log('✅ [MEDICAL] Clinical findings recorded for:', consultationId);
      return result;

    } catch (error) {
      console.error('❌ [MEDICAL] Record clinical findings failed:', error.message);
      console.error('❌ [MEDICAL] Error details:', error);
      throw error;
    }
  }

  /**
   * 🎯 TÌM KIẾM HỒ SƠ BỆNH ÁN THEO CHẨN ĐOÁN
   */
  async searchMedicalRecordsByDiagnosis(diagnosis, filters = {}) {
    try {
      console.log('🔍 [MEDICAL] Searching medical records by diagnosis:', diagnosis);

      const { 
        page = 1, 
        limit = 20,
        startDate,
        endDate
      } = filters;

      const skip = (page - 1) * limit;

      // 🎯 BUILD QUERY
      let query = {
        'diagnoses.diagnosis': { $regex: diagnosis, $options: 'i' }
      };

      if (startDate || endDate) {
        query.visitDate = {};
        if (startDate) query.visitDate.$gte = new Date(startDate);
        if (endDate) query.visitDate.$lte = new Date(endDate);
      }

      // 🎯 THỰC HIỆN TÌM KIẾM
      const [medicalRecords, total] = await Promise.all([
        MedicalRecord.find(query)
          .populate('patientId', 'personalInfo email phone dateOfBirth gender')
          .populate('doctorId', 'personalInfo email specialization department')
          .sort({ visitDate: -1 })
          .skip(skip)
          .limit(limit),
        MedicalRecord.countDocuments(query)
      ]);

      // 🎯 TÍNH TOÁN PHÂN TRANG
      const totalPages = Math.ceil(total / limit);

      return {
        diagnosis,
        medicalRecords,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };

    } catch (error) {
      console.error('❌ [MEDICAL] Search medical records by diagnosis failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 THỐNG KÊ HỒ SƠ BỆNH ÁN
   */
  async getMedicalRecordsStats(timeframe = '30d') {
    try {
      console.log('📊 [MEDICAL] Getting medical records statistics for timeframe:', timeframe);

      const now = new Date();
      let startDate = new Date();
      
      switch (timeframe) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setDate(now.getDate() - 365);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      // 🎯 THỐNG KÊ THEO LOẠI KHÁM
      const statsByVisitType = await MedicalRecord.aggregate([
        {
          $match: {
            visitDate: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$visitType',
            count: { $sum: 1 },
            averageDuration: { $avg: '$duration' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      // 🎯 THỐNG KÊ THEO TRẠNG THÁI
      const statsByStatus = await MedicalRecord.aggregate([
        {
          $match: {
            visitDate: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // 🎯 THỐNG KÊ THEO KHOA
      const statsByDepartment = await MedicalRecord.aggregate([
        {
          $match: {
            visitDate: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      // 🎯 TỔNG SỐ HỒ SƠ
      const totalRecords = await MedicalRecord.countDocuments({
        visitDate: { $gte: startDate }
      });

      return {
        timeframe,
        startDate,
        endDate: now,
        totalRecords,
        statsByVisitType,
        statsByStatus,
        statsByDepartment,
        summary: {
          totalCompleted: statsByStatus.find(s => s._id === 'COMPLETED')?.count || 0,
          totalDraft: statsByStatus.find(s => s._id === 'DRAFT')?.count || 0,
          totalArchived: statsByStatus.find(s => s._id === 'ARCHIVED')?.count || 0
        }
      };

    } catch (error) {
      console.error('❌ [MEDICAL] Get medical records stats failed:', error.message);
      throw error;
    }
  }
}

module.exports = new MedicalRecordService();