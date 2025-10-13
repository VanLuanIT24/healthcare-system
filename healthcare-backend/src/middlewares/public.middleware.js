// src/middlewares/public.middleware.js
/**
 * MIDDLEWARE ĐÁNH DẤU ROUTE LÀ PUBLIC
 * - Routes được đánh dấu public sẽ bỏ qua xác thực JWT
 * - Sử dụng cho các endpoint không yêu cầu đăng nhập
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
function markPublic(req, res, next) {
  req.isPublic = true; // Đánh dấu route là public
  next();
}

module.exports = { markPublic };