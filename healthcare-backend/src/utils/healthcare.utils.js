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
 */
function generateMedicalCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * 🎯 KIỂM TRA ĐỘ ƯU TIÊN BỆNH NHÂN
 */
function calculatePatientPriority(vitals, conditions = []) {
  let priority = 5; // Mặc định: Không khẩn cấp
  
  // 🎯 KIỂM TRA DẤU HIỆU SINH TỒN
  if (vitals) {
    if (vitals.heartRate > 140 || vitals.heartRate < 40) priority = 1;
    else if (vitals.bloodPressureSystolic > 180 || vitals.bloodPressureDiastolic > 120) priority = 1;
    else if (vitals.oxygenSaturation < 90) priority = 2;
    else if (vitals.temperature > 39.5) priority = 3;
  }
  
  // 🎯 KIỂM TRA TÌNH TRẠNG BỆNH
  const emergencyConditions = ['HEART_ATTACK', 'STROKE', 'SEVERE_TRAUMA', 'RESPIRATORY_FAILURE'];
  if (conditions.some(condition => emergencyConditions.includes(condition))) {
    priority = 1;
  }
  
  return {
    level: priority,
    label: getPriorityLabel(priority),
    color: getPriorityColor(priority)
  };
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
  calculatePatientPriority
};