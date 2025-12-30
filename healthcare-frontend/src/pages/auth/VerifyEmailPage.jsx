// src/pages/auth/VerifyEmailPage.jsx
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    MailOutlined
} from '@ant-design/icons';
import { Button, Form, Input, Space, Typography, message } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './AuthPages.css';

const { Title, Text, Paragraph } = Typography;

const VerifyEmailPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [successMessage, setSuccessMessage] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email');
  const inputRefs = useRef([]);

  const steps = [
    {
      title: 'Email',
      description: 'Nhập email',
      icon: '📧',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Xác thực OTP',
      description: 'Nhập mã OTP',
      icon: '🔐',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Hoàn tất',
      description: 'Email đã xác thực',
      icon: '✅',
      color: 'from-green-500 to-teal-500'
    }
  ];

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // If email is passed via URL, set it and go to OTP step
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
      setCurrentStep(1);
    }
  }, [emailParam]);

  const handleEmailSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await authAPI.requestEmailVerification({
        email: values.email
      });

      if (response.status === 200 || response.status === 201) {
        message.success('Mã OTP đã được gửi đến email của bạn');
        setEmail(values.email);
        setCurrentStep(1);
        setCountdown(60);
        setCanResend(false);
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || 
        'Không thể gửi mã xác thực. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      message.error('Vui lòng nhập mã OTP đầy đủ');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyEmailOtp({
        email,
        otp: otpCode
      });

      if (response.status === 200 || response.status === 201) {
        message.success('Email đã được xác thực thành công!');
        setSuccessMessage(true);
        setCurrentStep(2);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || 
        'Mã OTP không hợp lệ. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setCanResend(false);
    setLoading(true);
    try {
      const response = await authAPI.requestEmailVerification({
        email
      });

      if (response.status === 200 || response.status === 201) {
        message.success('Mã OTP mới đã được gửi');
        setOtp(['', '', '', '', '', '']);
        setCountdown(60);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      message.error('Không thể gửi lại mã OTP. Vui lòng thử lại.');
      setCanResend(true);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    },
    exit: { opacity: 0, y: -20 }
  };

  const stepIndicatorVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.1, duration: 0.3 }
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl"
          >
            {/* Step Indicators */}
            <div className="flex justify-between mb-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  variants={stepIndicatorVariants}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      index <= currentStep
                        ? `bg-gradient-to-r ${step.color} text-white shadow-lg`
                        : 'bg-white/20 text-white/50'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircleOutlined className="text-xl" />
                    ) : (
                      <Text>{step.icon}</Text>
                    )}
                  </div>
                  <Text className="text-xs text-center text-white/70">
                    {step.title}
                  </Text>
                </motion.div>
              ))}
            </div>

            {/* Content */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Title level={2} className="!text-white !mb-2">
                    Xác thực Email
                  </Title>
                  <Paragraph className="text-white/70">
                    Nhập email của bạn để nhận mã xác thực
                  </Paragraph>
                </div>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleEmailSubmit}
                  className="space-y-4"
                >
                  <Form.Item
                    name="email"
                    label={
                      <span className="text-white/90">Địa chỉ Email</span>
                    }
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng nhập email'
                      },
                      {
                        type: 'email',
                        message: 'Email không hợp lệ'
                      }
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<MailOutlined className="text-white/50" />}
                      placeholder="example@email.com"
                      className="!bg-white/10 !border-white/20 !text-white !placeholder-white/40 rounded-lg"
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    className="w-full !h-12 !text-base font-semibold rounded-lg"
                  >
                    {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                  </Button>
                </Form>

                <div className="text-center">
                  <Text className="text-white/70">
                    Đã có tài khoản?{' '}
                    <Link
                      to="/login"
                      className="text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      Đăng nhập
                    </Link>
                  </Text>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Title level={2} className="!text-white !mb-2">
                    Nhập mã OTP
                  </Title>
                  <Paragraph className="text-white/70">
                    Chúng tôi đã gửi mã xác thực đến{' '}
                    <span className="text-blue-400 font-semibold">{email}</span>
                  </Paragraph>
                </div>

                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className="w-14 h-14 text-center text-2xl font-bold border-2 border-white/30 bg-white/10 text-white rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                      maxLength="1"
                      placeholder="0"
                    />
                  ))}
                </div>

                <Button
                  type="primary"
                  size="large"
                  className="w-full !h-12 !text-base font-semibold rounded-lg"
                  loading={loading}
                  onClick={handleVerifyOtp}
                >
                  {loading ? 'Đang xác thực...' : 'Xác thực'}
                </Button>

                <div className="text-center space-y-2">
                  <div className="text-white/70">
                    {!canResend ? (
                      <Text className="text-sm">
                        Gửi lại mã trong {countdown}s
                      </Text>
                    ) : (
                      <Button
                        type="link"
                        className="!text-blue-400 !p-0"
                        onClick={handleResendOtp}
                        loading={loading}
                      >
                        Gửi lại mã OTP
                      </Button>
                    )}
                  </div>
                  <Button
                    type="link"
                    className="!text-white/70 !p-0"
                    onClick={() => {
                      setCurrentStep(0);
                      form.resetFields();
                      setOtp(['', '', '', '', '', '']);
                    }}
                  >
                    <Space size="small">
                      <ArrowLeftOutlined />
                      <span>Quay lại</span>
                    </Space>
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="text-center space-y-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex justify-center text-6xl"
                >
                  ✅
                </motion.div>

                <div className="space-y-2">
                  <Title level={2} className="!text-white !mb-2">
                    Xác thực Thành công!
                  </Title>
                  <Paragraph className="text-white/70">
                    Email của bạn đã được xác thực. Bạn sẽ được chuyển hướng đến trang
                    đăng nhập trong vài giây.
                  </Paragraph>
                </div>

                <Button
                  type="primary"
                  size="large"
                  className="w-full !h-12 !text-base font-semibold rounded-lg"
                  onClick={() => navigate('/login')}
                >
                  Đăng nhập
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
