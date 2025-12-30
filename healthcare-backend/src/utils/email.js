// src/utils/email.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Kiểm tra kết nối khi khởi tạo (không log nếu lỗi ở production)
    this.transporter.verify().catch(() => {});
  }

  async sendMail(options) {
    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Hệ Thống Y Tế'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
        ...options,
      };
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('❌ Lỗi gửi email:', error.message);
      throw new Error('Không thể gửi email');
    }
  }

  // Email chào mừng
  async sendWelcomeEmail(user) {
    const html = this.getWelcomeTemplate(user);
    await this.sendMail({
      to: user.email,
      subject: 'Chào mừng bạn đến với Hệ Thống Y Tế',
      html,
    });
  }

  // Email đặt lại mật khẩu
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL || 'https://your-app.com'}/reset-password?token=${resetToken}`;
    const html = this.getResetPasswordTemplate(user, resetUrl);
    await this.sendMail({
      to: user.email,
      subject: '🔐 Đặt lại mật khẩu tài khoản',
      html,
    });
  }

  // Email xác nhận đổi mật khẩu
  async sendPasswordChangedConfirmation(user) {
    const html = this.getPasswordChangedTemplate(user);
    await this.sendMail({
      to: user.email,
      subject: '✅ Mật khẩu của bạn đã được thay đổi',
      html,
    });
  }

  // Template: Chào mừng (đẹp, hiện đại, responsive)
  getWelcomeTemplate(user) {
    const fullName = `${user.personalInfo?.firstName || ''} ${user.personalInfo?.lastName || ''}`.trim() || 'Quý khách';

    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chào mừng đến Hệ Thống Y Tế</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .header p { margin: 12px 0 0; opacity: 0.9; font-size: 16px; }
          .content { padding: 40px 30px; color: #1e293b; }
          .greeting { font-size: 18px; margin-bottom: 24px; }
          .highlight-box { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 24px 0; }
          .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 32px 0; }
          .feature { text-align: center; padding: 16px; background: #f8fafc; border-radius: 12px; }
          .feature strong { display: block; margin-bottom: 8px; color: #1e40af; font-size: 16px; }
          .contact { background: #ecfdf5; padding: 20px; border-radius: 12px; margin: 32px 0; text-align: center; }
          .footer { text-align: center; padding: 30px; background: #f1f5f9; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Hệ Thống Y Tế</h1>
            <p>Chăm sóc sức khỏe toàn diện - Mọi lúc, mọi nơi</p>
          </div>
          <div class="content">
            <p class="greeting">Xin chào <strong>${fullName}</strong>,</p>
            <p>Chúc mừng bạn đã đăng ký thành công tài khoản trên hệ thống quản lý y tế của chúng tôi.</p>

            <div class="highlight-box">
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Vai trò:</strong> ${this.getRoleDisplayName(user.role)}</p>
              <p><strong>Ngày đăng ký:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
            </div>

            <p><strong>Bạn có thể sử dụng tài khoản để:</strong></p>
            <div class="features">
              <div class="feature"><strong>📅 Đặt lịch khám</strong>Nhanh chóng & tiện lợi</div>
              <div class="feature"><strong>📊 Xem hồ sơ</strong>Lịch sử khám & kết quả</div>
              <div class="feature"><strong>💬 Tư vấn trực tuyến</strong>Với bác sĩ chuyên khoa</div>
              <div class="feature"><strong>🔔 Nhắc lịch</strong>Không bỏ lỡ cuộc hẹn</div>
            </div>

            <div class="contact">
              <p><strong>📞 Hotline:</strong> ${process.env.SUPPORT_PHONE || '1900 1234'}</p>
              <p><strong>✉️ Email hỗ trợ:</strong> ${process.env.SUPPORT_EMAIL || 'support@hospital.com'}</p>
            </div>

            <p>Trân trọng,<br><strong>Đội ngũ Hệ Thống Y Tế</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${process.env.HOSPITAL_NAME || 'Hệ Thống Y Tế'}. All rights reserved.</p>
            <p>Email tự động - Vui lòng không trả lời</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Template: Đặt lại mật khẩu (nghiêm túc, rõ ràng)
  getResetPasswordTemplate(user, resetUrl) {
    const fullName = `${user.personalInfo?.firstName || ''} ${user.personalInfo?.lastName || ''}`.trim() || 'Quý khách';

    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đặt lại mật khẩu</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: #dc2626; color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 30px; color: #1e293b; }
          .alert { background: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin: 24px 0; }
          .button {
            display: block; width: fit-content; margin: 32px auto;
            background: #dc2626; color: white; padding: 16px 40px;
            text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 18px;
          }
          .warning { background: #fffbeb; border: 1px solid #fcd34d; padding: 20px; border-radius: 12px; margin: 32px 0; }
          .footer { text-align: center; padding: 30px; background: #f1f5f9; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Đặt lại mật khẩu</h1>
          </div>
          <div class="content">
            <p>Xin chào <strong>${fullName}</strong>,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>

            <div class="alert">
              <p><strong>Thời gian yêu cầu:</strong> ${new Date().toLocaleString('vi-VN')}</p>
            </div>

            <p>Nhấn nút bên dưới để đặt lại mật khẩu:</p>
            <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>

            <p>Liên kết sẽ hết hạn sau <strong>1 giờ</strong>.</p>

            <div class="warning">
              <p><strong>⚠️ Nếu bạn KHÔNG yêu cầu đặt lại mật khẩu:</strong></p>
              <ul>
                <li>Bỏ qua email này</li>
                <li>Không chia sẻ liên kết với bất kỳ ai</li>
                <li>Liên hệ hỗ trợ ngay: ${process.env.SUPPORT_PHONE || '1900 1234'}</li>
              </ul>
            </div>

            <p>Trân trọng,<br><strong>Đội ngũ bảo mật</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Hệ Thống Y Tế</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Template: Xác nhận đổi mật khẩu thành công
  getPasswordChangedTemplate(user) {
    const fullName = `${user.personalInfo?.firstName || ''} ${user.personalInfo?.lastName || ''}`.trim() || 'Quý khách';

    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mật khẩu đã thay đổi</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: #16a34a; color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 30px; color: #1e293b; }
          .success { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; border-radius: 8px; margin: 24px 0; }
          .tip { background: #fefce8; padding: 20px; border-radius: 12px; margin: 32px 0; }
          .footer { text-align: center; padding: 30px; background: #f1f5f9; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Mật khẩu đã thay đổi</h1>
          </div>
          <div class="content">
            <p>Xin chào <strong>${fullName}</strong>,</p>
            <p>Mật khẩu tài khoản của bạn đã được thay đổi thành công.</p>

            <div class="success">
              <p><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
              <p><strong>Tài khoản:</strong> ${user.email}</p>
            </div>

            <div class="tip">
              <p><strong>Mẹo bảo mật:</strong></p>
              <ul>
                <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
                <li>Sử dụng mật khẩu riêng cho từng tài khoản</li>
                <li>Thay đổi mật khẩu định kỳ</li>
              </ul>
            </div>

            <p>Nếu bạn <strong>không thực hiện thay đổi này</strong>, vui lòng liên hệ ngay:</p>
            <p><strong>Hotline:</strong> ${process.env.SUPPORT_PHONE || '1900 1234'}</p>

            <p>Trân trọng,<br><strong>Đội ngũ bảo mật</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Hệ Thống Y Tế</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getRoleDisplayName(role) {
    const map = {
      PATIENT: 'Bệnh nhân',
      DOCTOR: 'Bác sĩ',
      NURSE: 'Y tá',
      RECEPTIONIST: 'Lễ tân',
      PHARMACIST: 'Dược sĩ',
      LAB_TECHNICIAN: 'Kỹ thuật viên xét nghiệm',
      BILLING_STAFF: 'Nhân viên thu ngân',
    };
    return map[role] || 'Người dùng';
  }
}

module.exports = new EmailService();