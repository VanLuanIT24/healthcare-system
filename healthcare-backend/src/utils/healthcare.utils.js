//src/utils/healthcare.utils.js
const Patient = require('../models/patient.model');

/**
 * 🎯 TẠO PATIENT ID TỰ ĐỘNG
 */
async function generatePatientId() {
  try {
    const currentYear = new Date().getFullYear();
    const prefix = `BN${currentYear.toString().slice(-2)}`;
    
    // 🎯 TÌM PATIENT CUỐI CÙNG TRONG NĂM
    const lastPatient = await Patient.findOne({
      patientId: new RegExp(`^${prefix}`)
    }).sort({ patientId: -1 });
    
    let sequence = 1;
    if (lastPatient && lastPatient.patientId) {
      const lastSequence = parseInt(lastPatient.patientId.slice(-4));
      sequence = lastSequence + 1;
    }
    
    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('❌ Lỗi tạo patient ID:', error);
    // 🎯 FALLBACK: SỬ DỤNG TIMESTAMP
    return `BN${Date.now().toString().slice(-8)}`;
  }
}

/**
 * 🎯 TÍNH TUỔI TỪ NGÀY SINH
 */
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * 🎯 ĐỊNH DẠNG SỐ ĐIỆN THOẠI
 */
function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  // 🎯 XÓA TẤT CẢ KÝ TỰ KHÔNG PHẢI SỐ
  const cleaned = phone.replace(/\D/g, '');
  
  // 🎯 ĐỊNH DẠNG SỐ VIỆT NAM
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return `+84 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('84')) {
    return `+84 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  return phone;
}

/**
 * 🎯 VALIDATE EMAIL CHO TỔ CHỨC Y TẾ
 */
function validateHealthcareEmail(email) {
  const healthcareDomains = [
    'hospital.com',
    'clinic.com', 
    'health.gov',
    'medical.org'
  ];
  
  const domain = email.split('@')[1];
  return healthcareDomains.includes(domain);
}

/**
 * 🎯 TẠO MÃ XÁC NHẬN Y TẾ
 * @param {string|number} prefixOrLength - Prefix (e.g., 'PR', 'LAB', 'CONS') or length if number
 * @param {number} length - Length of random part (default 10)
 * @returns {string} Generated code with prefix if provided
 */
function generateMedicalCode(prefixOrLength = 8, length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  // If first parameter is a number, it's the old API (length only)
  if (typeof prefixOrLength === 'number') {
    let result = '';
    for (let i = 0; i < prefixOrLength; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  // New API: prefix + random code
  const prefix = prefixOrLength;
  let result = prefix;
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

function calculatePatientPriority(patientData) {
  let priorityScore = 0;

  // Tuổi (trẻ em và người già có điểm cao hơn)
  const age = calculateAge(patientData.dateOfBirth);
  if (age < 5 || age > 65) priorityScore += 2;
  if (age < 1 || age > 80) priorityScore += 3;

  // Tình trạng bệnh mãn tính
  if (patientData.chronicConditions && patientData.chronicConditions.length > 0) {
    priorityScore += patientData.chronicConditions.length;
    
    // Bệnh nghiêm trọng
    const severeConditions = ['DIABETES', 'HEART_DISEASE', 'CANCER', 'KIDNEY_FAILURE'];
    patientData.chronicConditions.forEach(condition => {
      if (severeConditions.includes(condition.condition.toUpperCase())) {
        priorityScore += 2;
      }
    });
  }

  // Dị ứng nghiêm trọng
  if (patientData.allergies && patientData.allergies.length > 0) {
    const severeAllergies = patientData.allergies.filter(
      allergy => allergy.severity === 'SEVERE' || allergy.severity === 'LIFE_THREATENING'
    );
    priorityScore += severeAllergies.length * 2;
  }

  // Phân loại dựa trên điểm
  if (priorityScore >= 8) return 'CRITICAL';
  if (priorityScore >= 5) return 'HIGH';
  if (priorityScore >= 3) return 'MEDIUM';
  return 'LOW';
}

function getPriorityLabel(priority) {
  const labels = {
    1: 'CẤP CỨU',
    2: 'KHẨN CẤP', 
    3: 'ƯU TIÊN CAO',
    4: 'ƯU TIÊN',
    5: 'KHÔNG KHẨN CẤP'
  };
  return labels[priority] || 'KHÔNG XÁC ĐỊNH';
}

function getPriorityColor(priority) {
  const colors = {
    1: '#ff0000',
    2: '#ff6b00',
    3: '#ffa500', 
    4: '#ffff00',
    5: '#00ff00'
  };
  return colors[priority] || '#cccccc';
}

module.exports = {
  generatePatientId,
  calculateAge,
  formatPhoneNumber,
  validateHealthcareEmail,
  generateMedicalCode,
  calculatePatientPriority,
  getPriorityLabel,
  getPriorityColor
};