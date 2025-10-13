// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { markPublic } = require('../middlewares/public.middleware');
const { loginLimiter } = require('../middlewares/rateLimiter');

/**
 * ============================================
 * 🎯 ĐỊNH TUYẾN XÁC THỰC (AUTHENTICATION ROUTES)
 * ============================================
 */

/**
 * 🔓 PUBLIC ROUTES - KHÔNG YÊU CẦU XÁC THỰC
 * Các endpoint mở cho tất cả người dùng
 */

// 🟢 ĐĂNG KÝ TÀI KHOẢN
// Cho phép bệnh nhân tự đăng ký hoặc admin tạo user
router.post('/register', 
  markPublic, // Đánh dấu public - không cần JWT
  authCtrl.register
);

// 🟢 ĐĂNG NHẬP HỆ THỐNG
router.post('/login', 
  markPublic, // Public endpoint
  loginLimiter, // Giới hạn số lần đăng nhập
  authCtrl.login
);

// 🟢 LÀM MỚI ACCESS TOKEN
router.post('/refresh', 
  markPublic, // Public nhưng yêu cầu refresh token trong cookie
  authCtrl.refresh
);

/**
 * 🔐 PRIVATE ROUTES - YÊU CẦU XÁC THỰC JWT
 * Chỉ truy cập được khi đã đăng nhập
 */

// 🔵 ĐĂNG XUẤT KHỎI HỆ THỐNG
router.post('/logout', 
  authenticate, // Yêu cầu access token hợp lệ
  authCtrl.logout
);

// 🔵 SINH MÃ SECRET CHO 2FA
router.get('/2fa/generate', 
  authenticate, 
  authCtrl.generate2FA
);

// 🔵 KÍCH HOẠT XÁC THỰC 2 YẾU TỐ
router.post('/2fa/enable', 
  authenticate, 
  authCtrl.enable2FA
);

module.exports = router;