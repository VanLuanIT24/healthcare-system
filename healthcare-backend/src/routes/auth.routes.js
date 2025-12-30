// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authValidation = require('../validations/auth.validation');
const { validateBody, validateParams, sanitizeInput } = require('../middlewares/validation.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { loginLimiter } = require('../middlewares/rateLimiter');
const { uploadMiddleware } = require('../middlewares/upload.middleware');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

// Public routes (không cần auth)
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/refresh-token', '/verify-email', '/resend-verification', '/health'];

// Mark public routes
router.use((req, res, next) => {
  if (publicRoutes.some(route => req.path.startsWith(route))) {
    req.isPublic = true;
  }
  next();
});

// PUBLIC ROUTES
router.post('/login', loginLimiter, sanitizeInput(['email', 'password']), validateBody(authValidation.login.body), authController.login);

router.post('/register', sanitizeInput(['email', 'password', 'confirmPassword', 'personalInfo', 'role']), validateBody(authValidation.registerUser.body), authController.registerUser);

router.post('/forgot-password', sanitizeInput(['email']), validateBody(authValidation.forgotPassword.body), authController.forgotPassword);

router.post('/reset-password', sanitizeInput(['token', 'newPassword', 'confirmPassword']), validateBody(authValidation.resetPassword.body), authController.resetPassword);

router.post('/refresh-token', sanitizeInput(['refreshToken']), validateBody(authValidation.refreshToken.body), authController.refreshToken);

// verify-email: token nằm trong params, không phải body
router.post('/verify-email/:token', authController.verifyEmail);

router.post('/resend-verification', sanitizeInput(['email']), validateBody(authValidation.resendVerification.body), authController.resendVerification);

router.get('/health', authController.healthCheck);

// PROTECTED ROUTES
router.post('/logout', authenticate, sanitizeInput(['refreshToken', 'sessionId']), validateBody(authValidation.logout.body), authController.logout);

router.post('/change-password', authenticate, sanitizeInput(['currentPassword', 'newPassword', 'confirmPassword']), validateBody(authValidation.changePassword.body), authController.changePassword);

router.get('/profile', authenticate, authController.getProfile);

router.put('/profile', authenticate, sanitizeInput(['personalInfo']), authController.updateProfile);

router.post('/avatar', 
  authenticate, 
  uploadMiddleware.single('avatar'),
  auditLog(AUDIT_ACTIONS.USER_UPDATE),
  authController.uploadAvatar
);

router.get('/me', authenticate, authController.getCurrentUser);

router.get('/sessions', authenticate, authController.getUserSessions);

router.post('/sessions/revoke', authenticate, sanitizeInput(['sessionId']), validateBody(authValidation.revokeSession.body), authController.revokeSession);

router.post('/sessions/logout-all', authenticate, authController.logoutAllSessions);

router.post('/sessions/logout-all-other', authenticate, authController.logoutAllOtherSessions);

module.exports = router;