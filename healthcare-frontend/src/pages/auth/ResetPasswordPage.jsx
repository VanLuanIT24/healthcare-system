// src/pages/auth/ResetPasswordPage.jsx
import {
    CheckCircleOutlined,
    EyeInvisibleOutlined,
    EyeOutlined,
    LockOutlined
} from '@ant-design/icons';
import { Button, Form, Input, Typography, message } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './AuthPages.css';

const { Title, Text, Paragraph } = Typography;

const ResetPasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      message.error('Liên kết đặt lại mật khẩu không hợp lệ');
      navigate('/login');
    }
  }, [token, navigate]);

  const steps = [
    {
      title: 'Xác thực',
      description: 'Kiểm tra liên kết',
      icon: '🔐',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Mật khẩu mới',
      description: 'Tạo mật khẩu mới',
      icon: '🔑',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Hoàn tất',
      description: 'Thành công',
      icon: '✅',
      color: 'from-green-500 to-teal-500'
    }
  ];

  const handleResetPassword = async (values) => {
    if (!token) {
      message.error('Liên kết không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.resetPassword({
        token,
        newPassword: values.password,
        confirmPassword: values.confirmPassword
      });

      if (response.status === 200 || response.status === 201) {
        message.success('Mật khẩu đã được đặt lại thành công!');
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
        'Không thể đặt lại mật khẩu. Vui lòng thử lại.'
      );
      
      // If token expired
      if (error.response?.status === 400 || error.response?.status === 401) {
        navigate('/forgot-password');
      }
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
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <Title level={2} className="!text-white !mb-2">
                    Xác thực Liên kết
                  </Title>
                  <Paragraph className="text-white/70">
                    Liên kết của bạn đã được xác thực. Hãy tạo mật khẩu mới cho tài khoản.
                  </Paragraph>
                </div>

                <div className="flex justify-center text-4xl">🔓</div>

                <Button
                  type="primary"
                  size="large"
                  className="w-full !h-12 !text-base font-semibold rounded-lg"
                  onClick={() => setCurrentStep(1)}
                >
                  Tiếp tục
                </Button>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Title level={2} className="!text-white !mb-2">
                    Đặt lại Mật khẩu
                  </Title>
                  <Paragraph className="text-white/70">
                    Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
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
                    label={
                      <span className="text-white/90">Mật khẩu mới</span>
                    }
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng nhập mật khẩu mới'
                      },
                      {
                        min: 8,
                        message: 'Mật khẩu phải có ít nhất 8 ký tự'
                      },
                      {
                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                        message:
                          'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt'
                      }
                    ]}
                  >
                    <Input.Password
                      size="large"
                      prefix={<LockOutlined className="text-white/50" />}
                      placeholder="Nhập mật khẩu mới"
                      className="!bg-white/10 !border-white/20 !text-white !placeholder-white/40 rounded-lg"
                      iconRender={(visible) =>
                        visible ? (
                          <EyeOutlined className="text-white/70" />
                        ) : (
                          <EyeInvisibleOutlined className="text-white/70" />
                        )
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label={
                      <span className="text-white/90">Xác nhận mật khẩu</span>
                    }
                    dependencies={['password']}
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng xác nhận mật khẩu'
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error('Mật khẩu không khớp')
                          );
                        }
                      })
                    ]}
                  >
                    <Input.Password
                      size="large"
                      prefix={<LockOutlined className="text-white/50" />}
                      placeholder="Xác nhận mật khẩu"
                      className="!bg-white/10 !border-white/20 !text-white !placeholder-white/40 rounded-lg"
                      iconRender={(visible) =>
                        visible ? (
                          <EyeOutlined className="text-white/70" />
                        ) : (
                          <EyeInvisibleOutlined className="text-white/70" />
                        )
                      }
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    className="w-full !h-12 !text-base font-semibold rounded-lg"
                  >
                    {loading ? 'Đang xử lý...' : 'Cập nhật Mật khẩu'}
                  </Button>
                </Form>

                <div className="text-center">
                  <Text className="text-white/70">
                    Nhớ mật khẩu?{' '}
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
                    Đặt lại Thành công!
                  </Title>
                  <Paragraph className="text-white/70">
                    Mật khẩu của bạn đã được cập nhật. Bạn sẽ được chuyển hướng đến
                    trang đăng nhập trong vài giây.
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

        {/* Footer Link */}
        {currentStep < 2 && (
          <div className="mt-8 text-center">
            <Text className="text-white/60">
              Không phải khách hàng?{' '}
              <Link
                to="/register"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Đăng ký ngay
              </Link>
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
