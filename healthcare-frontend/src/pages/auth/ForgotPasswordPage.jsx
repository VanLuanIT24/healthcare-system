// src/pages/auth/ForgotPasswordPage.jsx
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    KeyOutlined,
    LoadingOutlined,
    LockOutlined,
    MailOutlined,
    SafetyCertificateOutlined,
    SendOutlined
} from '@ant-design/icons';
import { Button, Form, Input, Space, Typography, message } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const ForgotPasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const steps = [
    {
      title: 'Nhập Email',
      description: 'Xác minh tài khoản',
      icon: '📧',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Xác thực OTP',
      description: 'Nhập mã xác nhận',
      icon: '🔐',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Đặt lại MK',
      description: 'Mật khẩu mới',
      icon: '🔑',
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'Hoàn tất',
      description: 'Thành công',
      icon: '🎉',
      color: 'from-orange-500 to-yellow-500'
    }
  ];

  // Countdown cho OTP
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown(prev => prev - 1);
      }, 1000);
    } else if (otpCountdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const handleSendOTP = async (values) => {
    setLoading(true);
    try {
      // Animation loading với particle effect
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEmail(values.email);
      setCurrentStep(1);
      setOtpCountdown(60); // 60 giây countdown
      setCanResend(false);
      
      // Hiệu ứng success
      message.success({
        content: (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
              <SendOutlined className="text-white" />
            </div>
            <div>
              <div className="font-semibold">Mã OTP đã được gửi!</div>
              <div className="text-sm">Kiểm tra email của bạn</div>
            </div>
          </div>
        ),
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (values) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Hiệu ứng xác thực thành công
      const otpDigits = values.otp.split('');
      const inputElements = document.querySelectorAll('.otp-digit');
      
      // Animation cho từng digit
      otpDigits.forEach((digit, index) => {
        setTimeout(() => {
          if (inputElements[index]) {
            inputElements[index].classList.add('animate-bounce');
            setTimeout(() => {
              inputElements[index].classList.remove('animate-bounce');
            }, 300);
          }
        }, index * 100);
      });
      
      setTimeout(() => {
        setCurrentStep(2);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Hiệu ứng password strength
      const strength = calculatePasswordStrength(values.password);
      if (strength === 'strong') {
        message.success({
          content: '✅ Mật khẩu mạnh! Bảo mật tuyệt vời!',
          duration: 3,
        });
      }
      
      setTimeout(() => {
        setCurrentStep(3);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score >= 4) return 'strong';
    if (score >= 2) return 'medium';
    return 'weak';
  };

  const handleResendOTP = () => {
    setOtpCountdown(60);
    setCanResend(false);
    message.info('📧 Đã gửi lại mã OTP!');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-3/4 w-48 h-48 bg-gradient-to-r from-pink-400/15 to-rose-400/15 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Floating Particles Effect */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -20, 20, -10],
              x: [null, 10, -10, 5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="w-full max-w-2xl z-10"
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg"
            >
              <KeyOutlined className="text-2xl text-white" />
            </motion.div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Khôi phục mật khẩu
              </h1>
              <p className="text-gray-500">Đặt lại mật khẩu của bạn trong vài bước đơn giản</p>
            </div>
          </Link>
        </motion.div>

        {/* Progress Steps - Enhanced */}
        <motion.div 
          className="mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
                initial={{ width: "0%" }}
                animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </div>

            <div className="grid grid-cols-4 gap-4 relative z-10">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => index <= currentStep && setCurrentStep(index)}
                  variants={itemVariants}
                >
                  <motion.div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-xl mb-3 shadow-lg transition-all ${
                      index < currentStep
                        ? `bg-gradient-to-br ${step.color} text-white`
                        : index === currentStep
                        ? `bg-gradient-to-br ${step.color} text-white ring-4 ring-opacity-30 ring-current`
                        : 'bg-gray-100 text-gray-400'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {index < currentStep ? (
                      <CheckCircleOutlined className="text-lg" />
                    ) : (
                      <span>{step.icon}</span>
                    )}
                  </motion.div>
                  <div className="text-center">
                    <div className={`text-sm font-semibold ${
                      index <= currentStep ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{step.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Card */}
        <motion.div
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
          whileHover={{ 
            boxShadow: "0 25px 50px rgba(99, 102, 241, 0.15)" 
          }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Enter Email */}
            {currentStep === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <MailOutlined className="text-3xl text-white" />
                  </div>
                  <Title level={3} className="!mb-2">
                    Nhập email của bạn
                  </Title>
                  <Paragraph type="secondary" className="!mb-6">
                    Chúng tôi sẽ gửi mã xác thực 6 chữ số đến email này
                  </Paragraph>
                </div>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSendOTP}
                  className="space-y-4"
                >
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email' },
                      { type: 'email', message: 'Email không hợp lệ' },
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<MailOutlined className="text-gray-400" />}
                      placeholder="email@example.com"
                      className="rounded-xl h-12 border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-all"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={loading}
                      className="rounded-xl h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-none shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                      icon={loading ? <LoadingOutlined /> : <SendOutlined />}
                    >
                      {loading ? 'Đang gửi...' : 'Gửi mã xác thực'}
                    </Button>
                  </Form.Item>
                </Form>

                <div className="text-center">
                  <Link to="/login" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                    <ArrowLeftOutlined /> Quay lại đăng nhập
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Step 2: Enter OTP */}
            {currentStep === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                    <SafetyCertificateOutlined className="text-3xl text-white" />
                  </div>
                  <Title level={3} className="!mb-2">
                    Nhập mã xác thực
                  </Title>
                  <Paragraph type="secondary" className="!mb-4">
                    Mã gồm 6 chữ số đã được gửi đến
                  </Paragraph>
                  <div className="inline-block px-4 py-2 bg-blue-50 rounded-lg mb-4">
                    <Text strong className="text-blue-600">{email}</Text>
                  </div>
                </div>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleVerifyOTP}
                  className="space-y-6"
                >
                  <Form.Item
                    name="otp"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mã OTP' },
                      { len: 6, message: 'Mã OTP gồm 6 chữ số' },
                      { pattern: /^[0-9]+$/, message: 'Chỉ được nhập số' }
                    ]}
                  >
                    <div className="flex justify-center gap-3">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <Form.Item
                          key={index}
                          name={`otp-${index}`}
                          noStyle
                        >
                          <Input
                            size="large"
                            maxLength={1}
                            className="otp-digit w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-300 hover:border-purple-400 focus:border-purple-500 focus:shadow-lg transition-all"
                            onInput={(e) => {
                              const value = e.target.value;
                              if (value && index < 5) {
                                const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`);
                                nextInput?.focus();
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace' && !e.target.value && index > 0) {
                                const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`);
                                prevInput?.focus();
                              }
                            }}
                          />
                        </Form.Item>
                      ))}
                    </div>
                  </Form.Item>

                  {/* Countdown Timer */}
                  <div className="text-center">
                    {otpCountdown > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <LoadingOutlined className="text-gray-400 animate-spin" />
                          <Text type="secondary">
                            Gửi lại mã sau: <span className="font-mono font-bold text-red-500">{otpCountdown}s</span>
                          </Text>
                        </div>
                        <Text type="secondary" className="text-sm">
                          Chưa nhận được mã? Kiểm tra thư mục spam
                        </Text>
                      </div>
                    ) : (
                      <Button
                        type="link"
                        onClick={handleResendOTP}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                        disabled={!canResend}
                      >
                        ↻ Gửi lại mã OTP
                      </Button>
                    )}
                  </div>

                  <Form.Item>
                    <Space direction="vertical" className="w-full">
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        loading={loading}
                        className="rounded-xl h-12 text-base font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-none shadow-lg hover:shadow-xl"
                        icon={loading ? <LoadingOutlined /> : <CheckCircleOutlined />}
                      >
                        {loading ? 'Đang xác thực...' : 'Xác nhận mã OTP'}
                      </Button>
                      
                      <Button
                        type="default"
                        size="large"
                        block
                        onClick={() => setCurrentStep(0)}
                        className="rounded-xl h-12"
                        icon={<ArrowLeftOutlined />}
                      >
                        Quay lại
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </motion.div>
            )}

            {/* Step 3: Reset Password */}
            {currentStep === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <LockOutlined className="text-3xl text-white" />
                  </div>
                  <Title level={3} className="!mb-2">
                    Tạo mật khẩu mới
                  </Title>
                  <Paragraph type="secondary" className="!mb-6">
                    Mật khẩu mới phải khác với mật khẩu cũ
                  </Paragraph>
                </div>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleResetPassword}
                  className="space-y-4"
                >
                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                      { min: 8, message: 'Tối thiểu 8 ký tự' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const strength = calculatePasswordStrength(value);
                          if (strength === 'weak') {
                            return Promise.reject(new Error('Mật khẩu quá yếu!'));
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                    validateFirst
                  >
                    <Input.Password
                      size="large"
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder="Mật khẩu mới"
                      className="rounded-xl h-12 border-gray-300 hover:border-green-400 focus:border-green-500"
                      onChange={(e) => {
                        const strength = calculatePasswordStrength(e.target.value);
                        // Có thể thêm visual feedback ở đây
                      }}
                    />
                  </Form.Item>

                  {/* Password Strength Indicator */}
                  <div className="px-2">
                    <div className="text-sm text-gray-600 mb-1">Độ mạnh mật khẩu:</div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                        initial={{ width: "0%" }}
                        animate={{ 
                          width: form.getFieldValue('password') 
                            ? `${(calculatePasswordStrength(form.getFieldValue('password')) === 'strong' ? 100 : 
                                calculatePasswordStrength(form.getFieldValue('password')) === 'medium' ? 66 : 33)}%` 
                            : "0%" 
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Mật khẩu không khớp'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      size="large"
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder="Xác nhận mật khẩu mới"
                      className="rounded-xl h-12 border-gray-300 hover:border-green-400 focus:border-green-500"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Space direction="vertical" className="w-full">
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        loading={loading}
                        className="rounded-xl h-12 text-base font-semibold bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 border-none shadow-lg hover:shadow-xl"
                      >
                        {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                      </Button>
                      
                      <Button
                        type="default"
                        size="large"
                        block
                        onClick={() => setCurrentStep(1)}
                        className="rounded-xl h-12"
                        icon={<ArrowLeftOutlined />}
                      >
                        Quay lại
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {currentStep === 3 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <motion.div
                    className="w-32 h-32 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 360] 
                    }}
                    transition={{ 
                      scale: { duration: 2, repeat: Infinity },
                      rotate: { duration: 3, ease: "linear", repeat: Infinity }
                    }}
                  >
                    <CheckCircleOutlined className="text-5xl text-white" />
                  </motion.div>
                  
                  <Title level={2} className="!mb-4">
                    <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                      Thành công!
                    </span>
                  </Title>
                  
                  <Paragraph type="secondary" className="!mb-8 text-lg">
                    Mật khẩu của bạn đã được đặt lại thành công
                  </Paragraph>

                  <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-2xl border border-green-200 mb-8">
                    <div className="space-y-3 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircleOutlined className="text-white" />
                        </div>
                        <span className="font-medium">Mật khẩu đã được cập nhật</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircleOutlined className="text-white" />
                        </div>
                        <span className="font-medium">Tất cả thiết bị đã đăng xuất</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <CheckCircleOutlined className="text-white" />
                        </div>
                        <span className="font-medium">Thông báo đã gửi đến email</span>
                      </div>
                    </div>
                  </div>

                  <Space direction="vertical" className="w-full">
                    <Button
                      type="primary"
                      size="large"
                      block
                      onClick={() => navigate('/login')}
                      className="rounded-xl h-12 text-base font-semibold bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 border-none shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                    >
                      Đăng nhập ngay
                    </Button>
                    
                    <Button
                      type="default"
                      size="large"
                      block
                      onClick={() => navigate('/')}
                      className="rounded-xl h-12"
                    >
                      Về trang chủ
                    </Button>
                  </Space>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Bar */}
          <motion.div 
            className="mt-8 pt-6 border-t border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-between items-center mb-2">
              <Text type="secondary">Tiến độ</Text>
              <Text strong>{currentStep + 1}/{steps.length}</Text>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Footer Links */}
        <motion.div 
          className="mt-8 text-center space-y-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-sm text-gray-500">
            Gặp vấn đề? <Link to="/help" className="text-blue-600 hover:underline font-medium">Liên hệ hỗ trợ</Link>
          </div>
          <div className="flex justify-center gap-6">
            <Link to="/privacy" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
              Chính sách bảo mật
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
              Điều khoản sử dụng
            </Link>
            <Link to="/faq" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
              Câu hỏi thường gặp
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;