const nodemailer = require('nodemailer');

/**
 * 🎯 EMAIL SERVICE CHO HEALTHCARE SYSTEM - TÍCH HỢP GMAIL SMTP
 * - Gửi email trực tiếp đến Gmail
 * - Template email chuyên nghiệp cho healthcare
 */

class EmailService {
  constructor() {
    // 🛠️ SỬA LỖI: createTransport thay vì createTransporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // Sử dụng STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // 🔧 TỐI ƯU CHO GMAIL
      connectionTimeout: 30000,
      socketTimeout: 30000,
      greetingTimeout: 30000,
      // 🛡️ BẢO MẬT CHO GMAIL
      tls: {
        rejectUnauthorized: false // Cho phép self-signed certificates trong development
      }
    });

    // 🧪 KIỂM TRA KẾT NỐI SMTP KHI KHỞI TẠO
    this.verifyConnection();
  }

  /**
   * 🧪 XÁC THỰC KẾT NỐI SMTP
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Gmail SMTP Connection verified successfully');
      console.log('📧 Ready to send emails to real Gmail accounts');
    } catch (error) {
      console.error('❌ Gmail SMTP Connection failed:', error.message);
      console.log('💡 Hướng dẫn khắc phục:');
      console.log('1. Đảm bảo SMTP_USER và SMTP_PASS đúng trong .env');
      console.log('2. Sử dụng App Password thay vì mật khẩu Gmail');
      console.log('3. Bật 2FA và tạo App Password: https://myaccount.google.com/apppasswords');
      console.log('4. Kiểm tra kết nối internet và firewall');
    }
  }

  /**
   * 🎯 GỬI EMAIL CHÀO MỪNG
   */
  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: user.email,
        subject: 'Chào mừng đến với Hệ Thống Y Tế - Healthcare System',
        html: this.getWelcomeTemplate(user),
        // 📧 THÊM HEADERS CHO EMAIL PROFESSIONAL
        headers: {
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'Importance': 'Normal',
          'X-Application': 'Healthcare System'
        }
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to REAL Gmail: ${user.email}`, result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Send welcome email error:', error.message);
      throw new Error(`Không thể gửi email chào mừng: ${error.message}`);
    }
  }

  /**
   * 🎯 GỬI EMAIL ĐẶT LẠI MẬT KHẨU
   */
  async sendPasswordResetEmail(user, resetToken) {
    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: user.email,
        subject: '🔐 Đặt Lại Mật Khẩu - Hệ Thống Y Tế',
        html: this.getPasswordResetTemplate(user, resetUrl),
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'High',
          'X-Application': 'Healthcare System'
        }
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to REAL Gmail: ${user.email}`, result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Send password reset email error:', error.message);
      throw new Error(`Không thể gửi email đặt lại mật khẩu: ${error.message}`);
    }
  }

  /**
   * 🎯 GỬI EMAIL XÁC NHẬN ĐỔI MẬT KHẨU
   */
  async sendPasswordChangedConfirmation(user) {
    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: user.email,
        subject: '✅ Mật Khẩu Đã Được Thay Đổi - Hệ Thống Y Tế',
        html: this.getPasswordChangedTemplate(user),
        headers: {
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'Importance': 'Normal',
          'X-Application': 'Healthcare System'
        }
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password changed confirmation sent to REAL Gmail: ${user.email}`, result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Send password changed confirmation error:', error.message);
      throw new Error(`Không thể gửi email xác nhận thay đổi mật khẩu: ${error.message}`);
    }
  }

  /**
   * 🎯 TEMPLATE EMAIL CHÀO MỪNG
   */
  getWelcomeTemplate(user) {
    const fullName = `${user.personalInfo?.firstName || ''} ${user.personalInfo?.lastName || ''}`.trim();
    
    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chào Mừng Đến Với Hệ Thống Y Tế</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f6f9fc;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: white; 
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content { 
            padding: 30px;
            background: white;
          }
          .welcome-text {
            font-size: 16px;
            margin-bottom: 20px;
          }
          .user-info {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
            margin: 20px 0;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #64748b;
            font-size: 14px;
            background: #f1f5f9;
            border-top: 1px solid #e2e8f0;
          }
          .button {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 10px 0;
          }
          .contact-info {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          .features {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
          }
          .feature-item {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Chào Mừng Đến Với Hệ Thống Y Tế</h1>
            <p>Nền tảng quản lý chăm sóc sức khỏe toàn diện</p>
          </div>
          <div class="content">
            <p class="welcome-text">Xin chào <strong>${fullName || 'Thành viên'}</strong>,</p>
            
            <p>Chúc mừng bạn đã đăng ký thành công tài khoản trong hệ thống quản lý y tế của chúng tôi.</p>
            
            <div class="user-info">
              <p><strong>📧 Email:</strong> ${user.email}</p>
              <p><strong>👤 Vai trò:</strong> ${this.getRoleDisplayName(user.role)}</p>
              <p><strong>📅 Ngày đăng ký:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
            </div>

            <p><strong>Với tài khoản này, bạn có thể:</strong></p>
            <div class="features">
              <div class="feature-item">
                <strong>📅 Đặt lịch hẹn</strong>
                <p>Khám bệnh trực tuyến</p>
              </div>
              <div class="feature-item">
                <strong>📊 Xem kết quả</strong>
                <p>Lịch sử khám và xét nghiệm</p>
              </div>
              <div class="feature-item">
                <strong>👤 Quản lý</strong>
                <p>Hồ sơ sức khỏe cá nhân</p>
              </div>
              <div class="feature-item">
                <strong>🔔 Thông báo</strong>
                <p>Nhắc lịch khám và cập nhật</p>
              </div>
            </div>

            <div class="contact-info">
              <p><strong>📞 Hotline hỗ trợ:</strong> ${process.env.SUPPORT_PHONE}</p>
              <p><strong>✉️ Email hỗ trợ:</strong> ${process.env.SUPPORT_EMAIL}</p>
              <p><strong>🕒 Thời gian làm việc:</strong> Thứ 2 - Thứ 6: 8:00 - 17:00</p>
            </div>

            <p>Trân trọng,<br><strong>Đội ngũ Hệ Thống Y Tế</strong><br>${process.env.HOSPITAL_NAME}</p>
          </div>
          <div class="footer">
            <p>© 2024 ${process.env.HOSPITAL_NAME}. All rights reserved.</p>
            <p>Đây là email tự động, vui lòng không trả lời.</p>
            <p><small>Để đảm bảo nhận được email, hãy thêm ${process.env.EMAIL_FROM} vào danh bạ của bạn.</small></p>
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
    const fullName = `${user.personalInfo?.firstName || ''} ${user.personalInfo?.lastName || ''}`.trim();
    
    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đặt Lại Mật Khẩu - Hệ Thống Y Tế</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f6f9fc;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: white; 
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content { 
            padding: 30px;
            background: white;
          }
          .reset-info {
            background: #fef2f2;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #dc2626;
            margin: 20px 0;
          }
          .button { 
            display: inline-block;
            background: #dc2626;
            color: white;
            padding: 14px 35px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
            transition: background-color 0.3s;
          }
          .button:hover {
            background: #b91c1c;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #64748b;
            font-size: 14px;
            background: #f1f5f9;
            border-top: 1px solid #e2e8f0;
          }
          .warning {
            color: #dc2626;
            font-weight: 500;
          }
          .token-info {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 12px;
            border: 1px solid #e2e8f0;
          }
          .security-note {
            background: #fffbeb;
            border: 1px solid #fcd34d;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Đặt Lại Mật Khẩu</h1>
            <p>Yêu cầu bảo mật tài khoản</p>
          </div>
          <div class="content">
            <p>Xin chào <strong>${fullName || 'Thành viên'}</strong>,</p>
            
            <div class="reset-info">
              <p><strong>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</strong></p>
              <p>Thời gian yêu cầu: ${new Date().toLocaleString('vi-VN')}</p>
            </div>

            <p>Để đặt lại mật khẩu, vui lòng nhấp vào nút bên dưới:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button" style="color: white; text-decoration: none;">
                🚀 ĐẶT LẠI MẬT KHẨU
              </a>
            </div>

            <p>Hoặc sao chép và dán liên kết sau vào trình duyệt:</p>
            <div class="token-info">${resetUrl}</div>

            <div class="security-note">
              <p><strong>🔒 Thông tin bảo mật quan trọng:</strong></p>
              <ul>
                <li>Liên kết này sẽ hết hạn trong <strong>1 giờ</strong></li>
                <li>Chỉ sử dụng liên kết này một lần</li>
                <li>Không chia sẻ liên kết này với bất kỳ ai</li>
              </ul>
            </div>

            <p class="warning">⚠️ <strong>Nếu bạn không yêu cầu đặt lại mật khẩu</strong>, vui lòng:</p>
            <ol>
              <li>Bỏ qua email này</li>
              <li>Kiểm tra bảo mật tài khoản của bạn</li>
              <li>Liên hệ hỗ trợ ngay nếu cần</li>
            </ol>

            <p>Trân trọng,<br><strong>Đội ngũ An ninh Hệ Thống Y Tế</strong><br>${process.env.HOSPITAL_NAME}</p>
          </div>
          <div class="footer">
            <p>© 2024 ${process.env.HOSPITAL_NAME}. All rights reserved.</p>
            <p>Đây là email tự động, vui lòng không trả lời.</p>
            <p><small>Email được gửi từ: ${process.env.EMAIL_FROM}</small></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 🎯 TEMPLATE EMAIL XÁC NHẬN ĐỔI MẬT KHẨU
   */
  getPasswordChangedTemplate(user) {
    const fullName = `${user.personalInfo?.firstName || ''} ${user.personalInfo?.lastName || ''}`.trim();
    const currentTime = new Date().toLocaleString('vi-VN');
    const deviceInfo = 'Hệ thống đã ghi nhận thay đổi';
    
    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mật Khẩu Đã Được Thay Đổi - Hệ Thống Y Tế</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f6f9fc;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #059669, #047857);
            color: white; 
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content { 
            padding: 30px;
            background: white;
          }
          .success-info {
            background: #f0fdf4;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #10b981;
            margin: 20px 0;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #64748b;
            font-size: 14px;
            background: #f1f5f9;
            border-top: 1px solid #e2e8f0;
          }
          .security-tip {
            background: #fffbeb;
            border: 1px solid #fcd34d;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          .activity-info {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Mật Khẩu Đã Được Thay Đổi</h1>
            <p>Xác nhận thay đổi bảo mật thành công</p>
          </div>
          <div class="content">
            <p>Xin chào <strong>${fullName || 'Thành viên'}</strong>,</p>
            
            <div class="success-info">
              <p><strong>Mật khẩu của bạn đã được thay đổi thành công!</strong></p>
              <div class="activity-info">
                <p><strong>📧 Tài khoản:</strong> ${user.email}</p>
                <p><strong>🕒 Thời gian:</strong> ${currentTime}</p>
                <p><strong>💻 Thiết bị:</strong> ${deviceInfo}</p>
              </div>
            </div>

            <div class="security-tip">
              <p><strong>🔒 Mẹo bảo mật quan trọng:</strong></p>
              <ul>
                <li>Không bao giờ chia sẻ mật khẩu với bất kỳ ai</li>
                <li>Sử dụng mật khẩu mạnh và duy nhất cho mỗi tài khoản</li>
                <li>Luôn đăng xuất sau khi sử dụng trên thiết bị công cộng</li>
                <li>Bật xác thực hai yếu tố nếu có sẵn</li>
                <li>Thường xuyên kiểm tra hoạt động đăng nhập</li>
              </ul>
            </div>

            <p class="warning"><strong>⚠️ Nếu bạn không thực hiện thay đổi này:</strong></p>
            <ol>
              <li>Đặt lại mật khẩu ngay lập tức</li>
              <li>Liên hệ bộ phận hỗ trợ: <strong>${process.env.SUPPORT_PHONE}</strong></li>
              <li>Kiểm tra các hoạt động gần đây trên tài khoản</li>
              <li>Báo cáo sự cố bảo mật ngay lập tức</li>
            </ol>

            <p>Trân trọng,<br><strong>Đội ngũ An ninh Hệ Thống Y Tế</strong><br>${process.env.HOSPITAL_NAME}</p>
          </div>
          <div class="footer">
            <p>© 2024 ${process.env.HOSPITAL_NAME}. All rights reserved.</p>
            <p>Đây là email tự động, vui lòng không trả lời.</p>
            <p><small>Để bảo vệ tài khoản, hãy giữ thông tin đăng nhập của bạn an toàn.</small></p>
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
      'BILLING_STAFF': 'Nhân viên kế toán',
      'ADMIN': 'Quản trị viên'
    };
    
    return roleNames[role] || role;
  }

  /**
   * 🧪 TEST GMAIL SMTP SERVICE
   */
  async testGmailSMTPService() {
    try {
      console.log('🧪 Testing Gmail SMTP Service...');
      
      // Test với email thật của bạn
      const testUser = {
        email: 'luanvo100404@gmail.com', // Thay bằng email bạn muốn test
        personalInfo: {
          firstName: 'Luan',
          lastName: 'Vo'
        },
        role: 'PATIENT'
      };

      console.log('1. Testing Gmail SMTP connection...');
      await this.verifyConnection();
      console.log('✅ Gmail SMTP connection successful\n');

      console.log('2. Testing welcome email to REAL Gmail...');
      const welcomeResult = await this.sendWelcomeEmail(testUser);
      console.log('✅ Welcome email sent to real Gmail:', welcomeResult.messageId, '\n');

      console.log('3. Testing password reset email to REAL Gmail...');
      const resetToken = 'test_gmail_reset_token_' + Date.now();
      const resetResult = await this.sendPasswordResetEmail(testUser, resetToken);
      console.log('✅ Password reset email sent to real Gmail:', resetResult.messageId, '\n');

      console.log('🎉 Gmail SMTP test completed successfully!');
      console.log('📧 Check your REAL Gmail inbox for test emails');
      
      return { 
        success: true, 
        message: 'Gmail SMTP test completed - Check your real Gmail inbox',
        testEmails: [
          { type: 'Welcome', messageId: welcomeResult.messageId },
          { type: 'Password Reset', messageId: resetResult.messageId }
        ]
      };

    } catch (error) {
      console.error('❌ Gmail SMTP test failed:', error.message);
      console.log('\n💡 Hướng dẫn khắc phục sự cố Gmail SMTP:');
      console.log('1. Tạo App Password: https://myaccount.google.com/apppasswords');
      console.log('2. Đảm bảo 2FA đã bật trên tài khoản Gmail');
      console.log('3. Kiểm tra SMTP_USER và SMTP_PASS trong .env');
      console.log('4. Thử bật "Allow less secure apps" nếu cần (không khuyến nghị)');
      
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();