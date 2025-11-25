/**
 * 📤 Response Handler Utilities
 * Standardized response formatting for all API endpoints
 */

/**
 * Send success response
 */
const successResponse = (res, data, message = "Success", statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send error response
 */
const errorResponse = (
  res,
  message = "Error",
  statusCode = 400,
  data = null
) => {
  res.status(statusCode).json({
    success: false,
    message,
    data,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
