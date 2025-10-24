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
 * - Định nghĩa routes và middleware cho authentication
 * - Áp dụng rate limiting và validation phù hợp
 */

// 🎯 PUBLIC ROUTES (KHÔNG YÊU CẦU AUTHENTICATION)
router.use(markPublic);

// 🎯 ĐĂNG NHẬP
router.post(
  '/login',
  loginLimiter, // Rate limiting cho đăng nhập
  sanitizeInput(['email', 'password']),
  validateBody(authValidation.login.body),
  authController.login
);

// 🎯 ĐĂNG KÝ USER
router.post(
  '/register',
  sanitizeInput(['email', 'password', 'confirmPassword', 'personalInfo', 'role']),
  validateBody(authValidation.registerUser.body),
  authController.registerUser
);

// 🎯 QUÊN MẬT KHẨU
router.post(
  '/forgot-password',
  sanitizeInput(['email']),
  validateBody(authValidation.forgotPassword.body),
  authController.forgotPassword
);

// 🎯 ĐẶT LẠI MẬT KHẨU
router.post(
  '/reset-password',
  sanitizeInput(['token', 'newPassword', 'confirmPassword']),
  validateBody(authValidation.resetPassword.body),
  authController.resetPassword
);

// 🎯 REFRESH TOKEN
router.post(
  '/refresh-token',
  sanitizeInput(['refreshToken']),
  validateBody(authValidation.refreshToken.body),
  authController.refreshToken
);

// 🎯 HEALTH CHECK
router.get('/health', authController.healthCheck);

// 🎯 PROTECTED ROUTES (YÊU CẦU AUTHENTICATION)
router.use(authenticate);

// 🎯 ĐĂNG XUẤT
router.post(
  '/logout',
  sanitizeInput(['refreshToken']),
  validateBody(authValidation.refreshToken.body), // Sử dụng cùng schema với refresh token
  authController.logout
);

// 🎯 ĐỔI MẬT KHẨU
router.post(
  '/change-password',
  sanitizeInput(['currentPassword', 'newPassword', 'confirmPassword']),
  validateBody(authValidation.changePassword.body),
  authController.changePassword
);

// 🎯 LẤY THÔNG TIN USER HIỆN TẠI
router.get('/me', authController.getCurrentUser);

module.exports = router;