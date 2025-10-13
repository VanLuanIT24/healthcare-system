// src/utils/email.js
const nodemailer = require('nodemailer');
const { appConfig } = require('../config');

/**
 * DỊCH VỤ GỬI EMAIL
 * - Sử dụng nodemailer để gửi email qua SMTP
 * - Hỗ trợ cả SSL và TLS
 */

// 🎯 KHỞI TẠO TRANSPORTER CHO NODEMAILER
const transporter = nodemailer.createTransport({
  host: appConfig.email.smtpHost,
  port: appConfig.email.smtpPort,
  secure: appConfig.email.smtpPort === 465, // SSL nếu port 465
  auth: {
    user: appConfig.email.smtpUser,
    pass: appConfig.email.smtpPass,
  },
  // 🔧 CẤU HÌNH THÊM ĐỂ TĂNG ĐỘ TIN CẬY
  pool: true, // Sử dụng connection pooling
  maxConnections: 5, // Số kết nối tối đa
  maxMessages: 100, // Số message tối đa mỗi kết nối
});

/**
 * KIỂM TRA KẾT NỐI EMAIL SERVER
 * - Xác minh cấu hình SMTP trước khi sử dụng
 */
async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Kết nối SMTP server thành công');
    return true;
  } catch (error) {
    console.error('❌ Lỗi kết nối SMTP server:', error.message);
    return false;
  }
}

/**
 * GỬI EMAIL ĐẾN NGƯỜI DÙNG
 * 
 * @param {Object} options - Thông tin email
 * @param {string|string[]} options.to - Địa chỉ người nhận (có thể là string hoặc array)
 * @param {string} options.subject - Tiêu đề email
 * @param {string} options.html - Nội dung email dạng HTML
 * @param {string} options.text - Nội dung email dạng text (tùy chọn)
 * @param {Object} options.attachments - File đính kèm (tùy chọn)
 * @returns {Promise<Object>} Thông tin gửi email
 * 
 * @example
 * await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Chào mừng đến với hệ thống',
 *   html: '<h1>Xin chào!</h1><p>Cảm ơn bạn đã đăng ký.</p>'
 * });
 */
async function sendEmail({ to, subject, html, text, attachments }) {
  try {
    // 🎯 THIẾT LẬP THÔNG TIN EMAIL
    const mailOptions = {
      from: `"${appConfig.superAdmin.name}" <${appConfig.email.from}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: subject,
      html: html,
      ...(text && { text: text }), // Chỉ thêm text nếu được cung cấp
      ...(attachments && { attachments: attachments }),
    };

    // 🚀 GỬI EMAIL
    const info = await transporter.sendMail(mailOptions);

    // 📊 LOG THÔNG TIN GỬI EMAIL THÀNH CÔNG
    console.log(`📧 Email đã gửi thành công:`, {
      messageId: info.messageId,
      to: to,
      subject: subject,
      response: info.response
    });

    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };

  } catch (error) {
    // 🔴 XỬ LÝ LỖI GỬI EMAIL
    console.error('❌ Gửi email thất bại:', {
      to: to,
      subject: subject,
      error: error.message
    });

    throw new Error(`Không thể gửi email: ${error.message}`);
  }
}

/**
 * GỬI EMAIL CHÀO MỪNG KHI ĐĂNG KÝ THÀNH CÔNG
 * 
 * @param {string} to - Email người nhận
 * @param {string} userName - Tên người dùng
 * @param {string} role - Vai trò người dùng
 * @returns {Promise<Object>} Kết quả gửi email
 */
async function sendWelcomeEmail(to, userName, role) {
  const subject = 'Chào mừng đến với hệ thống MediAuth';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Chào mừng ${userName}!</h2>
      <p>Cảm ơn bạn đã đăng ký tài khoản với vai trò <strong>${role}</strong> trong hệ thống MediAuth.</p>
      <p>Tài khoản của bạn đã được tạo thành công và sẵn sàng để sử dụng.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Thông tin tài khoản:</strong></p>
        <ul>
          <li>Email: ${to}</li>
          <li>Vai trò: ${role}</li>
          <li>Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}</li>
        </ul>
      </div>
      <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với quản trị viên hệ thống.</p>
      <br>
      <p>Trân trọng,<br>Đội ngũ MediAuth</p>
    </div>
  `;

  return await sendEmail({ to, subject, html });
}

/**
 * GỬI EMAIL ĐẶT LẠI MẬT KHẨU
 * 
 * @param {string} to - Email người nhận
 * @param {string} resetToken - Token đặt lại mật khẩu
 * @param {string} userName - Tên người dùng
 * @returns {Promise<Object>} Kết quả gửi email
 */
async function sendPasswordResetEmail(to, resetToken, userName) {
  const subject = 'Yêu cầu đặt lại mật khẩu';
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Đặt lại mật khẩu</h2>
      <p>Xin chào ${userName},</p>
      <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
      <p>Vui lòng nhấp vào liên kết bên dưới để đặt lại mật khẩu:</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${resetLink}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Đặt lại mật khẩu
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        Liên kết này sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, 
        vui lòng bỏ qua email này.
      </p>
      <br>
      <p>Trân trọng,<br>Đội ngũ MediAuth</p>
    </div>
  `;

  return await sendEmail({ to, subject, html });
}

module.exports = {
  sendEmail,
  verifyEmailConnection,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};