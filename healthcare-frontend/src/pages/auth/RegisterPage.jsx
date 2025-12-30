// src/pages/auth/RegisterPage.jsx
import Logo from '@/components/common/Logo';
import ParticlesBackground from '@/components/effect/ParticlesBackground';
import ThemeToggle from '@/components/effect/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import authAPI from '@/services/api/authAPI';
import {
    ArrowRightOutlined,
    CalendarOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    FacebookOutlined,
    GoogleOutlined,
    IdcardOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    RocketOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Button, Checkbox, DatePicker, Divider, FloatButton, Form, Input, message, Select } from 'antd';
import locale from 'antd/es/date-picker/locale/vi_VN';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const { Option } = Select;

const RegisterPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showParticles, setShowParticles] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Hiệu ứng particles tự động
  useEffect(() => {
    const interval = setInterval(() => {
      setShowParticles(prev => !prev);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Animation loading với hiệu ứng bước
      for (let i = 0; i <= 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setActiveStep(i);
      }
      
      // Chuẩn bị dữ liệu đăng ký với role mặc định là "Guest"
      const fullNameParts = values.fullName.trim().split(/\s+/);
      const firstName = fullNameParts[0] || '';
      const lastName = fullNameParts.slice(1).join(' ') || fullNameParts[0] || '';
      
      const registerData = {
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        role: 'PATIENT', // Mặc định role là PATIENT
        personalInfo: {
          firstName: firstName,
          lastName: lastName,
          phone: values.phone || '',
          dateOfBirth: values.birthday ? values.birthday.format('YYYY-MM-DD') : undefined,
          gender: (values.gender || 'OTHER').toUpperCase(),
        }
      };

      // Gửi request đăng ký
      const response = await authAPI.register(registerData);
      
      console.log('✅ Register Response:', response);
      console.log('✅ Response status:', response.status);
      console.log('✅ Response data:', response.data);
      setLoading(false);
      
      // Handle axios response object { status: 201, data: { success: true, message: '...', data: { user: {...} } } }
      let user;
      let successMessage;
      
      // Cách 1: response.data?.data?.user (nếu axios trả về response object)
      if (response?.data?.data?.user) {
        user = response.data.data.user;
        successMessage = response.data?.message || 'Bạn đã đăng ký thành công. Hãy đăng nhập để sử dụng dịch vụ healthcare';
      }
      // Cách 2: response.user (nếu interceptor bóc tách data)
      else if (response?.user) {
        user = response.user;
        successMessage = response?.message || 'Bạn đã đăng ký thành công. Hãy đăng nhập để sử dụng dịch vụ healthcare';
      }
      // Cách 3: response.data?.user (fallback)
      else if (response?.data?.user) {
        user = response.data.user;
        successMessage = response.data?.message || 'Bạn đã đăng ký thành công. Hãy đăng nhập để sử dụng dịch vụ healthcare';
      }
      
      const isSuccess = (response.status === 201 || response.status === 200 || response?.data?.success === true) && user;
      
      if (isSuccess) {
        console.log('🎉 Register Success:', { user, successMessage });
        
        // ✅ Hiển thị thông báo thành công 3 giây, sau đó tự chuyển hướng
        message.success({
          content: (
            <div style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#22863a' }}>
                ✅ Đăng ký thành công!
              </h3>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333' }}>
                🎉 Bạn đã đăng ký thành công. Hãy đăng nhập để sử dụng dịch vụ healthcare
              </p>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#555' }}>
                📧 Email: <strong>{user?.email}</strong>
              </p>
              <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>
                ⏱️ Trang đăng nhập sẽ tự động tải trong 3 giây...
              </p>
            </div>
          ),
          duration: 3,
          className: 'success-message'
        });
        
        // ✅ Chuyển hướng sau 3 giây
        setTimeout(() => {
          console.log('🔄 Redirecting to login...');
          navigate('/login', { replace: true });
        }, 3000);
      } else {
        // Nếu không phải success thì throw error
        throw new Error('Register response không thành công');
      }
    } catch (error) {
      console.error('❌ Register Error:', error);
      console.error('❌ Error Response:', error.response?.data);
      
      // Xử lý error từ server
      const errorResponse = error.response?.data;
      const errorData = errorResponse?.error || errorResponse;
      const errorMessage = errorData?.message || errorResponse?.message || error.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      const details = errorData?.details || [];
      
      // Tạo thông báo lỗi chi tiết
      const errorContent = (
        <div>
          <p style={{ marginBottom: '12px', fontWeight: 500 }}>⚠️ {errorMessage}</p>
          
          {/* Hiển thị chi tiết lỗi validation */}
          {details && details.length > 0 && (
            <div style={{ 
              backgroundColor: 'rgba(255, 77, 79, 0.1)', 
              padding: '12px', 
              borderRadius: '6px',
              borderLeft: '4px solid #ff4d4f',
              marginBottom: '12px'
            }}>
              <p style={{ marginBottom: '8px', fontWeight: 500, fontSize: '13px', color: '#ff4d4f' }}>
                ❌ Chi tiết lỗi:
              </p>
              {details.map((detail, idx) => (
                <div key={idx} style={{ marginBottom: '6px', fontSize: '12px', color: '#333' }}>
                  <span style={{ fontWeight: 500, color: '#ff4d4f' }}>• {detail.field}:</span> {detail.message}
                </div>
              ))}
            </div>
          )}
          
          {/* Hiển thị dữ liệu nhận được */}
          {errorData?.receivedData && (
            <details style={{ marginTop: '12px', fontSize: '12px', cursor: 'pointer' }}>
              <summary style={{ color: '#0050b3', fontWeight: 500, marginBottom: '8px' }}>
                📊 Dữ liệu gửi đi
              </summary>
              <pre style={{
                backgroundColor: '#f5f5f5',
                padding: '10px',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '250px',
                fontSize: '11px',
                lineHeight: '1.4',
                border: '1px solid #e0e0e0'
              }}>
                {JSON.stringify(errorData.receivedData, null, 2)}
              </pre>
            </details>
          )}
        </div>
      );
      
      message.error({
        content: errorContent,
        duration: 6,
        className: 'error-message'
      });
      setActiveStep(0);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const floatingIconVariants = {
    float: {
      y: [0, -15, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Floating Elements Background */}
      {showParticles && <ParticlesBackground />}
      
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-cyan-50 animate-gradient" />
      
      {/* Left - Enhanced Image Section */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 relative"
        initial={{ x: -50 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1600&auto=format&fit=crop)',
            }}
            animate={{
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 via-teal-600/70 to-cyan-800/90" />
        </div>
        
        <div className="relative z-20 flex flex-col justify-center p-12 text-white">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <div className="mb-8">
                <Logo size="lg" showText={true} />
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-5xl font-bold mb-6 leading-tight"
              variants={itemVariants}
            >
              Bắt đầu hành trình <br /> 
              <span className="bg-gradient-to-r from-green-300 to-cyan-300 bg-clip-text text-transparent">
                sức khỏe của bạn
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-green-100/90 text-lg mb-12 leading-relaxed"
              variants={itemVariants}
            >
              Đăng ký ngay để trải nghiệm dịch vụ chăm sóc sức khỏe toàn diện 24/7
            </motion.p>

            {/* Registration Progress */}
            <motion.div 
              className="mb-8"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between mb-4">
                {['Thông tin', 'Xác thực', 'Hoàn tất'].map((step, index) => (
                  <motion.div
                    key={step}
                    className="flex flex-col items-center"
                    animate={{
                      scale: activeStep === index ? 1.1 : 1,
                    }}
                  >
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center mb-2
                      ${activeStep >= index 
                        ? 'bg-gradient-to-r from-green-400 to-teal-400 text-white' 
                        : 'bg-white/20 text-white/60'
                      }
                      transition-all duration-300
                    `}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">{step}</span>
                  </motion.div>
                ))}
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-green-400 to-teal-400 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(activeStep / 2) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>

            <motion.div 
              className="space-y-6"
              variants={itemVariants}
            >
              {[
                { icon: '👨‍⚕️', text: 'Tư vấn với bác sĩ chuyên khoa', color: 'from-green-500 to-emerald-500' },
                { icon: '📊', text: 'Theo dõi sức khỏe cá nhân hóa', color: 'from-teal-500 to-cyan-500' },
                { icon: '💊', text: 'Nhắc nhở uống thuốc thông minh', color: 'from-blue-500 to-indigo-500' },
                { icon: '📱', text: 'Ứng dụng di động tiện lợi', color: 'from-purple-500 to-pink-500' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 group cursor-pointer"
                  whileHover={{ scale: 1.02, x: 10 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-xl shadow-lg group-hover:shadow-xl transition-all`}>
                    {feature.icon}
                  </div>
                  <span className="text-white/95 group-hover:text-white transition-colors font-medium">
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats Bar */}
            <motion.div 
              className="mt-12 pt-8 border-t border-white/20"
              variants={itemVariants}
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <motion.div 
                    className="text-2xl font-bold"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    15K+
                  </motion.div>
                  <div className="text-sm text-white/70">Thành viên mới</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">4.8★</div>
                  <div className="text-sm text-white/70">Đánh giá</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm text-white/70">Hỗ trợ</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right - Enhanced Form Section */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        {/* Floating Icons */}
        <motion.div
          className="absolute top-1/4 right-1/4"
          variants={floatingIconVariants}
          animate="float"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-green-300/20 to-cyan-300/20 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <span className="text-2xl">👨‍⚕️</span>
          </div>
        </motion.div>
        
        <motion.div
          className="absolute bottom-1/3 left-1/4"
          variants={floatingIconVariants}
          animate="float"
          style={{ animationDelay: '1s' }}
        >
          <div className="w-12 h-12 bg-gradient-to-r from-teal-300/20 to-blue-300/20 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <span className="text-xl">💊</span>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-green-400/10 to-cyan-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 rounded-full blur-3xl" />
        
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 100,
            damping: 20
          }}
          className="w-full max-w-lg z-10"
        >
          <motion.div
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
            whileHover={{ 
              boxShadow: "0 20px 60px rgba(16, 185, 129, 0.15)" 
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-block">
                <Logo size="md" showText={true} />
              </div>
            </div>

            {/* Header */}
            <motion.div 
              className="text-center mb-8"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
            >
              <motion.div 
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl mb-4 shadow-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <RocketOutlined className="text-2xl text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Đăng ký tài khoản
              </h2>
              <p className="text-gray-500 mt-2">
                Đã có tài khoản?{' '}
                <Link 
                  to="/login" 
                  className="text-green-600 hover:text-green-700 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  Đăng nhập ngay <ArrowRightOutlined className="text-xs rotate-180" />
                </Link>
              </p>
            </motion.div>

            {/* Data Requirements Info */}
            <motion.div
              className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p style={{ margin: 0, marginBottom: '8px', fontWeight: 500, color: '#0050b3', fontSize: '13px' }}>
                ℹ️ Yêu cầu dữ liệu đăng ký:
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#333', lineHeight: '1.6' }}>
                <li><strong>Email:</strong> Địa chỉ email hợp lệ</li>
                <li><strong>Họ và tên:</strong> Nhập họ và tên (sẽ được tách thành firstName, lastName)</li>
                <li><strong>Số điện thoại:</strong> 10 chữ số (bắt buộc)</li>
                <li><strong>Giới tính:</strong> Male, Female hoặc Other</li>
                <li><strong>Ngày sinh:</strong> Phải từ 13 tuổi trở lên</li>
                <li><strong>Mật khẩu:</strong> Tối thiểu 6 ký tự</li>
              </ul>
            </motion.div>

            {/* Enhanced Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="space-y-4"
            >
              <motion.div variants={containerVariants}>
                {/* Full Name */}
                <motion.div variants={itemVariants}>
                  <Form.Item
                    name="fullName"
                    label={<span className="font-semibold text-gray-700">Họ và tên</span>}
                    rules={[
                      { required: true, message: '❌ Họ và tên không được để trống' },
                      { min: 3, message: '❌ Họ và tên phải có ít nhất 3 ký tự' },
                      { 
                        pattern: /^[a-zA-Z\u00c0-\u1eff\s]+$/, 
                        message: '❌ Họ và tên chỉ được chứa chữ cái và khoảng trắng' 
                      }
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="Nguyễn Văn A"
                      className="rounded-xl h-12 border-gray-300 hover:border-green-400 focus:border-green-500 transition-all"
                    />
                  </Form.Item>
                </motion.div>

                {/* Email */}
                <motion.div variants={itemVariants}>
                  <Form.Item
                    name="email"
                    label={<span className="font-semibold text-gray-700">Email</span>}
                    rules={[
                      { required: true, message: '❌ Email không được để trống' },
                      { type: 'email', message: '❌ Email không hợp lệ (vd: user@example.com)' },
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<MailOutlined className="text-gray-400" />}
                      placeholder="your@email.com"
                      className="rounded-xl h-12 border-gray-300 hover:border-green-400 focus:border-green-500 transition-all"
                    />
                  </Form.Item>
                </motion.div>

                {/* Phone */}
                <motion.div variants={itemVariants}>
                  <Form.Item
                    name="phone"
                    label={<span className="font-semibold text-gray-700">Số điện thoại</span>}
                    rules={[
                      { required: true, message: '❌ Số điện thoại không được để trống' },
                      { pattern: /^[0-9]{10}$/, message: '❌ Số điện thoại phải đúng 10 chữ số (vd: 0912345678)' },
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<PhoneOutlined className="text-gray-400" />}
                      placeholder="0912345678"
                      className="rounded-xl h-12 border-gray-300 hover:border-green-400 focus:border-green-500 transition-all"
                    />
                  </Form.Item>
                </motion.div>

                {/* Gender */}
                <motion.div variants={itemVariants}>
                  <Form.Item
                    name="gender"
                    label={<span className="font-semibold text-gray-700">Giới tính</span>}
                    rules={[{ required: true, message: '❌ Vui lòng chọn giới tính' }]}
                  >
                    <Select
                      size="large"
                      placeholder="Chọn giới tính"
                      className="rounded-xl h-12"
                      suffixIcon={<IdcardOutlined />}
                    >
                      <Option value="male">Nam</Option>
                      <Option value="female">Nữ</Option>
                      <Option value="other">Khác</Option>
                    </Select>
                  </Form.Item>
                </motion.div>

                {/* Birthday */}
                <motion.div variants={itemVariants}>
                  <Form.Item
                    name="birthday"
                    label={<span className="font-semibold text-gray-700">Ngày sinh</span>}
                    rules={[
                      { required: true, message: '❌ Vui lòng chọn ngày sinh' },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          const age = new Date().getFullYear() - value.year();
                          if (age < 13) return Promise.reject(new Error('❌ Bạn phải từ 13 tuổi trở lên'));
                          if (age > 100) return Promise.reject(new Error('❌ Ngày sinh không hợp lệ'));
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <DatePicker
                      size="large"
                      locale={locale}
                      placeholder="DD/MM/YYYY"
                      className="w-full rounded-xl h-12"
                      format="DD/MM/YYYY"
                      suffixIcon={<CalendarOutlined />}
                    />
                  </Form.Item>
                </motion.div>

                {/* Password */}
                <motion.div variants={itemVariants}>
                  <Form.Item
                    name="password"
                    label={<span className="font-semibold text-gray-700">Mật khẩu</span>}
                    rules={[
                      { required: true, message: '❌ Mật khẩu không được để trống' },
                      { min: 6, message: '❌ Mật khẩu phải có ít nhất 6 ký tự' },
                      { max: 50, message: '❌ Mật khẩu không được dài quá 50 ký tự' },
                    ]}
                  >
                    <Input.Password
                      size="large"
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder="••••••••"
                      iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                      className="rounded-xl h-12 border-gray-300 hover:border-green-400 focus:border-green-500 transition-all"
                    />
                  </Form.Item>
                </motion.div>

                {/* Confirm Password */}
                <motion.div variants={itemVariants}>
                  <Form.Item
                    name="confirmPassword"
                    label={<span className="font-semibold text-gray-700">Xác nhận mật khẩu</span>}
                    dependencies={['password']}
                    rules={[
                      { required: true, message: '❌ Vui lòng xác nhận mật khẩu' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('❌ Mật khẩu xác nhận không khớp với mật khẩu trên'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      size="large"
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder="••••••••"
                      iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                      className="rounded-xl h-12 border-gray-300 hover:border-green-400 focus:border-green-500 transition-all"
                    />
                  </Form.Item>
                </motion.div>

                {/* Terms */}
                <motion.div variants={itemVariants}>
                  <Form.Item
                    name="agree"
                    valuePropName="checked"
                    rules={[
                      {
                        validator: (_, value) =>
                          value ? Promise.resolve() : Promise.reject(new Error('❌ Bạn phải đồng ý với Điều khoản và Chính sách bảo mật')),
                      },
                    ]}
                  >
                    <Checkbox className="font-medium hover:text-green-600 transition-colors">
                      Tôi đồng ý với{' '}
                      <Link to="/terms" className="text-green-600 hover:underline">
                        Điều khoản
                      </Link>{' '}
                      và{' '}
                      <Link to="/privacy" className="text-green-600 hover:underline">
                        Chính sách bảo mật
                      </Link>
                    </Checkbox>
                  </Form.Item>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={loading}
                      className="rounded-xl h-12 text-base font-semibold bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 border-none shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                      icon={loading ? null : <ArrowRightOutlined />}
                    >
                      {loading ? 'Đang đăng ký...' : 'Đăng ký ngay'}
                    </Button>
                  </Form.Item>
                </motion.div>
              </motion.div>
            </Form>

            {/* Social Registration */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Divider className="text-gray-400">
                <span className="bg-white px-4">Hoặc đăng ký với</span>
              </Divider>

              <div className="flex gap-3">
                <Button
                  size="large"
                  icon={<GoogleOutlined />}
                  block
                  className="rounded-xl h-12 flex items-center justify-center gap-2 font-medium border-gray-300 hover:border-red-400 hover:text-red-600 hover:shadow-md transition-all"
                >
                  Google
                </Button>
                <Button
                  size="large"
                  icon={<FacebookOutlined />}
                  block
                  className="rounded-xl h-12 flex items-center justify-center gap-2 font-medium border-gray-300 hover:border-blue-400 hover:text-blue-600 hover:shadow-md transition-all"
                >
                  Facebook
                </Button>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.p 
              className="text-center text-gray-500 text-sm mt-8 pt-6 border-t border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Bằng việc đăng ký, bạn đồng ý với{' '}
              <Link to="/terms" className="text-green-600 hover:underline font-medium">
                Điều khoản
              </Link>{' '}
              và{' '}
              <Link to="/privacy" className="text-green-600 hover:underline font-medium">
                Bảo mật
              </Link>
            </motion.p>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div 
            className="mt-8 grid grid-cols-3 gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200/50">
              <div className="text-green-500 text-lg mb-1">🔐</div>
              <div className="text-xs font-medium text-gray-600">Bảo mật</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200/50">
              <div className="text-teal-500 text-lg mb-1">⚡</div>
              <div className="text-xs font-medium text-gray-600">Nhanh chóng</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200/50">
              <div className="text-cyan-500 text-lg mb-1">🎯</div>
              <div className="text-xs font-medium text-gray-600">Dễ dùng</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <FloatButton
        icon="🎨"
        type="primary"
        className="!bg-gradient-to-r !from-green-500 !to-teal-500"
        onClick={() => setShowParticles(!showParticles)}
      />
    </div>
  );
};

export default RegisterPage;