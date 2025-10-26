// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authValidation = require('../validations/auth.validation');
const { 
  validateBody,
  sanitizeInput 
} = require('../middlewares/validation.middleware');
const { markPublic } = require('../middlewares/public.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { loginLimiter } = require('../middlewares/rateLimiter');

/**
 * 🛡️ AUTHENTICATION ROUTES CHO HEALTHCARE SYSTEM
 */

// 🎯 ÁP DỤNG markPublic CHO CÁC ROUTE CỤ THỂ THAY VÌ TẤT CẢ
const publicRoutes = [
  '/login',
  '/register', 
  '/forgot-password',
  '/reset-password',
  '/refresh-token',
  '/health'
];

router.use((req, res, next) => {
  // Kiểm tra nếu route hiện tại nằm trong danh sách public
  if (publicRoutes.some(route => req.path.includes(route))) {
    req.isPublic = true;
  }
  next();
});

// 🎯 ĐĂNG NHẬP (PUBLIC)
router.post(
  '/login',
  loginLimiter,
  sanitizeInput(['email', 'password']),
  validateBody(authValidation.login.body),
  authController.login
);

// 🎯 ĐĂNG KÝ USER (PUBLIC)
router.post(
  '/register',
  sanitizeInput(['email', 'password', 'confirmPassword', 'personalInfo', 'role']),
  validateBody(authValidation.registerUser.body),
  authController.registerUser
);

// 🎯 QUÊN MẬT KHẨU (PUBLIC)
router.post(
  '/forgot-password',
  sanitizeInput(['email']),
  validateBody(authValidation.forgotPassword.body),
  authController.forgotPassword
);

// 🎯 ĐẶT LẠI MẬT KHẨU (PUBLIC)
router.post(
  '/reset-password',
  sanitizeInput(['token', 'newPassword', 'confirmPassword']),
  validateBody(authValidation.resetPassword.body),
  authController.resetPassword
);

// 🎯 REFRESH TOKEN (PUBLIC)
router.post(
  '/refresh-token',
  sanitizeInput(['refreshToken']),
  validateBody(authValidation.refreshToken.body),
  authController.refreshToken
);

// 🎯 HEALTH CHECK (PUBLIC)
router.get('/health', authController.healthCheck);

// 🎯 PROTECTED ROUTES (YÊU CẦU AUTHENTICATION)

// 🎯 ĐĂNG XUẤT
router.post(
  '/logout',
  authenticate,
  sanitizeInput(['refreshToken']),
  validateBody(authValidation.refreshToken.body),
  authController.logout
);

// 🎯 ĐỔI MẬT KHẨU
router.post(
  '/change-password',
  authenticate,
  sanitizeInput(['currentPassword', 'newPassword', 'confirmPassword']),
  validateBody(authValidation.changePassword.body),
  authController.changePassword
);

// 🎯 LẤY THÔNG TIN USER HIỆN TẠI
router.get(
  '/me',
  authenticate,
  authController.getCurrentUser
);

module.exports = router;