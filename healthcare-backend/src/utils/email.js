const nodemailer = require('nodemailer');

/**
 * 🎯 EMAIL SERVICE CHO HEALTHCARE SYSTEM
 * - Gửi email xác nhận, reset password, thông báo
 * - Template email chuyên nghiệp cho healthcare
 */

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * 🎯 GỬI EMAIL CHÀO MỪNG
   */
  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: `"Hệ Thống Y Tế" <${process.env.SMTP_FROM}>`,
        to: user.email,
        subject: 'Chào mừng đến với Hệ Thống Y Tế',
        html: this.getWelcomeTemplate(user)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Welcome email sent to: ${user.email}`);
    } catch (error) {
      console.error('❌ Send welcome email error:', error.message);
    }
  }

  /**
   * 🎯 GỬI EMAIL ĐẶT LẠI MẬT KHẨU
   */
  async sendPasswordResetEmail(user, resetToken) {
    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: `"Hệ Thống Y Tế" <${process.env.SMTP_FROM}>`,
        to: user.email,
        subject: 'Đặt Lại Mật Khẩu - Hệ Thống Y Tế',
        html: this.getPasswordResetTemplate(user, resetUrl)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Password reset email sent to: ${user.email}`);
    } catch (error) {
      console.error('❌ Send password reset email error:', error.message);
    }
  }

  /**
   * 🎯 GỬI EMAIL XÁC NHẬN ĐỔI MẬT KHẨU
   */
  async sendPasswordChangedConfirmation(user) {
    try {
      const mailOptions = {
        from: `"Hệ Thống Y Tế" <${process.env.SMTP_FROM}>`,
        to: user.email,
        subject: 'Mật Khẩu Đã Được Thay Đổi - Hệ Thống Y Tế',
        html: this.getPasswordChangedTemplate(user)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Password changed confirmation sent to: ${user.email}`);
    } catch (error) {
      console.error('❌ Send password changed confirmation error:', error.message);
    }
  }

  /**
   * 🎯 TEMPLATE EMAIL CHÀO MỪNG
   */
  getWelcomeTemplate(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Chào Mừng Đến Với Hệ Thống Y Tế</h1>
          </div>
          <div class="content">
            <p>Xin chào <strong>${user.personalInfo.firstName} ${user.personalInfo.lastName}</strong>,</p>
            <p>Tài khoản của bạn đã được tạo thành công trong hệ thống quản lý y tế.</p>
            <p>Vai trò: <strong>${this.getRoleDisplayName(user.role)}</strong></p>
            <p>Bạn có thể đăng nhập vào hệ thống để sử dụng các dịch vụ y tế.</p>
          </div>
          <div class="footer">
            <p>© 2024 Hệ Thống Y Tế. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 🎯 TEMPLATE EMAIL RESET PASSWORD
   */
  getPasswordResetTemplate(user, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Đặt Lại Mật Khẩu</h1>
          </div>
          <div class="content">
            <p>Xin chào <strong>${user.personalInfo.firstName} ${user.personalInfo.lastName}</strong>,</p>
            <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p>Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Đặt Lại Mật Khẩu</a>
            </p>
            <p>Liên kết này sẽ hết hạn trong 1 giờ.</p>
            <p><em>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</em></p>
          </div>
          <div class="footer">
            <p>© 2024 Hệ Thống Y Tế. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 🎯 HIỂN THỊ TÊN VAI TRÒ
   */
  getRoleDisplayName(role) {
    const roleNames = {
      'PATIENT': 'Bệnh nhân',
      'DOCTOR': 'Bác sĩ',
      'NURSE': 'Y tá',
      'RECEPTIONIST': 'Lễ tân',
      'PHARMACIST': 'Dược sĩ',
      'LAB_TECHNICIAN': 'Kỹ thuật viên xét nghiệm',
      'BILLING_STAFF': 'Nhân viên kế toán'
    };
    
    return roleNames[role] || role;
  }
}

module.exports = new EmailService();