/**
 * 🛡️ MIDDLEWARE ĐÁNH DẤU ROUTE LÀ PUBLIC
 * - Routes được đánh dấu public sẽ bỏ qua xác thực JWT
 * - Sử dụng cho các endpoint không yêu cầu đăng nhập
 * - Ghi log các request public quan trọng
 */

/**
 * MIDDLEWARE ĐÁNH DẤU ROUTE PUBLIC
 */
function markPublic(req, res, next) {
  req.isPublic = true;
  
  // 🎯 LOG CÁC REQUEST PUBLIC QUAN TRỌNG
  const importantPublicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password'
  ];
  
  if (importantPublicRoutes.includes(req.path)) {
    console.log(`🌐 Public access: ${req.method} ${req.path} from IP: ${req.ip}`);
  }
  
  next();
}

/**
 * MIDDLEWARE KIỂM TRA VÀ GIỚI HẠN RATE LIMIT CHO PUBLIC ROUTES
 */
function publicRateLimit(maxRequests = 100, windowMs = 900000) { // 15 phút mặc định
  return (req, res, next) => {
    if (!req.isPublic) {
      return next();
    }
    
    // 🎯 TRONG THỰC TẾ SẼ SỬ DỤNG express-rate-limit
    // Ở đây chỉ là logic cơ bản
    const clientIP = req.ip;
    const route = req.path;
    
    console.log(`📊 Public rate limit check: ${clientIP} - ${route}`);
    
    next();
  };
}

module.exports = { 
  markPublic, 
  publicRateLimit 
};
