const Patient = require('../models/patient.model');
const User = require('../models/user.model');
const { generatePatientId, calculateAge } = require('../utils/healthcare.utils');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const { hashPassword } = require('../utils/hash');

/**
 * 🏥 PATIENT SERVICE - BUSINESS LOGIC
 * Xử lý tất cả nghiệp vụ liên quan đến bệnh nhân
 */

class PatientService {
  
  /**
   * 🎯 ĐĂNG KÝ BỆNH NHÂN MỚI
   */
  async registerPatient(patientData) {
    try {
      console.log('👤 [SERVICE] Registering patient:', patientData.email);

      // 🎯 KIỂM TRA EMAIL ĐÃ TỒN TẠI
      const existingUser = await User.findOne({ email: patientData.email });
      if (existingUser) {
        throw new AppError('Email đã được đăng ký', 400, ERROR_CODES.USER_ALREADY_EXISTS);
      }

      // 🎯 TẠO USER ACCOUNT
      const userData = {
        email: patientData.email,
        password: patientData.password,
        name: patientData.name,
        phone: patientData.phone,
        dateOfBirth: patientData.dateOfBirth,
        gender: patientData.gender,
        address: patientData.address,
        role: 'PATIENT',
        isActive: true
      };

      const user = new User(userData);
      await user.save();

      // 🎯 TẠO PATIENT PROFILE
      const patientId = await generatePatientId();
      
      const patientProfile = {
        userId: user._id,
        patientId,
        bloodType: patientData.bloodType,
        height: patientData.height,
        weight: patientData.weight,
        allergies: patientData.allergies || [],
        chronicConditions: patientData.chronicConditions || [],
        insurance: patientData.insurance || {},
        createdBy: patientData.createdBy
      };

      const patient = new Patient(patientProfile);
      await patient.save();

      // 🎯 POPULATE KẾT QUẢ
      const result = await Patient.findById(patient._id)
        .populate('userId', 'name email phone dateOfBirth gender address')
        .populate('createdBy', 'name email');

      console.log('✅ [SERVICE] Patient registered successfully:', patientId);
      return result;

    } catch (error) {
      console.error('❌ [SERVICE] Patient registration failed:', error.message);
      
      // 🎯 XÓA USER NẾU TẠO PATIENT FAILED
      if (patientData.email) {
        await User.findOneAndDelete({ email: patientData.email });
      }
      
      throw error;
    }
  }

  /**
   * 🎯 TÌM KIẾM BỆNH NHÂN
   */
  async searchPatients({ keyword, page, limit, sortBy, sortOrder }) {
    try {
      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // 🎯 BUILD SEARCH QUERY
      let query = {};
      
      if (keyword) {
        const keywordRegex = new RegExp(keyword, 'i');
        query = {
          $or: [
            { patientId: keywordRegex },
            { 'userId.name': keywordRegex },
            { 'userId.email': keywordRegex },
            { 'userId.phone': keywordRegex }
          ]
        };
      }

      // 🎯 THỰC HIỆN TÌM KIẾM
      const [patients, total] = await Promise.all([
        Patient.find(query)
          .populate('userId', 'name email phone dateOfBirth gender address')
          .sort(sort)
          .skip(skip)
          .limit(limit),
        Patient.countDocuments(query)
      ]);

      // 🎯 TÍNH TOÁN PHÂN TRANG
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        patients,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNext,
          hasPrev
        }
      };

    } catch (error) {
      console.error('❌ [SERVICE] Patient search failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN NHÂN KHẨU
   */
  async getPatientDemographics(patientId) {
    try {
      const patient = await Patient.findOne({ patientId })
        .populate('userId', 'name email phone dateOfBirth gender address identification')
        .populate('createdBy', 'name email');

      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, ERROR_CODES.PATIENT_NOT_FOUND);
      }

      // 🎯 TÍNH TOÁN THÔNG TIN BỔ SUNG
      const age = calculateAge(patient.userId.dateOfBirth);
      const bmi = patient.getBMI();

      return {
        demographics: {
          patientId: patient.patientId,
          personalInfo: patient.userId,
          medicalInfo: {
            bloodType: patient.bloodType,
            height: patient.height,
            weight: patient.weight,
            bmi,
            age
          },
          allergies: patient.allergies,
          chronicConditions: patient.chronicConditions,
          lifestyle: patient.lifestyle,
          familyHistory: patient.familyHistory
        }
      };

    } catch (error) {
      console.error('❌ [SERVICE] Get demographics failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 CẬP NHẬT THÔNG TIN NHÂN KHẨU
   */
  async updatePatientDemographics(patientId, updateData, updatedBy) {
    try {
      const patient = await Patient.findOne({ patientId }).populate('userId');
      
      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, ERROR_CODES.PATIENT_NOT_FOUND);
      }

      // 🎯 CẬP NHẬT USER DATA
      const userUpdateFields = ['name', 'phone', 'dateOfBirth', 'gender', 'address'];
      const userUpdates = {};
      
      userUpdateFields.forEach(field => {
        if (updateData[field] !== undefined) {
          userUpdates[field] = updateData[field];
        }
      });

      if (Object.keys(userUpdates).length > 0) {
        await User.findByIdAndUpdate(patient.userId._id, userUpdates);
      }

      // 🎯 CẬP NHẬT PATIENT DATA
      const patientUpdateFields = ['bloodType', 'height', 'weight', 'allergies', 'chronicConditions', 'lifestyle', 'familyHistory'];
      const patientUpdates = {};
      
      patientUpdateFields.forEach(field => {
        if (updateData[field] !== undefined) {
          patientUpdates[field] = updateData[field];
        }
      });

      if (Object.keys(patientUpdates).length > 0) {
        await Patient.findByIdAndUpdate(patient._id, patientUpdates);
      }

      // 🎯 LẤY KẾT QUẢ MỚI NHẤT
      const updatedPatient = await Patient.findOne({ patientId })
        .populate('userId', 'name email phone dateOfBirth gender address')
        .populate('createdBy', 'name email');

      console.log('✅ [SERVICE] Demographics updated for:', patientId);
      return updatedPatient;

    } catch (error) {
      console.error('❌ [SERVICE] Update demographics failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 NHẬP VIỆN BỆNH NHÂN
   */
  async admitPatient(patientId, admissionData, admittedBy) {
    try {
      const patient = await Patient.findOne({ patientId });
      
      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, ERROR_CODES.PATIENT_NOT_FOUND);
      }

      // 🎯 KIỂM TRA ĐÃ NHẬP VIỆN CHƯA
      if (patient.admission && patient.admission.status === 'ADMITTED') {
        throw new AppError('Bệnh nhân đã nhập viện', 400, ERROR_CODES.PATIENT_ALREADY_ADMITTED);
      }

      // 🎯 TẠO ADMISSION RECORD
      const admission = {
        status: 'ADMITTED',
        admittedBy,
        admissionDate: new Date(),
        department: admissionData.department,
        room: admissionData.room,
        bed: admissionData.bed,
        diagnosis: admissionData.diagnosis,
        attendingDoctor: admissionData.attendingDoctor,
        notes: admissionData.notes
      };

      patient.admission = admission;
      await patient.save();

      console.log('✅ [SERVICE] Patient admitted:', patientId);
      return patient;

    } catch (error) {
      console.error('❌ [SERVICE] Patient admission failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 XUẤT VIỆN BỆNH NHÂN
   */
  async dischargePatient(patientId, dischargeData, dischargedBy) {
    try {
      const patient = await Patient.findOne({ patientId });
      
      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, ERROR_CODES.PATIENT_NOT_FOUND);
      }

      // 🎯 KIỂM TRA ĐÃ NHẬP VIỆN CHƯA
      if (!patient.admission || patient.admission.status !== 'ADMITTED') {
        throw new AppError('Bệnh nhân chưa nhập viện', 400, ERROR_CODES.PATIENT_NOT_ADMITTED);
      }

      // 🎯 CẬP NHẬT DISCHARGE INFO
      patient.admission.status = 'DISCHARGED';
      patient.admission.dischargeDate = new Date();
      patient.admission.dischargedBy = dischargedBy;
      patient.admission.dischargeReason = dischargeData.dischargeReason;
      patient.admission.conditionAtDischarge = dischargeData.condition;
      patient.admission.followUpInstructions = dischargeData.followUpInstructions;
      patient.admission.medicationsAtDischarge = dischargeData.medications;

      await patient.save();

      console.log('✅ [SERVICE] Patient discharged:', patientId);
      return patient;

    } catch (error) {
      console.error('❌ [SERVICE] Patient discharge failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN BẢO HIỂM
   */
  async getPatientInsurance(patientId) {
    try {
      const patient = await Patient.findOne({ patientId });
      
      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, ERROR_CODES.PATIENT_NOT_FOUND);
      }

      return {
        patientId: patient.patientId,
        insurance: patient.insurance,
        verificationStatus: this.verifyInsurance(patient.insurance)
      };

    } catch (error) {
      console.error('❌ [SERVICE] Get insurance failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 CẬP NHẬT THÔNG TIN BẢO HIỂM
   */
  async updatePatientInsurance(patientId, insuranceData, updatedBy) {
    try {
      const patient = await Patient.findOne({ patientId });
      
      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, ERROR_CODES.PATIENT_NOT_FOUND);
      }

      // 🎯 CẬP NHẬT INSURANCE INFO
      patient.insurance = {
        ...patient.insurance,
        ...insuranceData,
        lastUpdated: new Date(),
        updatedBy
      };

      await patient.save();

      console.log('✅ [SERVICE] Insurance updated for:', patientId);
      return {
        patientId: patient.patientId,
        insurance: patient.insurance,
        verificationStatus: this.verifyInsurance(patient.insurance)
      };

    } catch (error) {
      console.error('❌ [SERVICE] Update insurance failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 VERIFY INSURANCE INFORMATION
   */
  verifyInsurance(insurance) {
    if (!insurance.provider || !insurance.policyNumber) {
      return 'INCOMPLETE';
    }

    const now = new Date();
    if (insurance.expirationDate && new Date(insurance.expirationDate) < now) {
      return 'EXPIRED';
    }

    return 'ACTIVE';
  }
}

module.exports = new PatientService();