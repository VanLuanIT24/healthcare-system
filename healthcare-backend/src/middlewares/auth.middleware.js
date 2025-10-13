// src/middlewares/auth.middleware.js
const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/user.model');

/**
 * MIDDLEWARE XÁC THỰC NGƯỜI DÙNG
 * - Kiểm tra JWT token trong header Authorization
 * - Xác thực user và trạng thái tài khoản
 * - Gắn thông tin user vào request object
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object  
 * @param {Function} next - Next middleware function
 */
async function authenticate(req, res, next) {
  // 🔹 BỎ QUA XÁC THỰC NẾU ROUTE LÀ PUBLIC
  if (req.isPublic) {
    return next();
  }

  // 🔹 KIỂM TRA HEADER AUTHORIZATION
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Không tìm thấy header authorization' });
  }

  // 🔹 KIỂM TRA ĐỊNH DẠNG BEARER TOKEN
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Định dạng authorization không hợp lệ' });
  }

  const token = parts[1];

  try {
    // 🔹 XÁC THỰC ACCESS TOKEN
    const payload = verifyAccessToken(token);
    
    // 🔹 TÌM USER TRONG DATABASE
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'Không tìm thấy người dùng' });
    }

    // 🔹 KIỂM TRA TRẠNG THÁI TÀI KHOẢN
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Tài khoản không hoạt động' });
    }

    // ✅ GẮN THÔNG TIN USER VÀO REQUEST
    req.user = {
      sub: user._id,           // User ID
      email: user.email,       // Email
      role: user.role,         // Vai trò
      canCreate: user.canCreate, // Quyền tạo user
    };

    next(); // Chuyển đến middleware/controller tiếp theo

  } catch (err) {
    // 🔴 XỬ LÝ LỖI XÁC THỰC TOKEN
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

module.exports = { authenticate };