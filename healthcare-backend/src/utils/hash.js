// src/utils/hash.js
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { appConfig } = require("../config");

/**
 * 🛡️ TIỆN ÍCH MÃ HÓA VÀ BẢO MẬT
 * - Mã hóa mật khẩu với bcrypt
 * - Tạo token ngẫu nhiên
 * - Hash dữ liệu cơ bản
 */

const SALT_ROUNDS = appConfig.security.saltRounds || 12;

/**
 * 🎯 MÃ HÓA MẬT KHẨU
 */
async function hashPassword(plainPassword) {
  if (!plainPassword || plainPassword.length < 8) {
    throw new Error("Mật khẩu phải có ít nhất 8 ký tự");
  }

  try {
    const hashed = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    // Validate kết quả
    if (!hashed || hashed.length < 60) {
      throw new Error("Lỗi mã hóa mật khẩu");
    }

    return hashed;
  } catch (error) {
    console.error("❌ Lỗi mã hóa mật khẩu:", error.message);
    throw new Error("Không thể mã hóa mật khẩu");
  }
}

/**
 * 🎯 SO SÁNH MẬT KHẨU - ĐÃ THÊM DEBUG
 */
async function comparePassword(plainPassword, hashedPassword) {
  console.log("🔑 [HASH DEBUG] Starting password comparison");
  console.log("🔑 [HASH DEBUG] Input:", {
    plainPassword: plainPassword
      ? `${plainPassword.substring(0, 3)}...`
      : "NULL",
    plainLength: plainPassword ? plainPassword.length : 0,
    hashPrefix: hashedPassword
      ? `${hashedPassword.substring(0, 20)}...`
      : "NULL",
    hashLength: hashedPassword ? hashedPassword.length : 0,
  });

  if (!plainPassword || !hashedPassword) {
    console.log("❌ [HASH DEBUG] Missing password or hash");
    return false;
  }

  // Kiểm tra định dạng hash
  if (
    !hashedPassword.startsWith("$2a$") &&
    !hashedPassword.startsWith("$2b$")
  ) {
    console.log("❌ [HASH DEBUG] Invalid hash format");
    return false;
  }

  try {
    const result = await bcrypt.compare(plainPassword, hashedPassword);
    console.log("✅ [HASH DEBUG] Password comparison result:", result);
    return result;
  } catch (error) {
    console.error("❌ [HASH DEBUG] Compare password error:", error.message);
    return false;
  }
}

/**
 * 🎯 KIỂM TRA ĐỘ MẠNH MẬT KHẨU
 */
function validatePasswordStrength(password) {
  if (!password) {
    return {
      isValid: false,
      score: 0,
      errors: ["Mật khẩu không được để trống"],
      suggestions: ["Nhập mật khẩu"],
    };
  }

  const requirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
  };

  const errors = [];

  if (!requirements.minLength) {
    errors.push("🔹 Ít nhất 8 ký tự");
  }
  if (!requirements.hasUpperCase) {
    errors.push("🔹 Ít nhất 1 chữ hoa (A-Z)");
  }
  if (!requirements.hasLowerCase) {
    errors.push("🔹 Ít nhất 1 chữ thường (a-z)");
  }
  if (!requirements.hasNumbers) {
    errors.push("🔹 Ít nhất 1 số (0-9)");
  }

  const score = Object.values(requirements).filter(Boolean).length;
  const isStrong = errors.length === 0;

  return {
    isValid: isStrong,
    score: score,
    maxScore: 4,
    errors: errors,
    suggestions: isStrong
      ? ["✅ Mật khẩu mạnh!"]
      : ["💡 Thêm ký tự đặc biệt (!@#$%^&*) để mật khẩu còn mạnh hơn"],
  };
}

/**
 * 🎯 TẠO TOKEN NGẪU NHIÊN DẠNG HEX
 */
function randomTokenHex(size = 32) {
  if (size < 16) {
    throw new Error("Kích thước token phải ít nhất 16 bytes");
  }

  try {
    return crypto.randomBytes(size).toString("hex");
  } catch (error) {
    console.error("❌ Lỗi tạo token:", error.message);
    throw new Error("Không thể tạo token ngẫu nhiên");
  }
}

/**
 * 🎯 TẠO TOKEN DẠNG BASE64 URL SAFE
 */
function randomTokenBase64(size = 24) {
  try {
    return crypto.randomBytes(size).toString("base64url");
  } catch (error) {
    console.error("❌ Lỗi tạo base64 token:", error.message);
    throw new Error("Không thể tạo token base64");
  }
}

/**
 * 🎯 MÃ HÓA DỮ LIỆU VỚI SHA256
 */
function sha256(data) {
  if (!data) {
    throw new Error("Dữ liệu đầu vào không được để trống");
  }

  if (typeof data !== "string") {
    data = JSON.stringify(data);
  }

  try {
    return crypto.createHash("sha256").update(data).digest("hex");
  } catch (error) {
    console.error("❌ Lỗi hash SHA256:", error.message);
    throw new Error("Không thể mã hóa dữ liệu");
  }
}

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  randomTokenHex,
  randomTokenBase64,
  sha256,
};
