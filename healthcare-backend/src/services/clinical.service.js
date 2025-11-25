const Consultation = require('../models/consultation.model');
const Diagnosis = require('../models/diagnosis.model');
const MedicalRecord = require('../models/medicalRecord.model');
const User = require('../models/user.model');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const { generateMedicalCode } = require('../utils/healthcare.utils');

/**
 * 🩺 CLINICAL SERVICE - BUSINESS LOGIC CHO KHÁM CHỮA BỆNH
 */

class ClinicalService {
  
  /**
   * 🎯 TẠO PHIÊN KHÁM BỆNH/TƯ VẤN
   */
  async createConsultation(patientId, doctorId, consultationData, createdBy) {
    try {
      console.log('🩺 [CLINICAL] Creating consultation for patient:', patientId);

      // 🎯 KIỂM TRA BỆNH NHÂN
      const patient = await User.findOne({ 
        _id: patientId, 
        role: 'PATIENT',
        status: 'ACTIVE'
      });
      
      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, ERROR_CODES.PATIENT_NOT_FOUND);
      }

      // 🎯 KIỂM TRA BÁC SĨ
      const doctor = await User.findOne({ 
        _id: doctorId, 
        role: 'DOCTOR',
        status: 'ACTIVE'
      });
      
      if (!doctor) {
        throw new AppError('Không tìm thấy bác sĩ', 404, ERROR_CODES.DOCTOR_NOT_FOUND);
      }

      // 🎯 TẠO CONSULTATION ID
      const consultationId = `CONS${generateMedicalCode(8)}`;

      // 🎯 TẠO MEDICAL RECORD NẾU CHƯA CÓ
      let medicalRecord = await MedicalRecord.findOne({
        patientId,
        status: { $in: ['DRAFT', 'COMPLETED'] }
      }).sort({ visitDate: -1 });

      if (!medicalRecord) {
        const recordId = `MR${generateMedicalCode(8)}`;
        medicalRecord = new MedicalRecord({
          recordId,
          patientId,
          doctorId,
          department: doctor.professionalInfo?.department || 'GENERAL',
          visitType: 'OUTPATIENT',
          visitDate: new Date(),
          chiefComplaint: consultationData.reason || 'Khám tổng quát',
          status: 'DRAFT',
          createdBy
        });
        await medicalRecord.save();
      }

      // 🎯 TẠO PHIÊN KHÁM
      const consultation = new Consultation({
        consultationId,
        medicalRecordId: medicalRecord._id,
        patientId,
        doctorId,
        ...consultationData,
        status: 'SCHEDULED'
      });

      await consultation.save();

      // 🎯 POPULATE KẾT QUẢ
      const result = await Consultation.findById(consultation._id)
        .populate('patientId', 'personalInfo email phone')
        .populate('doctorId', 'personalInfo email professionalInfo')
        .populate('medicalRecordId');

      console.log('✅ [CLINICAL] Consultation created successfully:', consultationId);
      return result;

    } catch (error) {
      console.error('❌ [CLINICAL] Create consultation failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN PHIÊN KHÁM
   */
  async getConsultation(consultationId) {
    try {
      console.log('🔍 [CLINICAL] Getting consultation:', consultationId);

      const consultation = await Consultation.findOne({ consultationId })
        .populate('patientId', 'personalInfo email phone dateOfBirth gender')
        .populate('doctorId', 'personalInfo email professionalInfo specialization')
        .populate('medicalRecordId');

      if (!consultation) {
        throw new AppError('Không tìm thấy phiên khám', 404, ERROR_CODES.MEDICAL_RECORD_NOT_FOUND);
      }

      return consultation;

    } catch (error) {
      console.error('❌ [CLINICAL] Get consultation failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 CẬP NHẬT THÔNG TIN PHIÊN KHÁM
   */
  async updateConsultation(consultationId, updateData, updatedBy) {
    try {
      console.log('✏️ [CLINICAL] Updating consultation:', consultationId);

      const consultation = await Consultation.findOne({ consultationId });
      
      if (!consultation) {
        throw new AppError('Không tìm thấy phiên khám', 404, ERROR_CODES.MEDICAL_RECORD_NOT_FOUND);
      }

      // 🎯 KIỂM TRA QUYỀN CHỈNH SỬA
      if (consultation.status === 'COMPLETED') {
        throw new AppError('Không thể chỉnh sửa phiên khám đã hoàn thành', 400);
      }

      // 🎯 CẬP NHẬT THÔNG TIN
      const allowedFields = [
        'subjective', 'objective', 'assessment', 'plan',
        'recommendations', 'notes', 'duration', 'outcome'
      ];
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          consultation[field] = updateData[field];
        }
      });

      // 🎯 CẬP NHẬT MEDICAL RECORD LIÊN QUAN
      if (consultation.medicalRecordId) {
        const medicalRecord = await MedicalRecord.findById(consultation.medicalRecordId);
        if (medicalRecord) {
          if (updateData.subjective?.chiefComplaint) {
            medicalRecord.chiefComplaint = updateData.subjective.chiefComplaint;
          }
          if (updateData.assessment?.clinicalImpressions) {
            if (!medicalRecord.diagnoses) medicalRecord.diagnoses = [];
            // Thêm chẩn đoán tạm thời
            medicalRecord.diagnoses.push({
              diagnosis: updateData.assessment.clinicalImpressions,
              type: 'PROVISIONAL',
              certainty: 'POSSIBLE'
            });
          }
          await medicalRecord.save();
        }
      }

      await consultation.save();

      // 🎯 LẤY KẾT QUẢ MỚI NHẤT
      const updatedConsultation = await Consultation.findOne({ consultationId })
        .populate('patientId', 'personalInfo email phone')
        .populate('doctorId', 'personalInfo email professionalInfo')
        .populate('medicalRecordId');

      console.log('✅ [CLINICAL] Consultation updated:', consultationId);
      return updatedConsultation;

    } catch (error) {
      console.error('❌ [CLINICAL] Update consultation failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 THÊM CHẨN ĐOÁN VÀO PHIÊN KHÁM
   */
  async addDiagnosis(consultationId, diagnosisData, diagnosedBy) {
    try {
      console.log('🩺 [CLINICAL] Adding diagnosis to consultation:', consultationId);

      const consultation = await Consultation.findOne({ consultationId });
      
      if (!consultation) {
        throw new AppError('Không tìm thấy phiên khám', 404, ERROR_CODES.MEDICAL_RECORD_NOT_FOUND);
      }

      // 🎯 TẠO DIAGNOSIS ID
      const diagnosisId = `D${generateMedicalCode(8)}`;

      // 🎯 TẠO CHẨN ĐOÁN
      const diagnosis = new Diagnosis({
        diagnosisId,
        medicalRecordId: consultation.medicalRecordId,
        patientId: consultation.patientId,
        doctorId: consultation.doctorId,
        ...diagnosisData,
        diagnosedBy
      });

      await diagnosis.save();

      // 🎯 CẬP NHẬT MEDICAL RECORD
      const medicalRecord = await MedicalRecord.findById(consultation.medicalRecordId);
      if (medicalRecord) {
        if (!medicalRecord.diagnoses) medicalRecord.diagnoses = [];
        medicalRecord.diagnoses.push({
          diagnosis: diagnosisData.diagnosisName,
          code: diagnosisData.diagnosisCode,
          type: diagnosisData.type || 'PRIMARY',
          certainty: diagnosisData.certainty || 'PROBABLE'
        });
        await medicalRecord.save();
      }

      // 🎯 POPULATE KẾT QUẢ
      const result = await Diagnosis.findById(diagnosis._id)
        .populate('patientId', 'personalInfo email phone')
        .populate('doctorId', 'personalInfo email professionalInfo');

      console.log('✅ [CLINICAL] Diagnosis added successfully:', diagnosisId);
      return result;

    } catch (error) {
      console.error('❌ [CLINICAL] Add diagnosis failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY DANH SÁCH CHẨN ĐOÁN CỦA BỆNH NHÂN
   */
  async getPatientDiagnoses(patientId, filters = {}) {
    try {
      console.log('📋 [CLINICAL] Getting diagnoses for patient:', patientId);

      const { 
        status, 
        page = 1, 
        limit = 20,
        startDate,
        endDate,
        sortBy = 'diagnosedDate',
        sortOrder = 'desc'
      } = filters;

      const skip = (page - 1) * limit;

      // 🎯 BUILD QUERY
      let query = { patientId };
      
      if (status) query.status = status;

      if (startDate || endDate) {
        query.diagnosedDate = {};
        if (startDate) query.diagnosedDate.$gte = new Date(startDate);
        if (endDate) query.diagnosedDate.$lte = new Date(endDate);
      }

      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // 🎯 THỰC HIỆN TÌM KIẾM
      const [diagnoses, total] = await Promise.all([
        Diagnosis.find(query)
          .populate('patientId', 'personalInfo email phone dateOfBirth gender')
          .populate('doctorId', 'personalInfo email professionalInfo specialization')
          .sort(sort)
          .skip(skip)
          .limit(limit),
        Diagnosis.countDocuments(query)
      ]);

      // 🎯 TÍNH TOÁN PHÂN TRANG
      const totalPages = Math.ceil(total / limit);

      return {
        diagnoses,
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
      console.error('❌ [CLINICAL] Get patient diagnoses failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 GHI NHẬN TRIỆU CHỨNG BỆNH NHÂN
   */
  async recordSymptoms(consultationId, symptoms, recordedBy) {
    try {
      console.log('🤒 [CLINICAL] Recording symptoms for consultation:', consultationId);

      const consultation = await Consultation.findOne({ consultationId });
      
      if (!consultation) {
        throw new AppError('Không tìm thấy phiên khám', 404, ERROR_CODES.MEDICAL_RECORD_NOT_FOUND);
      }

      // 🎯 CẬP NHẬT TRIỆU CHỨNG
      if (!consultation.subjective) consultation.subjective = {};
      consultation.subjective.reviewOfSystems = symptoms.join(', ');

      await consultation.save();

      // 🎯 CẬP NHẬT MEDICAL RECORD
      const medicalRecord = await MedicalRecord.findById(consultation.medicalRecordId);
      if (medicalRecord) {
        medicalRecord.symptoms = symptoms.map(symptom => ({
          symptom,
          duration: 'Không xác định',
          severity: 'MODERATE'
        }));
        await medicalRecord.save();
      }

      console.log('✅ [CLINICAL] Symptoms recorded for consultation:', consultationId);
      return await this.getConsultation(consultationId);

    } catch (error) {
      console.error('❌ [CLINICAL] Record symptoms failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 GHI KẾT QUẢ KHÁM THỰC THỂ
   */
  async recordPhysicalExam(consultationId, examData, recordedBy) {
    try {
      console.log('👨‍⚕️ [CLINICAL] Recording physical exam for consultation:', consultationId);

      const consultation = await Consultation.findOne({ consultationId });
      
      if (!consultation) {
        throw new AppError('Không tìm thấy phiên khám', 404, ERROR_CODES.MEDICAL_RECORD_NOT_FOUND);
      }

      // 🎯 CẬP NHẬT KHÁM THỰC THỂ
      consultation.objective = {
        ...consultation.objective,
        ...examData
      };

      await consultation.save();

      // 🎯 CẬP NHẬT MEDICAL RECORD
      const medicalRecord = await MedicalRecord.findById(consultation.medicalRecordId);
      if (medicalRecord) {
        medicalRecord.physicalExamination = {
          ...medicalRecord.physicalExamination,
          ...examData
        };
        await medicalRecord.save();
      }

      console.log('✅ [CLINICAL] Physical exam recorded for consultation:', consultationId);
      return await this.getConsultation(consultationId);

    } catch (error) {
      console.error('❌ [CLINICAL] Record physical exam failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 ĐÁNH DẤU HOÀN THÀNH PHIÊN KHÁM
   */
  async completeConsultation(consultationId, completedBy) {
    try {
      console.log('✅ [CLINICAL] Completing consultation:', consultationId);

      const consultation = await Consultation.findOne({ consultationId });
      
      if (!consultation) {
        throw new AppError('Không tìm thấy phiên khám', 404, ERROR_CODES.MEDICAL_RECORD_NOT_FOUND);
      }

      if (consultation.status === 'COMPLETED') {
        throw new AppError('Phiên khám đã hoàn thành', 400);
      }

      // 🎯 CẬP NHẬT TRẠNG THÁI
      consultation.status = 'COMPLETED';
      consultation.endTime = new Date();

      // 🎯 TÍNH THỜI GIAN THỰC TẾ
      if (consultation.startTime) {
        consultation.duration = Math.round(
          (consultation.endTime - consultation.startTime) / (1000 * 60)
        );
      }

      await consultation.save();

      // 🎯 CẬP NHẬT MEDICAL RECORD
      const medicalRecord = await MedicalRecord.findById(consultation.medicalRecordId);
      if (medicalRecord) {
        medicalRecord.status = 'COMPLETED';
        await medicalRecord.save();
      }

      console.log('✅ [CLINICAL] Consultation completed:', consultationId);
      return await this.getConsultation(consultationId);

    } catch (error) {
      console.error('❌ [CLINICAL] Complete consultation failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 CẬP NHẬT THÔNG TIN CHẨN ĐOÁN
   */
  async updateDiagnosis(diagnosisId, updateData, updatedBy) {
    try {
      console.log('✏️ [CLINICAL] Updating diagnosis:', diagnosisId);

      const diagnosis = await Diagnosis.findOne({ diagnosisId });
      
      if (!diagnosis) {
        throw new AppError('Không tìm thấy chẩn đoán', 404);
      }

      // 🎯 CẬP NHẬT THÔNG TIN
      const allowedFields = [
        'diagnosisName', 'diagnosisCode', 'category', 'type', 'certainty',
        'severity', 'description', 'clinicalFeatures', 'treatmentStatus',
        'followUpRequired', 'followUpInterval', 'notes', 'prognosis', 'status'
      ];
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          diagnosis[field] = updateData[field];
        }
      });

      // 🎯 NẾU ĐÁNH DẤU ĐÃ KHỎI
      if (updateData.status === 'RESOLVED' && !diagnosis.resolvedDate) {
        diagnosis.resolvedDate = new Date();
      }

      await diagnosis.save();

      console.log('✅ [CLINICAL] Diagnosis updated:', diagnosisId);
      return await Diagnosis.findOne({ diagnosisId })
        .populate('patientId', 'personalInfo email phone')
        .populate('doctorId', 'personalInfo email professionalInfo');

    } catch (error) {
      console.error('❌ [CLINICAL] Update diagnosis failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 TẠO KẾ HOẠCH ĐIỀU TRỊ
   */
  async createTreatmentPlan(patientId, planData, createdBy) {
    try {
      console.log('📋 [CLINICAL] Creating treatment plan for patient:', patientId);

      // 🎯 TÌM MEDICAL RECORD GẦN NHẤT
      const medicalRecord = await MedicalRecord.findOne({
        patientId,
        status: { $in: ['DRAFT', 'COMPLETED'] }
      }).sort({ visitDate: -1 });

      if (!medicalRecord) {
        throw new AppError('Không tìm thấy hồ sơ bệnh án để tạo kế hoạch điều trị', 404);
      }

      // 🎯 CẬP NHẬT TREATMENT PLAN
      medicalRecord.treatmentPlan = {
        ...medicalRecord.treatmentPlan,
        ...planData
      };

      medicalRecord.lastModifiedBy = createdBy;
      await medicalRecord.save();

      console.log('✅ [CLINICAL] Treatment plan created for patient:', patientId);
      return {
        planId: medicalRecord.recordId,
        patientId,
        treatmentPlan: medicalRecord.treatmentPlan,
        createdBy,
        createdAt: new Date()
      };

    } catch (error) {
      console.error('❌ [CLINICAL] Create treatment plan failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN KẾ HOẠCH ĐIỀU TRỊ
   */
  async getTreatmentPlan(planId) {
    try {
      console.log('📋 [CLINICAL] Getting treatment plan:', planId);

      const medicalRecord = await MedicalRecord.findOne({ recordId: planId })
        .populate('patientId', 'personalInfo email phone dateOfBirth gender')
        .populate('doctorId', 'personalInfo email professionalInfo specialization')
        .populate('lastModifiedBy', 'personalInfo email');

      if (!medicalRecord) {
        throw new AppError('Không tìm thấy kế hoạch điều trị', 404);
      }

      return {
        planId: medicalRecord.recordId,
        patient: medicalRecord.patientId,
        doctor: medicalRecord.doctorId,
        treatmentPlan: medicalRecord.treatmentPlan,
        status: medicalRecord.status,
        lastModified: medicalRecord.updatedAt,
        lastModifiedBy: medicalRecord.lastModifiedBy
      };

    } catch (error) {
      console.error('❌ [CLINICAL] Get treatment plan failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 GHI NHẬN TIẾN TRIỂN CỦA BỆNH NHÂN
   */
  async recordProgressNote(patientId, noteData, recordedBy) {
    try {
      console.log('📝 [CLINICAL] Recording progress note for patient:', patientId);

      // 🎯 TÌM MEDICAL RECORD HIỆN TẠI
      let medicalRecord = await MedicalRecord.findOne({
        patientId,
        status: { $in: ['DRAFT', 'COMPLETED'] }
      }).sort({ visitDate: -1 });

      const now = new Date();

      if (!medicalRecord) {
        const recordId = `MR${generateMedicalCode(8)}`;
        medicalRecord = new MedicalRecord({
          recordId,
          patientId,
          doctorId: recordedBy,
          department: 'GENERAL',
          visitType: 'FOLLOW_UP',
          visitDate: now,
          chiefComplaint: 'Theo dõi tiến triển',
          status: 'DRAFT',
          createdBy: recordedBy
        });
      }

      // 🎯 THÊM PROGRESS NOTE
      if (!medicalRecord.treatmentPlan) {
        medicalRecord.treatmentPlan = {};
      }

      if (!medicalRecord.treatmentPlan.progressNotes) {
        medicalRecord.treatmentPlan.progressNotes = [];
      }

      medicalRecord.treatmentPlan.progressNotes.push({
        ...noteData,
        recordedBy,
        recordedAt: now
      });

      medicalRecord.lastModifiedBy = recordedBy;
      await medicalRecord.save();

      console.log('✅ [CLINICAL] Progress note recorded for patient:', patientId);
      return await this.getMedicalRecord(medicalRecord.recordId);

    } catch (error) {
      console.error('❌ [CLINICAL] Record progress note failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 CẬP NHẬT KẾ HOẠCH ĐIỀU TRỊ
   */
  async updateTreatmentPlan(planId, updateData, updatedBy) {
    try {
      console.log('✏️ [CLINICAL] Updating treatment plan:', planId);

      const medicalRecord = await MedicalRecord.findOne({ recordId: planId });
      
      if (!medicalRecord) {
        throw new AppError('Không tìm thấy kế hoạch điều trị', 404);
      }

      // 🎯 CẬP NHẬT TREATMENT PLAN
      medicalRecord.treatmentPlan = {
        ...medicalRecord.treatmentPlan,
        ...updateData
      };

      medicalRecord.lastModifiedBy = updatedBy;
      await medicalRecord.save();

      console.log('✅ [CLINICAL] Treatment plan updated:', planId);
      return await this.getTreatmentPlan(planId);

    } catch (error) {
      console.error('❌ [CLINICAL] Update treatment plan failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 ĐÁNH DẤU HOÀN THÀNH ĐIỀU TRỊ
   */
  async completeTreatmentPlan(planId, completedBy) {
    try {
      console.log('✅ [CLINICAL] Completing treatment plan:', planId);

      const medicalRecord = await MedicalRecord.findOne({ recordId: planId });
      
      if (!medicalRecord) {
        throw new AppError('Không tìm thấy kế hoạch điều trị', 404);
      }

      if (medicalRecord.status === 'COMPLETED') {
        throw new AppError('Kế hoạch điều trị đã hoàn thành', 400);
      }

      // 🎯 CẬP NHẬT TRẠNG THÁI
      medicalRecord.status = 'COMPLETED';
      medicalRecord.lastModifiedBy = completedBy;
      await medicalRecord.save();

      console.log('✅ [CLINICAL] Treatment plan completed:', planId);
      return await this.getTreatmentPlan(planId);

    } catch (error) {
      console.error('❌ [CLINICAL] Complete treatment plan failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY TẤT CẢ NHẬN XÉT TIẾN TRIỂN
   */
  async getProgressNotes(patientId, filters = {}) {
    try {
      console.log('📋 [CLINICAL] Getting progress notes for patient:', patientId);

      const { 
        page = 1, 
        limit = 20,
        startDate,
        endDate
      } = filters;

      const skip = (page - 1) * limit;

      // 🎯 TÌM TẤT CẢ MEDICAL RECORDS CÓ PROGRESS NOTES
      const medicalRecords = await MedicalRecord.find({
        patientId,
        'treatmentPlan.progressNotes': { $exists: true, $ne: [] }
      })
      .select('recordId visitDate treatmentPlan.progressNotes')
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(limit);

      // 🎯 TRÍCH XUẤT PROGRESS NOTES
      let allProgressNotes = [];
      medicalRecords.forEach(record => {
        if (record.treatmentPlan && record.treatmentPlan.progressNotes) {
          record.treatmentPlan.progressNotes.forEach(note => {
            allProgressNotes.push({
              recordId: record.recordId,
              visitDate: record.visitDate,
              ...note
            });
          });
        }
      });

      // 🎯 LỌC THEO THỜI GIAN NẾU CÓ
      if (startDate || endDate) {
        allProgressNotes = allProgressNotes.filter(note => {
          const noteDate = new Date(note.recordedAt || note.visitDate);
          if (startDate && noteDate < new Date(startDate)) return false;
          if (endDate && noteDate > new Date(endDate)) return false;
          return true;
        });
      }

      // 🎯 TÍNH TOÁN PHÂN TRANG
      const total = allProgressNotes.length;
      const paginatedNotes = allProgressNotes.slice(skip, skip + limit);
      const totalPages = Math.ceil(total / limit);

      return {
        progressNotes: paginatedNotes,
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
      console.error('❌ [CLINICAL] Get progress notes failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 GHI NHẬN CỦA ĐIỀU DƯỠNG
   */
  async recordNursingNote(patientId, noteData, recordedBy) {
    try {
      console.log('👩‍⚕️ [CLINICAL] Recording nursing note for patient:', patientId);

      // 🎯 TÌM MEDICAL RECORD HIỆN TẠI
      let medicalRecord = await MedicalRecord.findOne({
        patientId,
        status: { $in: ['DRAFT', 'COMPLETED'] }
      }).sort({ visitDate: -1 });

      const now = new Date();

      if (!medicalRecord) {
        const recordId = `MR${generateMedicalCode(8)}`;
        medicalRecord = new MedicalRecord({
          recordId,
          patientId,
          doctorId: recordedBy,
          department: 'NURSING',
          visitType: 'INPATIENT',
          visitDate: now,
          chiefComplaint: 'Chăm sóc điều dưỡng',
          status: 'DRAFT',
          createdBy: recordedBy
        });
      }

      // 🎯 THÊM NURSING NOTE
      if (!medicalRecord.treatmentPlan) {
        medicalRecord.treatmentPlan = {};
      }

      if (!medicalRecord.treatmentPlan.nursingNotes) {
        medicalRecord.treatmentPlan.nursingNotes = [];
      }

      medicalRecord.treatmentPlan.nursingNotes.push({
        ...noteData,
        recordedBy,
        recordedAt: now,
        type: 'NURSING_NOTE'
      });

      medicalRecord.lastModifiedBy = recordedBy;
      await medicalRecord.save();

      console.log('✅ [CLINICAL] Nursing note recorded for patient:', patientId);
      return await this.getMedicalRecord(medicalRecord.recordId);

    } catch (error) {
      console.error('❌ [CLINICAL] Record nursing note failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 GHI TÓM TẮT TÌNH TRẠNG KHI XUẤT VIỆN
   */
  async recordDischargeSummary(patientId, summaryData, recordedBy) {
    try {
      console.log('🏥 [CLINICAL] Recording discharge summary for patient:', patientId);

      // 🎯 TÌM MEDICAL RECORD NHẬP VIỆN
      let medicalRecord = await MedicalRecord.findOne({
        patientId,
        visitType: 'INPATIENT',
        status: { $in: ['DRAFT', 'COMPLETED'] }
      }).sort({ visitDate: -1 });

      if (!medicalRecord) {
        throw new AppError('Không tìm thấy hồ sơ nhập viện', 404);
      }

      const now = new Date();

      // 🎯 THÊM DISCHARGE SUMMARY
      if (!medicalRecord.treatmentPlan) {
        medicalRecord.treatmentPlan = {};
      }

      medicalRecord.treatmentPlan.dischargeSummary = {
        ...summaryData,
        dischargedBy: recordedBy,
        dischargeDate: now
      };

      // 🎯 CẬP NHẬT TRẠNG THÁI
      medicalRecord.status = 'COMPLETED';
      medicalRecord.lastModifiedBy = recordedBy;
      await medicalRecord.save();

      console.log('✅ [CLINICAL] Discharge summary recorded for patient:', patientId);
      return await this.getMedicalRecord(medicalRecord.recordId);

    } catch (error) {
      console.error('❌ [CLINICAL] Record discharge summary failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 HỖ TRỢ: LẤY THÔNG TIN MEDICAL RECORD
   */
  async getMedicalRecord(recordId) {
    try {
      const medicalRecord = await MedicalRecord.findOne({ recordId })
        .populate('patientId', 'personalInfo email phone dateOfBirth gender address')
        .populate('doctorId', 'personalInfo email phone specialization department')
        .populate('createdBy', 'personalInfo email')
        .populate('lastModifiedBy', 'personalInfo email');

      if (!medicalRecord) {
        throw new AppError('Không tìm thấy hồ sơ bệnh án', 404);
      }

      return medicalRecord;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ClinicalService();