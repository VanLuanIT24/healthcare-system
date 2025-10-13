// src/controllers/auth.controller.js
const ms = require('ms');
const Joi = require('joi');
const authService = require('../services/auth.service');
const { registerSchema, loginSchema } = require('../validations/auth.validation');
const { log } = require('../services/audit.service');

/**
 * Tính thời gian sống của Refresh Token dựa trên cấu hình môi trường
 * @returns {number} Thời gian sống tính bằng mili giây
 */
function getRefreshExpiryMs() {
  const refreshExpiry = process.env.ACCESS_TOKEN_EXPIRES_IN || '7d';
  return ms(refreshExpiry);
}

/**
 * [POST] /api/auth/register
 * Đăng ký tài khoản người dùng mới
 * - Public: Cho phép bệnh nhân tự đăng ký (role: PATIENT)
 * - Private: Cho phép ADMIN/SUPER_ADMIN tạo user với các role khác
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function register(req, res) {
  try {
    // Kiểm tra và xác thực dữ liệu đầu vào
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const creator = req.user || null; // Người tạo user (có thể là admin hoặc null nếu tự đăng ký)
    const reqRole = value.role || 'PATIENT'; // Role mặc định là PATIENT

    // KIỂM TRA QUYỀN TẠO USER
    // Nếu có người tạo (admin) => kiểm tra quyền được tạo role
    if (creator) {
      if (!creator.canCreate || !creator.canCreate.includes(reqRole)) {
        return res.status(403).json({ error: 'Không có quyền tạo user với role này' });
      }
    } else {
      // Nếu không có creator (tự đăng ký) => chỉ cho phép tạo PATIENT
      if (reqRole !== 'PATIENT') {
        return res.status(403).json({ error: 'Chỉ cho phép bệnh nhân tự đăng ký' });
      }
    }

    // Gọi service để đăng ký user mới
    const user = await authService.registerUser({
      email: value.email,
      name: value.name,
      password: value.password,
      role: reqRole,
      creatorId: creator ? creator.sub : null, // ID người tạo (nếu có)
      ip: req.ip, // Địa chỉ IP của request
      userAgent: req.headers['user-agent'], // Thông tin trình duyệt/client
    });

    // Ghi log sự kiện đăng ký
    await log('REGISTER', user._id, `Đã đăng ký user mới với role: ${reqRole}`, req.ip);

    // Trả về response thành công
    res.status(201).json({ 
      message: 'Đăng ký user thành công', 
      userId: user._id 
    });

  } catch (err) {
    // Xử lý lỗi và trả về response
    res.status(400).json({ error: err.message });
  }
}

/**
 * [POST] /api/auth/login
 * Đăng nhập vào hệ thống
 * - Public endpoint
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function login(req, res) {
  try {
    // Kiểm tra và xác thực dữ liệu đăng nhập
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Gọi service xử lý đăng nhập
    const result = await authService.login({
      email: value.email,
      password: value.password,
      twoFACode: value.twoFACode, // Mã xác thực 2 yếu tố (nếu có)
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // THIẾT LẬP REFRESH TOKEN COOKIE (HttpOnly để bảo mật)
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true, // Không thể truy cập bằng JavaScript
      secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS trong production
      sameSite: 'lax', // Chính sách SameSite
      maxAge: getRefreshExpiryMs(), // Thời gian sống của cookie
    });

    // Ghi log sự kiện đăng nhập
    await log('LOGIN', result.user._id, 'User đã đăng nhập thành công', req.ip);

    // Trả về thông tin đăng nhập thành công
    res.json({
      accessToken: result.accessToken,
      user: {
        id: result.user._id,
        email: result.user.email,
        role: result.user.role,
      },
    });

  } catch (err) {
    // Xử lý lỗi đăng nhập
    res.status(400).json({ error: err.message });
  }
}

/**
 * [POST] /api/auth/logout
 * Đăng xuất khỏi hệ thống
 * - Private endpoint (yêu cầu xác thực)
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function logout(req, res) {
  try {
    const user = req.user; // Thông tin user từ middleware xác thực
    const refreshToken = req.cookies?.refreshToken; // Lấy refresh token từ cookie

    // Gọi service xử lý đăng xuất
    await authService.logout(user.sub, refreshToken);
    
    // XÓA REFRESH TOKEN COOKIE
    res.clearCookie('refreshToken');

    // Ghi log sự kiện đăng xuất
    await log('LOGOUT', user.sub, 'User đã đăng xuất', req.ip);

    // Trả về response thành công
    res.json({ message: 'Đăng xuất thành công' });

  } catch (err) {
    // Xử lý lỗi đăng xuất
    res.status(400).json({ error: err.message });
  }
}

/**
 * [POST] /api/auth/refresh
 * Làm mới Access Token bằng Refresh Token
 * - Public endpoint (nhưng yêu cầu có cookie refreshToken hợp lệ)
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function refresh(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    
    // Kiểm tra sự tồn tại của refresh token
    if (!refreshToken) {
      return res.status(401).json({ error: 'Không tìm thấy refresh token' });
    }

    // Gọi service làm mới tokens
    const { accessToken, refreshToken: newRefresh } = await authService.refreshTokens(
      refreshToken,
      req.ip,
      req.headers['user-agent']
    );

    // THAY THẾ REFRESH TOKEN COOKIE MỚI
    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: getRefreshExpiryMs(),
    });

    // Trả về access token mới
    res.json({ accessToken });

  } catch (err) {
    // Xử lý lỗi làm mới token
    res.status(401).json({ error: err.message });
  }
}

/**
 * [GET] /api/auth/2fa/generate
 * Tạo secret key cho xác thực 2 yếu tố (2FA)
 * - Private endpoint (yêu cầu xác thực)
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function generate2FA(req, res) {
  try {
    // Tạo secret key cho 2FA
    const secret = authService.generate2FASecret();
    
    // Trả về thông tin secret (otpauth_url và base32)
    res.json(secret);

  } catch (err) {
    // Xử lý lỗi tạo 2FA
    res.status(400).json({ error: err.message });
  }
}

/**
 * [POST] /api/auth/2fa/enable
 * Kích hoạt xác thực 2 yếu tố cho user
 * - Private endpoint (yêu cầu xác thực)
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function enable2FA(req, res) {
  try {
    const { token, base32 } = req.body; // Mã xác thực và secret key
    const userId = req.user.sub; // ID user từ token

    // XÁC THỰC MÃ 2FA
    const valid = require('speakeasy').totp.verify({
      secret: base32,
      encoding: 'base32',
      token: token,
      window: 1, // Cho phép sai số thời gian (1 khoảng = 30 giây)
    });

    // Kiểm tra tính hợp lệ của mã
    if (!valid) {
      return res.status(400).json({ error: 'Mã xác thực 2FA không hợp lệ' });
    }

    // KÍCH HOẠT 2FA CHO USER
    await authService.enable2FAForUser(userId, base32);
    
    // Ghi log sự kiện kích hoạt 2FA
    await log('2FA_ENABLED', userId, 'Đã kích hoạt xác thực 2 yếu tố', req.ip);

    // Trả về response thành công
    res.json({ message: 'Đã kích hoạt xác thực 2 yếu tố thành công' });

  } catch (err) {
    // Xử lý lỗi kích hoạt 2FA
    res.status(400).json({ error: err.message });
  }
}

// Xuất các hàm controller để sử dụng trong routes
module.exports = {
  register,
  login,
  logout,
  refresh,
  generate2FA,
  enable2FA,
};