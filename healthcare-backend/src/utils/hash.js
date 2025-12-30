// src/utils/hash.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { appConfig } = require('../config');

const SALT_ROUNDS = appConfig.security.saltRounds || 12;
const isDev = process.env.NODE_ENV !== 'production';

async function hashPassword(plainPassword) {
  if (!plainPassword || plainPassword.length < 8) {
    throw new Error('Mật khẩu phải có ít nhất 8 ký tự');
  }

  const hashed = await bcrypt.hash(plainPassword, SALT_ROUNDS);
  if (!hashed || hashed.length < 60) {
    throw new Error('Lỗi mã hóa mật khẩu');
  }
  return hashed;
}

async function comparePassword(plainPassword, hashedPassword) {
  if (isDev) {
    console.log('🔑 [HASH DEBUG] Comparing password...');
  }

  if (!plainPassword || !hashedPassword) return false;
  if (!hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$')) return false;

  try {
    const result = await bcrypt.compare(plainPassword, hashedPassword);
    if (isDev) console.log('✅ [HASH DEBUG] Result:', result);
    return result;
  } catch (error) {
    if (isDev) console.error('❌ [HASH DEBUG] Error:', error.message);
    return false;
  }
}

function validatePasswordStrength(password) {
  if (!password) {
    return { isValid: false, score: 0, errors: ['Mật khẩu không được để trống'] };
  }

  const checks = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
  };

  const errors = [];
  if (!checks.minLength) errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  if (!checks.hasUpperCase) errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
  if (!checks.hasLowerCase) errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
  if (!checks.hasNumbers) errors.push('Mật khẩu phải có ít nhất 1 số');

  const score = Object.values(checks).filter(Boolean).length;

  return {
    isValid: errors.length === 0,
    score,
    maxScore: 4,
    errors,
  };
}

function randomTokenHex(size = 32) {
  return crypto.randomBytes(size).toString('hex');
}

function randomTokenBase64(size = 24) {
  return crypto.randomBytes(size).toString('base64url');
}

function sha256(data) {
  if (typeof data !== 'string') data = JSON.stringify(data);
  return crypto.createHash('sha256').update(data).digest('hex');
}

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  randomTokenHex,
  randomTokenBase64,
  sha256,
};