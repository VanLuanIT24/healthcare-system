// src/services/patient.service.js
const Patient = require('../models/patient.model');
const User = require('../models/user.model');
const { generatePatientId, calculateAge, calculatePatientPriority } = require('../utils/healthcare.utils');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');

class PatientService {
  
  /**
   * 🎯 ĐĂNG KÝ BỆNH NHÂN MỚI - HOÀN CHỈNH VỚI VALIDATION CHẶT CHẼ
   */
  async registerPatient(patientData) {
    try {
      // 🎯 VALIDATION BỔ SUNG
      if (!patientData || !patientData.email) {
        throw new AppError('Dữ liệu bệnh nhân không hợp lệ', 400, ERROR_CODES.VALIDATION_FAILED);
      }

      // 🎯 VALIDATE CÁC TRƯỜNG BẮT BUỘC
      const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'phone'];
      for (const field of requiredFields) {
        if (!patientData[field]) {
          throw new AppError(`Thiếu thông tin bắt buộc: ${field}`, 400, ERROR_CODES.VALIDATION_FAILED);
        }
      }

      // 🎯 VALIDATE ĐỊA CHỈ
      if (!patientData.address || !patientData.address.city || !patientData.address.street) {
        throw new AppError('Địa chỉ không hợp lệ - Cần có đường và thành phố', 400, ERROR_CODES.VALIDATION_FAILED);
      }

      console.log('👤 [SERVICE] Registering patient:', patientData.email);

      // 🎯 KIỂM TRA EMAIL ĐÃ TỒN TẠI
      const existingUser = await User.findOne({ email: patientData.email });
      if (existingUser) {
        throw new AppError('Email đã được đăng ký', 400, ERROR_CODES.DUPLICATE_ENTRY);
      }

      // ⚠️ QUAN TRỌNG: KIỂM TRA TRÙNG SỐ CMND/CCCD
      if (patientData.nationalId) {
        const existingPatient = await Patient.findOne({
          'userId.personalInfo.nationalId': patientData.nationalId
        });
        if (existingPatient) {
          throw new AppError('Số CMND/CCCD đã được đăng ký trong hệ thống', 400, ERROR_CODES.DUPLICATE_ENTRY);
        }
      }

      // ⚠️ QUAN TRỌNG: KIỂM TRA TRÙNG SỐ BẢO HIỂM Y TẾ
      if (patientData.insurance && patientData.insurance.policyNumber) {
        const existingInsurance = await Patient.findOne({
          'insurance.policyNumber': patientData.insurance.policyNumber,
          'insurance.provider': patientData.insurance.provider
        });
        if (existingInsurance) {
          throw new AppError('Số thẻ bảo hiểm y tế đã được đăng ký', 400, ERROR_CODES.DUPLICATE_ENTRY);
        }
      }

      // 🎯 TẠO USER ACCOUNT
      const user = new User({
        email: patientData.email,
        password: patientData.password,
        role: 'PATIENT',
        status: 'ACTIVE',
        personalInfo: {
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          dateOfBirth: patientData.dateOfBirth,
          gender: patientData.gender,
          phone: patientData.phone,
          address: patientData.address,
          nationalId: patientData.nationalId // CMND/CCCD
        },
        createdBy: patientData.createdBy
      });

      await user.save();

      // 🎯 TẠO MÃ BỆNH NHÂN DUY NHẤT THEO FORMAT BỆNH VIỆN
      // Format: BN + YYYYMM + 6 số tăng dần (VD: BN20251100001)
      const patientId = await this.generateUniquePatientCode();
      
      const patientProfile = {
        userId: user._id,
        patientId,
        bloodType: patientData.bloodType,
        height: patientData.height,
        weight: patientData.weight,
        emergencyInfo: patientData.emergencyInfo,
        allergies: patientData.allergies || [],
        chronicConditions: patientData.chronicConditions || [],
        familyHistory: patientData.familyHistory || [],
        lifestyle: patientData.lifestyle,
        insurance: patientData.insurance,
        preferences: patientData.preferences,
        createdBy: patientData.createdBy
      };

      const patient = new Patient(patientProfile);
      await patient.save();

      // 🎯 POPULATE KẾT QUẢ ĐẦY ĐỦ
      const result = await Patient.findById(patient._id)
        .populate('userId', 'personalInfo email status')
        .populate('createdBy', 'personalInfo email')
        .populate('emergencyInfo.primaryPhysician', 'personalInfo')
        .populate('allergies.reportedBy', 'personalInfo')
        .populate('chronicConditions.diagnosedBy', 'personalInfo')
        .populate('currentMedications.prescribedBy', 'personalInfo');

      console.log('✅ [SERVICE] Patient registered successfully:', patientId);
      return result;

    } catch (error) {
      console.error('❌ [SERVICE] Patient registration failed:', error.message);
      
      // 🎯 ROLLBACK: XÓA USER NẾU TẠO PATIENT FAILED
      if (patientData.email) {
        await User.findOneAndDelete({ email: patientData.email });
      }
      
      throw error;
    }
  }

  /**
   * 🎯 TẠO MÃ BỆNH NHÂN DUY NHẤT THEO FORMAT BỆNH VIỆN
   * Format: BN + YYYYMM + 6 số tăng dần
   * VD: BN202511000001, BN202511000002...
   */
  async generateUniquePatientCode() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `BN${year}${month}`;

    // Tìm mã bệnh nhân lớn nhất trong tháng hiện tại
    const lastPatient = await Patient.findOne({
      patientId: new RegExp(`^${prefix}`)
    }).sort({ patientId: -1 }).limit(1);

    let nextNumber = 1;
    if (lastPatient) {
      // Lấy 6 số cuối và tăng lên 1
      const lastNumber = parseInt(lastPatient.patientId.slice(-6));
      nextNumber = lastNumber + 1;
    }

    // Format: BN + YYYYMM + 6 số (padding với 0)
    const patientCode = `${prefix}${String(nextNumber).padStart(6, '0')}`;
    
    console.log('🆔 [SERVICE] Generated patient code:', patientCode);
    return patientCode;
  }

  /**
   * 🎯 LẤY THÔNG TIN LIÊN LẠC BỆNH NHÂN
   */
  async getPatientContacts(patientId) {
    try {
      const patient = await Patient.findOne({ patientId })
        .populate('userId', 'personalInfo email phone')
        .populate('emergencyInfo.primaryPhysician', 'personalInfo phone');

      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, ERROR_CODES.PATIENT_NOT_FOUND);
      }

      const contacts = {
        primary: {
          name: patient.userId.personalInfo ? 
            `${patient.userId.personalInfo.firstName} ${patient.userId.personalInfo.lastName}` : 'N/A',
          email: patient.userId.email,
          phone: patient.userId.personalInfo?.phone,
          address: patient.userId.personalInfo?.address
        },
        emergency: patient.getEmergencyContacts(),
        physician: patient.emergencyInfo.primaryPhysician ? {
          name: patient.emergencyInfo.primaryPhysician.personalInfo ?
            `${patient.emergencyInfo.primaryPhysician.personalInfo.firstName} ${patient.emergencyInfo.primaryPhysician.personalInfo.lastName}` : 'N/A',
          phone: patient.emergencyInfo.primaryPhysician.personalInfo?.phone
        } : null
      };

      return contacts;

    } catch (error) {
      console.error('❌ [SERVICE] Get patient contacts failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN DỊ ỨNG CHI TIẾT
   */
  async getPatientAllergies(patientId, activeOnly = true) {
    try {
      const patient = await Patient.findOne({ patientId })
        .populate('allergies.reportedBy', 'personalInfo');

      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, ERROR_CODES.PATIENT_NOT_FOUND);
      }

      let allergies = patient.allergies;
      
      if (activeOnly) {
        allergies = allergies.filter(allergy => allergy.isActive);
      }

      // 🎯 PHÂN LOẠI THEO MỨC ĐỘ NGHIÊM TRỌNG
      const categorizedAllergies = {
        LIFE_THREATENING: allergies.filter(a => a.severity === 'LIFE_THREATENING'),
        SEVERE: allergies.filter(a => a.severity === 'SEVERE'),
        MODERATE: allergies.filter(a => a.severity === 'MODERATE'),
        MILD: allergies.filter(a => a.severity === 'MILD')
      };

      return {
        patientId: patient.patientId,
        totalAllergies: allergies.length,
        activeAllergies: allergies.filter(a => a.isActive).length,
        categorizedAllergies,
        summary: {
          hasLifeThreatening: categorizedAllergies.LIFE_THREATENING.length > 0,
          mostCommonAllergen: this.getMostCommonAllergen(allergies),
          lastReported: allergies.length > 0 ? 
            new Date(Math.max(...allergies.map(a => new Date(a.reportedDate)))) : null
        }
      };

    } catch (error) {
      console.error('❌ [SERVICE] Get patient allergies failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 CẬP NHẬT THÔNG TIN DỊ ỨNG
   */
  async updatePatientAllergies(patientId, allergyUpdates, updatedBy) {
    try {
      const patient = await Patient.findOne({ patientId });
      
      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, ERROR_CODES.PATIENT_NOT_FOUND);
      }

      const { operation, allergyData } = allergyUpdates;
      
      let updateResult;

      switch (operation) {
        case 'ADD':
          const newAllergy = {
            ...allergyData,
            reportedBy: updatedBy,
            reportedDate: new Date()
          };
          patient.allergies.push(newAllergy);
          updateResult = await patient.save();
          break;

        case 'UPDATE':
          const allergyIndex = patient.allergies.findIndex(
            a => a._id.toString() === allergyData.allergyId
          );
          
          if (allergyIndex === -1) {
            throw new AppError('Không tìm thấy dị ứng cần cập nhật', 404, ERROR_CODES.RESOURCE_NOT_FOUND);
          }

          patient.allergies[allergyIndex] = {
            ...patient.allergies[allergyIndex].toObject(),
            ...allergyData,
            _id: patient.allergies[allergyIndex]._id // Giữ nguyên ID
          };
          updateResult = await patient.save();
          break;

        case 'DEACTIVATE':
          const deactivateIndex = patient.allergies.findIndex(
            a => a._id.toString() === allergyData.allergyId
          );
          
          if (deactivateIndex === -1) {
            throw new AppError('Không tìm thấy dị ứng cần vô hiệu hóa', 404, ERROR_CODES.RESOURCE_NOT_FOUND);
          }

          patient.allergies[deactivateIndex].isActive = false;
          updateResult = await patient.save();
          break;

        default:
          throw new AppError('Operation không hợp lệ', 400, ERROR_CODES.VALIDATION_FAILED);
      }

      console.log('✅ [SERVICE] Patient allergies updated for:', patientId);
      return updateResult;

    } catch (error) {
      console.error('❌ [SERVICE] Update patient allergies failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN BẢO HIỂM CHI TIẾT
   */
  async getPatientInsurance(patientId) {
    try {
      const patient = await Patient.findOne({ patientId })
        .populate('insurance.verifiedBy', 'personalInfo');

      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, ERROR_CODES.PATIENT_NOT_FOUND);
      }

      const insuranceInfo = patient.insurance;
      const verificationStatus = this.verifyInsurance(insuranceInfo);

      return {
        patientId: patient.patientId,
        insurance: insuranceInfo,
        verificationStatus,
        coverage: this.calculateCoverage(insuranceInfo),
        alerts: this.getInsuranceAlerts(insuranceInfo)
      };

    } catch (error) {
      console.error('❌ [SERVICE] Get patient insurance failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY TIỀN SỬ GIA ĐÌNH
   */
  async getPatientFamilyHistory(patientId) {
    try {
      const patient = await Patient.findOne({ patientId });

      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, ERROR_CODES.PATIENT_NOT_FOUND);
      }

      // 🎯 PHÂN TÍCH TIỀN SỬ GIA ĐÌNH
      const geneticConditions = patient.familyHistory.filter(fh => fh.isGenetic);
      const commonConditions = this.analyzeFamilyHistory(patient.familyHistory);

      return {
        patientId: patient.patientId,
        familyHistory: patient.familyHistory,
        analysis: {
          totalConditions: patient.familyHistory.length,
          geneticConditions: geneticConditions.length,
          commonConditions,
          riskAssessment: this.assessGeneticRisk(geneticConditions)
        },
        recommendations: this.generateFamilyHistoryRecommendations(patient.familyHistory)
      };

    } catch (error) {
      console.error('❌ [SERVICE] Get patient family history failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 CẬP NHẬT TIỀN SỬ GIA ĐÌNH
   */
  async updatePatientFamilyHistory(patientId, familyHistoryData, updatedBy) {
    try {
      const patient = await Patient.findOne({ patientId });
      
      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, ERROR_CODES.PATIENT_NOT_FOUND);
      }

      const { operation, historyData } = familyHistoryData;
      
      let updateResult;

      switch (operation) {
        case 'ADD':
          patient.familyHistory.push(historyData);
          updateResult = await patient.save();
          break;

        case 'UPDATE':
          const historyIndex = patient.familyHistory.findIndex(
            fh => fh._id.toString() === historyData.historyId
          );
          
          if (historyIndex === -1) {
            throw new AppError('Không tìm thấy tiền sử cần cập nhật', 404, ERROR_CODES.RESOURCE_NOT_FOUND);
          }

          patient.familyHistory[historyIndex] = {
            ...patient.familyHistory[historyIndex].toObject(),
            ...historyData,
            _id: patient.familyHistory[historyIndex]._id
          };
          updateResult = await patient.save();
          break;

        case 'REMOVE':
          patient.familyHistory = patient.familyHistory.filter(
            fh => fh._id.toString() !== historyData.historyId
          );
          updateResult = await patient.save();
          break;

        default:
          throw new AppError('Operation không hợp lệ', 400, ERROR_CODES.VALIDATION_FAILED);
      }

      console.log('✅ [SERVICE] Patient family history updated for:', patientId);
      return updateResult;

    } catch (error) {
      console.error('❌ [SERVICE] Update patient family history failed:', error.message);
      throw error;
    }
  }

  // 🛠️ HELPER METHODS

  /**
   * 🎯 TÌM DỊ ỨNG PHỔ BIẾN NHẤT
   */
  getMostCommonAllergen(allergies) {
    if (allergies.length === 0) return null;
    
    const allergenCount = {};
    allergies.forEach(allergy => {
      allergenCount[allergy.allergen] = (allergenCount[allergy.allergen] || 0) + 1;
    });
    
    return Object.keys(allergenCount).reduce((a, b) => 
      allergenCount[a] > allergenCount[b] ? a : b
    );
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

    if (insurance.effectiveDate && new Date(insurance.effectiveDate) > now) {
      return 'PENDING';
    }

    return insurance.verificationStatus || 'UNVERIFIED';
  }

  /**
   * 🎯 TÍNH TOÁN MỨC ĐỘ BẢO HIỂM
   */
  calculateCoverage(insurance) {
    if (!insurance.provider) return 'NO_COVERAGE';
    
    // Logic tính toán phức tạp hơn có thể tích hợp với hệ thống bảo hiểm
    const providersWithFullCoverage = ['BAOVIET', 'BIC', 'PVI'];
    
    if (providersWithFullCoverage.includes(insurance.provider.toUpperCase())) {
      return 'FULL_COVERAGE';
    }
    
    return 'BASIC_COVERAGE';
  }

  /**
   * 🎯 CẢNH BÁO BẢO HIỂM
   */
  getInsuranceAlerts(insurance) {
    const alerts = [];
    const now = new Date();

    if (!insurance.provider) {
      alerts.push('MISSING_PROVIDER');
    }

    if (!insurance.policyNumber) {
      alerts.push('MISSING_POLICY_NUMBER');
    }

    if (insurance.expirationDate && new Date(insurance.expirationDate) < now) {
      alerts.push('EXPIRED_POLICY');
    }

    if (insurance.effectiveDate && new Date(insurance.effectiveDate) > now) {
      alerts.push('PENDING_EFFECTIVE_DATE');
    }

    return alerts;
  }

  /**
   * 🎯 PHÂN TÍCH TIỀN SỬ GIA ĐÌNH
   */
  analyzeFamilyHistory(familyHistory) {
    const conditionCount = {};
    
    familyHistory.forEach(history => {
      conditionCount[history.condition] = (conditionCount[history.condition] || 0) + 1;
    });

    return Object.entries(conditionCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([condition, count]) => ({ condition, count }));
  }

  /**
   * 🎯 ĐÁNH GIÁ RỦI RO DI TRUYỀN
   */
  assessGeneticRisk(geneticConditions) {
    if (geneticConditions.length === 0) return 'LOW';
    
    const highRiskConditions = ['BREAST_CANCER', 'COLON_CANCER', 'HEART_DISEASE', 'DIABETES'];
    const highRiskCount = geneticConditions.filter(condition => 
      highRiskConditions.some(hrc => condition.condition.toUpperCase().includes(hrc))
    ).length;

    if (highRiskCount >= 2) return 'HIGH';
    if (highRiskCount >= 1) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * 🎯 ĐỀ XUẤT DỰA TRÊN TIỀN SỬ GIA ĐÌNH
   */
  generateFamilyHistoryRecommendations(familyHistory) {
    const recommendations = [];
    const geneticConditions = familyHistory.filter(fh => fh.isGenetic);

    if (geneticConditions.length > 0) {
      recommendations.push({
        type: 'GENETIC_COUNSELING',
        priority: 'HIGH',
        message: 'Cân nhắc tư vấn di truyền do tiền sử gia đình có bệnh di truyền'
      });
    }

    const cancerHistory = familyHistory.filter(fh => 
      fh.condition.toLowerCase().includes('cancer')
    );

    if (cancerHistory.length > 0) {
      recommendations.push({
        type: 'CANCER_SCREENING',
        priority: 'MEDIUM',
        message: 'Tầm soát ung thư định kỳ được khuyến nghị'
      });
    }

    const heartDiseaseHistory = familyHistory.filter(fh => 
      fh.condition.toLowerCase().includes('heart')
    );

    if (heartDiseaseHistory.length > 0) {
      recommendations.push({
        type: 'CARDIAC_MONITORING',
        priority: 'MEDIUM',
        message: 'Theo dõi sức khỏe tim mạch định kỳ'
      });
    }

    return recommendations;
  }
  async searchPatients(searchCriteria) {
    try {
      const {
        keyword,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        bloodType,
        riskLevel,
        admissionStatus
      } = searchCriteria;

      console.log('🔍 [SERVICE] Searching patients with criteria:', searchCriteria);

      // 🎯 XÂY DỰNG QUERY TÌM KIẾM
      const query = {};
      
      // Tìm kiếm theo keyword
      if (keyword) {
        const keywordRegex = new RegExp(keyword, 'i');
        query.$or = [
          { patientId: keywordRegex },
          { 'userId.personalInfo.firstName': keywordRegex },
          { 'userId.personalInfo.lastName': keywordRegex },
          { 'userId.email': keywordRegex },
          { 'userId.personalInfo.phone': keywordRegex }
        ];
      }

      // Lọc theo bloodType
      if (bloodType && bloodType !== 'UNKNOWN') {
        query.bloodType = bloodType;
      }

      // Lọc theo riskLevel
      if (riskLevel) {
        query.riskLevel = riskLevel;
      }

      // Lọc theo admissionStatus
      if (admissionStatus) {
        query.admissionStatus = admissionStatus;
      }

      // 🎯 THIẾT LẬP SORTING
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // 🎯 THỰC HIỆN QUERY VỚI PAGINATION
      const skip = (page - 1) * limit;

      const patients = await Patient.find(query)
        .populate('userId', 'personalInfo email phone status')
        .populate('createdBy', 'personalInfo email')
        .populate('emergencyInfo.primaryPhysician', 'personalInfo')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean();

      // 🎯 ĐẾN TỔNG SỐ KẾT QUẢ
      const total = await Patient.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      // 🎯 FORMAT KẾT QUẢ
      const formattedPatients = patients.map(patient => ({
        _id: patient._id,
        patientId: patient.patientId,
        personalInfo: patient.userId?.personalInfo || {},
        email: patient.userId?.email,
        phone: patient.userId?.personalInfo?.phone,
        bloodType: patient.bloodType,
        riskLevel: patient.riskLevel,
        admissionStatus: patient.admissionStatus,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt
      }));

      return {
        patients: formattedPatients,
        pagination: {
          currentPage: page,
          totalPages,
          totalPatients: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        searchSummary: {
          keyword,
          filters: {
            bloodType,
            riskLevel,
            admissionStatus
          },
          sort: {
            by: sortBy,
            order: sortOrder
          }
        }
      };

    } catch (error) {
      console.error('❌ [SERVICE] Search patients failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN NHÂN KHẨU BỆNH NHÂN - METHOD BỊ THIẾU
   */
  async getPatientDemographics(patientId) {
    try {
      console.log('📋 [SERVICE] Getting demographics for:', patientId);

      const patient = await Patient.findOne({ patientId })
        .populate('userId', 'personalInfo email phone address')
        .populate('createdBy', 'personalInfo email')
        .populate('emergencyInfo.primaryPhysician', 'personalInfo phone');

      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, ERROR_CODES.PATIENT_NOT_FOUND);
      }

      // 🎯 TÍNH TOÁN THÔNG TIN BỔ SUNG
      const age = patient.userId?.personalInfo?.dateOfBirth 
        ? calculateAge(patient.userId.personalInfo.dateOfBirth)
        : null;

      const bmi = patient.height && patient.weight 
        ? (patient.weight / ((patient.height / 100) ** 2)).toFixed(1)
        : null;

      const demographics = {
        patientId: patient.patientId,
        personalInfo: {
          ...patient.userId.personalInfo,
          age,
          fullName: `${patient.userId.personalInfo.firstName} ${patient.userId.personalInfo.lastName}`
        },
        medicalInfo: {
          bloodType: patient.bloodType,
          height: patient.height,
          weight: patient.weight,
          bmi,
          riskLevel: patient.riskLevel
        },
        contactInfo: {
          email: patient.userId.email,
          phone: patient.userId.personalInfo.phone,
          address: patient.userId.personalInfo.address
        },
        emergencyInfo: patient.emergencyInfo,
        lifestyle: patient.lifestyle,
        preferences: patient.preferences,
        metadata: {
          createdAt: patient.createdAt,
          updatedAt: patient.updatedAt,
          createdBy: patient.createdBy?.personalInfo
        }
      };

      return demographics;

    } catch (error) {
      console.error('❌ [SERVICE] Get patient demographics failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 CẬP NHẬT THÔNG TIN NHÂN KHẨU - METHOD BỊ THIẾU
   */
  async updatePatientDemographics(patientId, updateData, updatedBy) {
    try {
      console.log('✏️ [SERVICE] Updating demographics for:', patientId);

      const patient = await Patient.findOne({ patientId })
        .populate('userId');

      if (!patient || !patient.userId) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, ERROR_CODES.PATIENT_NOT_FOUND);
      }

      // 🎯 CẬP NHẬT THÔNG TIN USER (personalInfo)
      const userUpdates = {};
      if (updateData.firstName) userUpdates['personalInfo.firstName'] = updateData.firstName;
      if (updateData.lastName) userUpdates['personalInfo.lastName'] = updateData.lastName;
      if (updateData.phone) userUpdates['personalInfo.phone'] = updateData.phone;
      if (updateData.dateOfBirth) userUpdates['personalInfo.dateOfBirth'] = updateData.dateOfBirth;
      if (updateData.gender) userUpdates['personalInfo.gender'] = updateData.gender;
      if (updateData.address) userUpdates['personalInfo.address'] = updateData.address;

      if (Object.keys(userUpdates).length > 0) {
        await User.findByIdAndUpdate(
          patient.userId._id,
          { $set: userUpdates },
          { new: true, runValidators: true }
        );
      }

      // 🎯 CẬP NHẬT THÔNG TIN PATIENT
      const patientUpdates = {};
      if (updateData.bloodType) patientUpdates.bloodType = updateData.bloodType;
      if (updateData.height) patientUpdates.height = updateData.height;
      if (updateData.weight) patientUpdates.weight = updateData.weight;
      if (updateData.emergencyInfo) patientUpdates.emergencyInfo = updateData.emergencyInfo;
      if (updateData.lifestyle) patientUpdates.lifestyle = updateData.lifestyle;
      if (updateData.preferences) patientUpdates.preferences = updateData.preferences;

      if (Object.keys(patientUpdates).length > 0) {
        patientUpdates.updatedBy = updatedBy;
        Object.assign(patient, patientUpdates);
        await patient.save();
      }

      // 🎯 LẤY KẾT QUẢ CẬP NHẬT
      const updatedPatient = await Patient.findOne({ patientId })
        .populate('userId', 'personalInfo email phone address')
        .populate('updatedBy', 'personalInfo email');

      console.log('✅ [SERVICE] Patient demographics updated for:', patientId);
      return updatedPatient;

    } catch (error) {
      console.error('❌ [SERVICE] Update patient demographics failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 NHẬP VIỆN BỆNH NHÂN - CẢI TIẾN VỚI VALIDATION CHẶT CHẼ
   */
  async admitPatient(patientId, admissionData, admittedBy) {
    try {
      console.log('🏥 [SERVICE] Admitting patient:', patientId);

      const patient = await Patient.findOne({ patientId });

      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, ERROR_CODES.PATIENT_NOT_FOUND);
      }

      // ⚠️ QUAN TRỌNG: CHECK XEM BỆNH NHÂN ĐÃ Ở TRONG VIỆN CHƯA
      if (patient.admissionStatus === 'ADMITTED') {
        throw new AppError(
          `Bệnh nhân đang điều trị tại ${patient.currentAdmission.department}, Phòng ${patient.currentAdmission.room}`,
          400,
          ERROR_CODES.INVALID_OPERATION
        );
      }

      // 🎯 VALIDATE DỮ LIỆU NHẬP VIỆN
      if (!admissionData.department || !admissionData.room || !admissionData.bed) {
        throw new AppError('Thiếu thông tin khoa/phòng/giường', 400, ERROR_CODES.VALIDATION_FAILED);
      }

      if (!admissionData.diagnosis) {
        throw new AppError('Phải có chẩn đoán nhập viện', 400, ERROR_CODES.VALIDATION_FAILED);
      }

      // ⚠️ QUAN TRỌNG: CHECK GIƯỜNG TRỐNG
      const existingBed = await Patient.findOne({
        admissionStatus: 'ADMITTED',
        'currentAdmission.room': admissionData.room,
        'currentAdmission.bed': admissionData.bed,
        'currentAdmission.department': admissionData.department
      });

      if (existingBed) {
        throw new AppError(
          `Giường ${admissionData.bed} - Phòng ${admissionData.room} đã có bệnh nhân`,
          400,
          'BED_OCCUPIED'
        );
      }

      // 🎯 TẠO THÔNG TIN NHẬP VIỆN
      const admissionRecord = {
        admissionDate: new Date(),
        department: admissionData.department,
        room: admissionData.room,
        bed: admissionData.bed,
        diagnosis: admissionData.diagnosis,
        attendingDoctor: admissionData.attendingDoctor,
        notes: admissionData.notes,
        admittedBy: admittedBy
      };

      // 🎯 CẬP NHẬT TRẠNG THÁI BỆNH NHÂN
      patient.admissionStatus = 'ADMITTED';
      patient.currentAdmission = admissionRecord;
      patient.admissionHistory = patient.admissionHistory || [];
      patient.admissionHistory.push(admissionRecord);

      await patient.save();

      console.log(`✅ [SERVICE] Patient admitted: ${patientId} -> ${admissionData.department}/${admissionData.room}/${admissionData.bed}`);

      // 🎯 POPULATE KẾT QUẢ
      const result = await Patient.findOne({ patientId })
        .populate('currentAdmission.attendingDoctor', 'personalInfo')
        .populate('currentAdmission.admittedBy', 'personalInfo');

      return result.currentAdmission;

    } catch (error) {
      console.error('❌ [SERVICE] Admit patient failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 XUẤT VIỆN BỆNH NHÂN - CẢI TIẾN VỚI TỰ ĐỘNG TẠO HÓA ĐƠN VÀ TỔNG HỢP CHI PHÍ
   */
  async dischargePatient(patientId, dischargeData, dischargedBy) {
    try {
      console.log('🎉 [SERVICE] Discharging patient:', patientId);

      const patient = await Patient.findOne({ patientId }).populate('userId');

      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, ERROR_CODES.PATIENT_NOT_FOUND);
      }

      // 🎯 KIỂM TRA BỆNH NHÂN ĐÃ NHẬP VIỆN CHƯA
      if (patient.admissionStatus !== 'ADMITTED') {
        throw new AppError('Bệnh nhân chưa nhập viện', 400, ERROR_CODES.INVALID_OPERATION);
      }

      // ⚠️ VALIDATE DỮ LIỆU XUẤT VIỆN BẮT BUỘC
      if (!dischargeData.dischargeReason) {
        throw new AppError('Phải có lý do xuất viện', 400, ERROR_CODES.VALIDATION_FAILED);
      }

      if (!dischargeData.condition) {
        throw new AppError('Phải ghi nhận tình trạng khi xuất viện', 400, ERROR_CODES.VALIDATION_FAILED);
      }

      // 🎯 TÍNH TOÁN THỜI GIAN NẰM VIỆN
      const admissionDate = patient.currentAdmission.admissionDate;
      const dischargeDate = new Date();
      const daysInHospital = Math.ceil((dischargeDate - admissionDate) / (1000 * 60 * 60 * 24));

      console.log(`📊 [SERVICE] Days in hospital: ${daysInHospital}`);

      // 🎯 CẬP NHẬT THÔNG TIN XUẤT VIỆN
      const dischargeRecord = {
        dischargeDate,
        dischargeReason: dischargeData.dischargeReason,
        condition: dischargeData.condition,
        followUpInstructions: dischargeData.followUpInstructions,
        medicationsAtDischarge: dischargeData.medicationsAtDischarge || [],
        dischargedBy: dischargedBy,
        daysInHospital
      };

      // 🎯 CẬP NHẬT LỊCH SỬ NHẬP VIỆN
      const currentAdmissionIndex = patient.admissionHistory.length - 1;
      if (currentAdmissionIndex >= 0) {
        patient.admissionHistory[currentAdmissionIndex] = {
          ...patient.admissionHistory[currentAdmissionIndex].toObject(),
          ...dischargeRecord
        };
      }

      // 🎯 CẬP NHẬT TRẠNG THÁI (LUÔN CẬP NHẬT TRẠNG THÁI)
      patient.admissionStatus = 'DISCHARGED';
      patient.currentAdmission = null;

      await patient.save();

      // ⚠️ QUAN TRỌNG: TỰ ĐỘNG TẠO HÓA ĐƠN KHI XUẤT VIỆN
      let generatedBill = null;
      try {
        const Bill = require('../models/bill.model');
        
        // TỔNG HỢP CHI PHÍ
        const billItems = [];
        
        // 1. Chi phí giường bệnh (tính theo ngày)
        const bedFeePerDay = 500000; // 500k/ngày
        billItems.push({
          description: `Tiền giường bệnh (${daysInHospital} ngày)`,
          category: 'ROOM',
          quantity: daysInHospital,
          unitPrice: bedFeePerDay,
          amount: daysInHospital * bedFeePerDay
        });

        // 2. Chi phí khám và điều trị cơ bản
        const consultationFee = 200000;
        billItems.push({
          description: 'Phí khám và điều trị',
          category: 'CONSULTATION',
          quantity: 1,
          unitPrice: consultationFee,
          amount: consultationFee
        });

        // 3. Tính tổng tiền
        const totalAmount = billItems.reduce((sum, item) => sum + item.amount, 0);
        const taxAmount = totalAmount * 0.1; // VAT 10%
        const finalAmount = totalAmount + taxAmount;

        // ÁP DỤNG BẢO HIỂM NẾU CÓ
        let insuranceCovered = 0;
        if (patient.insurance && patient.insurance.provider) {
          // Giả sử bảo hiểm chi trả 70%
          insuranceCovered = finalAmount * 0.7;
        }

        const patientPayAmount = finalAmount - insuranceCovered;

        // TẠO MÃ HÓA ĐƠN
        const billCount = await Bill.countDocuments();
        const billNumber = `HD${String(billCount + 1).padStart(8, '0')}`;

        const newBill = new Bill({
          billNumber,
          patientId: patient.userId._id,
          patientInfo: {
            name: `${patient.userId.personalInfo.firstName} ${patient.userId.personalInfo.lastName}`,
            phone: patient.userId.personalInfo.phone,
            address: patient.userId.personalInfo.address,
            email: patient.userId.email
          },
          items: billItems,
          totalAmount,
          taxRate: 10,
          taxAmount,
          finalAmount,
          insuranceCovered,
          patientPayAmount,
          status: 'PENDING',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
          notes: `Hóa đơn xuất viện - ${dischargeData.dischargeReason}`,
          createdBy: dischargedBy
        });

        generatedBill = await newBill.save();
        console.log(`💰 [SERVICE] Auto-generated bill: ${billNumber} - Amount: ${patientPayAmount.toLocaleString()} VNĐ`);

      } catch (billError) {
        console.error('❌ [SERVICE] Failed to auto-generate bill:', billError.message);
        // Không throw error, vẫn cho xuất viện thành công
      }

      console.log('✅ [SERVICE] Patient discharged successfully:', patientId);
      
      return {
        dischargeRecord,
        daysInHospital,
        bill: generatedBill ? {
          billNumber: generatedBill.billNumber,
          totalAmount: generatedBill.finalAmount,
          insuranceCovered: generatedBill.insuranceCovered,
          patientPayAmount: generatedBill.patientPayAmount
        } : null
      };

    } catch (error) {
      console.error('❌ [SERVICE] Discharge patient failed:', error.message);
      throw error;
    }
  }
}

module.exports = new PatientService();