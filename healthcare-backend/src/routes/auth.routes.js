// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, requirePermission, requireRole } = require('../middlewares/auth.middleware');
const { PERMISSIONS, ROLES } = require('../constants/roles');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);

// 2FA routes - yêu cầu đăng nhập
router.get('/2fa/generate', authenticate, authController.generate2FA);
router.post('/2fa/enable', authenticate, authController.enable2FA);


// Role-specific registration endpoints
router.post('/register-staff',
  authenticate,
  requirePermission(PERMISSIONS.REGISTER_STAFF),
  (req, res, next) => {
    req.body.role = ROLES.STAFF;
    next();
  },
  authController.register
);

router.post('/register-doctor',
  authenticate,
  requirePermission(PERMISSIONS.REGISTER_DOCTOR),
  (req, res, next) => {
    req.body.role = ROLES.DOCTOR;
    next();
  },
  authController.register
);

module.exports = router;