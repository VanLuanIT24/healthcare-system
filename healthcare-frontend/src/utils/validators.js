/**
 * Validation utility functions
 */

import { PATTERNS } from '@/constants/index';

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  return PATTERNS.EMAIL.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password) return { valid: false, message: 'Mật khẩu là bắt buộc' };
  if (password.length < 8) return { valid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Mật khẩu phải có ít nhất 1 chữ hoa' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Mật khẩu phải có ít nhất 1 chữ thường' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Mật khẩu phải có ít nhất 1 chữ số' };
  return { valid: true };
};

/**
 * Validate phone number
 */
export const validatePhone = (phone) => {
  return PATTERNS.PHONE.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Validate required field
 */
export const validateRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined && value !== '';
};

/**
 * Validate minimum length
 */
export const validateMinLength = (value, minLength) => {
  if (typeof value === 'string') {
    return value.length >= minLength;
  }
  return false;
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (value, maxLength) => {
  if (typeof value === 'string') {
    return value.length <= maxLength;
  }
  return false;
};

/**
 * Validate number range
 */
export const validateRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validate date
 */
export const validateDate = (date) => {
  const d = new Date(date);
  return !isNaN(d.getTime());
};

/**
 * Validate age (for DOB)
 */
export const validateAge = (dob, minAge = 0, maxAge = 150) => {
  const today = new Date();
  const birthDate = new Date(dob);
  
  if (isNaN(birthDate.getTime())) return false;
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= minAge && age <= maxAge;
};

/**
 * Validate URL
 */
export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate file type
 */
export const validateFileType = (file, allowedTypes = []) => {
  if (!file) return false;
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size (in bytes)
 */
export const validateFileSize = (file, maxSizeInMB = 5) => {
  if (!file) return false;
  return file.size <= maxSizeInMB * 1024 * 1024;
};

/**
 * Validate medication dosage
 */
export const validateDosage = (dosage, unit) => {
  const dosageNum = Number(dosage);
  return !isNaN(dosageNum) && dosageNum > 0 && unit;
};

/**
 * Validate appointment time (not in past)
 */
export const validateAppointmentTime = (appointmentTime) => {
  const now = new Date();
  const appointmentDate = new Date(appointmentTime);
  return appointmentDate > now;
};

/**
 * Form field validation rules
 */
export const validationRules = {
  email: {
    required: 'Email là bắt buộc',
    pattern: {
      value: PATTERNS.EMAIL,
      message: 'Email không hợp lệ',
    },
  },
  password: {
    required: 'Mật khẩu là bắt buộc',
    minLength: {
      value: 8,
      message: 'Mật khẩu phải có ít nhất 8 ký tự',
    },
  },
  phone: {
    pattern: {
      value: PATTERNS.PHONE,
      message: 'Số điện thoại không hợp lệ',
    },
  },
  required: (fieldName = 'Trường') => ({
    required: `${fieldName} là bắt buộc`,
  }),
  minLength: (fieldName = 'Trường', minLength = 3) => ({
    minLength: {
      value: minLength,
      message: `${fieldName} phải có ít nhất ${minLength} ký tự`,
    },
  }),
  maxLength: (fieldName = 'Trường', maxLength = 100) => ({
    maxLength: {
      value: maxLength,
      message: `${fieldName} không được vượt quá ${maxLength} ký tự`,
    },
  }),
};

/**
 * Validate entire form object
 */
export const validateForm = (data, schema) => {
  const errors = {};
  
  Object.keys(schema).forEach(field => {
    const rules = schema[field];
    const value = data[field];
    
    if (rules.required && !validateRequired(value)) {
      errors[field] = `${field} là bắt buộc`;
      return;
    }
    
    if (rules.email && !validateEmail(value)) {
      errors[field] = 'Email không hợp lệ';
      return;
    }
    
    if (rules.minLength && !validateMinLength(value, rules.minLength)) {
      errors[field] = `${field} phải có ít nhất ${rules.minLength} ký tự`;
      return;
    }
    
    if (rules.maxLength && !validateMaxLength(value, rules.maxLength)) {
      errors[field] = `${field} không được vượt quá ${rules.maxLength} ký tự`;
      return;
    }
  });
  
  return { isValid: Object.keys(errors).length === 0, errors };
};
