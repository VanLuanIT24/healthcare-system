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

// ===== PUBLIC ROUTES =====

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập vào hệ thống
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Email hoặc mật khẩu không đúng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Quá nhiều lần đăng nhập thất bại
 */
router.post('/login', loginLimiter, sanitizeInput(['email', 'password']), validateBody(authValidation.login.body), authController.login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản bệnh nhân mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: Email đã tồn tại
 */
router.post('/register', sanitizeInput(['email', 'password', 'confirmPassword', 'personalInfo', 'role']), validateBody(authValidation.registerUser.body), authController.registerUser);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Yêu cầu đặt lại mật khẩu
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Email đặt lại mật khẩu đã được gửi
 *       404:
 *         description: Email không tồn tại trong hệ thống
 */
router.post('/forgot-password', sanitizeInput(['email']), validateBody(authValidation.forgotPassword.body), authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu với token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công
 *       400:
 *         description: Token không hợp lệ hoặc đã hết hạn
 */
router.post('/reset-password', sanitizeInput(['token', 'newPassword', 'confirmPassword']), validateBody(authValidation.resetPassword.body), authController.resetPassword);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Làm mới access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token mới
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: Refresh token không hợp lệ
 */
router.post('/refresh-token', sanitizeInput(['refreshToken']), validateBody(authValidation.refreshToken.body), authController.refreshToken);

/**
 * @swagger
 * /api/auth/verify-email/{token}:
 *   post:
 *     summary: Xác thực email
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token xác thực email
 *     responses:
 *       200:
 *         description: Email đã được xác thực
 *       400:
 *         description: Token không hợp lệ
 */
router.post('/verify-email/:token', authController.verifyEmail);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Gửi lại email xác thực
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email xác thực đã được gửi lại
 */
router.post('/resend-verification', sanitizeInput(['email']), validateBody(authValidation.resendVerification.body), authController.resendVerification);

/**
 * @swagger
 * /api/auth/health:
 *   get:
 *     summary: Kiểm tra trạng thái Auth service
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Auth service đang hoạt động
 */
router.get('/health', authController.healthCheck);

// ===== PROTECTED ROUTES =====

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất khỏi hệ thống
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout', authenticate, sanitizeInput(['refreshToken', 'sessionId']), validateBody(authValidation.logout.body), authController.logout);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Đổi mật khẩu
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       400:
 *         description: Mật khẩu hiện tại không đúng
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/change-password', authenticate, sanitizeInput(['currentPassword', 'newPassword', 'confirmPassword']), validateBody(authValidation.changePassword.body), authController.changePassword);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Lấy thông tin profile người dùng
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   put:
 *     summary: Cập nhật thông tin profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personalInfo:
 *                 type: object
 *                 properties:
 *                   fullName:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   address:
 *                     type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/profile', authenticate, authController.getProfile);

router.put('/profile', authenticate, sanitizeInput(['personalInfo']), authController.updateProfile);

/**
 * @swagger
 * /api/auth/avatar:
 *   post:
 *     summary: Upload avatar
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload thành công
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/avatar', 
  authenticate, 
  uploadMiddleware.single('avatar'),
  auditLog(AUDIT_ACTIONS.USER_UPDATE),
  authController.uploadAvatar
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin user hiện tại
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @swagger
 * /api/auth/sessions:
 *   get:
 *     summary: Lấy danh sách sessions đang hoạt động
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách sessions
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/sessions', authenticate, authController.getUserSessions);

/**
 * @swagger
 * /api/auth/sessions/revoke:
 *   post:
 *     summary: Thu hồi một session cụ thể
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thu hồi thành công
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/sessions/revoke', authenticate, sanitizeInput(['sessionId']), validateBody(authValidation.revokeSession.body), authController.revokeSession);

/**
 * @swagger
 * /api/auth/sessions/logout-all:
 *   post:
 *     summary: Đăng xuất tất cả sessions
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất tất cả thành công
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/sessions/logout-all', authenticate, authController.logoutAllSessions);

/**
 * @swagger
 * /api/auth/sessions/logout-all-other:
 *   post:
 *     summary: Đăng xuất tất cả sessions khác (trừ session hiện tại)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất tất cả sessions khác thành công
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/sessions/logout-all-other', authenticate, authController.logoutAllOtherSessions);

module.exports = router;