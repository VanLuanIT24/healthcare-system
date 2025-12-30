// src/pages/auth/LoginPage.jsx
import Logo from '@/components/common/Logo';
import ParticlesBackground from '@/components/effect/ParticlesBackground';
import ThemeToggle from '@/components/effect/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import authAPI from '@/services/api/authAPI';
import {
  ArrowRightOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  FacebookOutlined,
  GoogleOutlined,
  LockOutlined,
  RocketOutlined,
  UserOutlined
} from '@ant-design/icons';
import { App, Button, Checkbox, Divider, FloatButton, Form, Input } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Environment check for logging
const isDev = import.meta.env?.DEV ?? false;

const LoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hoverEffect, setHoverEffect] = useState(false);
  const [showParticles, setShowParticles] = useState(true);
  const { login, setUserFromLoginResponse } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();

  const from = location.state?.from?.pathname || '/patient/profile';

  // Hiệu ứng particles tự động
  useEffect(() => {
    const interval = setInterval(() => {
      setShowParticles(prev => !prev);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await authAPI.login(values.email, values.password);

      // Handle axios response object { status, data: { success, message, data: { user, tokens } } }
      let user, accessToken, refreshToken;

      if (response?.data?.data?.user) {
        user = response.data.data.user;
        accessToken = response.data.data.tokens?.accessToken;
        refreshToken = response.data.data.tokens?.refreshToken;
      } else if (response?.user) {
        user = response.user;
        accessToken = response.tokens?.accessToken;
        refreshToken = response.tokens?.refreshToken;
      } else if (response?.data?.user) {
        user = response.data.user;
        accessToken = response.data.tokens?.accessToken;
        refreshToken = response.data.tokens?.refreshToken;
      }

      if (isDev) console.log('🔐 LoginPage - User role:', user?.role);

      if (user && accessToken && refreshToken) {
        // Lưu tokens TRƯỚC
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // ✨ Set user in AuthContext immediately (không chờ getProfile API)
        setUserFromLoginResponse(user);

        // ✅ Thông báo thành công
        message.success({
          content: (
            <div style={{ padding: '12px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 'bold', color: '#22863a' }}>
                ✅ Đăng nhập thành công!
              </h4>
              <p style={{ margin: '0', fontSize: '14px', color: '#333' }}>
                👋 Xin chào <strong>{user?.personalInfo?.firstName || user?.email}</strong>, chào mừng đến với HealthCare!
              </p>
            </div>
          ),
          duration: 3,
        });

        // Trigger storage event để AuthContext biết token đã thay đổi
        window.dispatchEvent(new Event('storage'));

        // Delay để đủ thời gian AuthContext cập nhật isAuthenticated
        setTimeout(() => {
          // Điều hướng dựa trên role
          if (user?.role === 'SUPER_ADMIN' || user?.role === 'SYSTEM_ADMIN' || user?.role === 'HOSPITAL_ADMIN') {
            navigate('/admin/dashboard', { replace: true });
          } else if (user?.role === 'DOCTOR') {
            navigate('/doctor/dashboard', { replace: true });
          } else if (user?.role === 'NURSE' || user?.role === 'PHARMACIST' || user?.role === 'LAB_TECHNICIAN') {
            navigate('/staff/dashboard', { replace: true });
          } else {
            const redirectPath = location.state?.from?.pathname || '/patient/profile';
            const redirectState = location.state?.from?.state;
            navigate(redirectPath, { state: redirectState, replace: true });
          }
        }, 1000);
      } else {
        if (isDev) console.error('❌ LoginPage - Invalid response structure:', response);
        message.error('❌ Đăng nhập thất bại: Dữ liệu không hợp lệ');
      }
    } catch (error) {
      if (isDev) console.error('❌ LoginPage - Login error:', error);
      const errorMessage = typeof error === 'string' ? error : (error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      message.error({
        content: `⚠️ ${errorMessage}`,
        duration: 3,
      });
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
        delayChildren: 0.2
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
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Floating Elements Background */}
      {showParticles && <ParticlesBackground />}

      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 animate-gradient" />

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
              backgroundImage: 'url(https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1600&auto=format&fit=crop)',
            }}
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 via-purple-600/70 to-blue-800/90" />
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
              Chào mừng <br />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                trở lại!
              </span>
            </motion.h1>

            <motion.p
              className="text-blue-100/90 text-lg mb-12 leading-relaxed"
              variants={itemVariants}
            >
              Đăng nhập để truy cập hệ thống chăm sóc sức khỏe thông minh
            </motion.p>

            <motion.div
              className="space-y-6"
              variants={itemVariants}
            >
              {[
                { icon: '📅', text: 'Quản lý lịch hẹn thông minh', color: 'from-cyan-500 to-blue-500' },
                { icon: '🔬', text: 'Xem kết quả xét nghiệm trực tuyến', color: 'from-purple-500 to-pink-500' },
                { icon: '🔔', text: 'Nhận thông báo tự động & AI hỗ trợ', color: 'from-green-500 to-teal-500' },
                { icon: '💾', text: 'Lưu trữ đám mây bảo mật', color: 'from-orange-500 to-red-500' }
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
                  <div className="text-2xl font-bold">10K+</div>
                  <div className="text-sm text-white/70">Bệnh nhân</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm text-white/70">Bác sĩ</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">99%</div>
                  <div className="text-sm text-white/70">Hài lòng</div>
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

        {/* Decorative Elements */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20
          }}
          className="w-full max-w-md z-10"
        >
          <motion.div
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
            whileHover={{
              boxShadow: "0 20px 60px rgba(59, 130, 246, 0.15)"
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
                <RocketOutlined className="text-2xl text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Đăng nhập
              </h2>
              <p className="text-gray-500 mt-2">
                Chưa có tài khoản?{' '}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  Đăng ký ngay <ArrowRightOutlined className="text-xs" />
                </Link>
              </p>
            </motion.div>

            {/* Enhanced Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ remember: true }}
            >
              <motion.div variants={containerVariants}>
                {/* Email Field */}
                <motion.div variants={itemVariants}>
                  <Form.Item
                    name="email"
                    label={<span className="font-semibold text-gray-700">Email</span>}
                    rules={[
                      { required: true, message: 'Vui lòng nhập email' },
                      { type: 'email', message: 'Email không hợp lệ' },
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="your@email.com"
                      className="rounded-xl h-12 border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-all"
                    />
                  </Form.Item>
                </motion.div>

                {/* Password Field */}
                <motion.div variants={itemVariants}>
                  <Form.Item
                    name="password"
                    label={<span className="font-semibold text-gray-700">Mật khẩu</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                  >
                    <Input.Password
                      size="large"
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder="••••••••"
                      iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                      className="rounded-xl h-12 border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-all"
                    />
                  </Form.Item>
                </motion.div>

                {/* Remember & Forgot */}
                <motion.div variants={itemVariants}>
                  <Form.Item>
                    <div className="flex justify-between items-center">
                      <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox className="font-medium hover:text-blue-600 transition-colors">
                          Ghi nhớ đăng nhập
                        </Checkbox>
                      </Form.Item>
                      <Link
                        to="/forgot-password"
                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                      >
                        Quên mật khẩu?
                      </Link>
                    </div>
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
                      className="rounded-xl h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-none shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                      icon={loading ? null : <ArrowRightOutlined />}
                    >
                      {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                  </Form.Item>
                </motion.div>
              </motion.div>
            </Form>

            {/* Social Login - Coming Soon */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Divider className="text-gray-400">
                <span className="bg-white px-4">Hoặc tiếp tục với</span>
              </Divider>

              <div className="flex gap-3">
                <Button
                  size="large"
                  icon={<GoogleOutlined />}
                  block
                  disabled
                  title="Sắp ra mắt"
                  className="rounded-xl h-12 flex items-center justify-center gap-2 font-medium border-gray-300 opacity-50 cursor-not-allowed"
                >
                  Google (Sắp ra mắt)
                </Button>
                <Button
                  size="large"
                  icon={<FacebookOutlined />}
                  block
                  disabled
                  title="Sắp ra mắt"
                  className="rounded-xl h-12 flex items-center justify-center gap-2 font-medium border-gray-300 opacity-50 cursor-not-allowed"
                >
                  Facebook (Sắp ra mắt)
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
              Bằng việc đăng nhập, bạn đồng ý với{' '}
              <Link to="/terms" className="text-blue-600 hover:underline font-medium">
                Điều khoản
              </Link>{' '}
              và{' '}
              <Link to="/privacy" className="text-blue-600 hover:underline font-medium">
                Bảo mật
              </Link>
            </motion.p>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            className="mt-8 grid grid-cols-2 gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200/50">
              <div className="text-blue-500 text-lg mb-1">🔒</div>
              <div className="text-xs font-medium text-gray-600">Bảo mật cao</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200/50">
              <div className="text-green-500 text-lg mb-1">⚡</div>
              <div className="text-xs font-medium text-gray-600">Tốc độ nhanh</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <FloatButton
        icon="🎨"
        type="primary"
        className="!bg-gradient-to-r !from-blue-500 !to-purple-500"
        onClick={() => setHoverEffect(!hoverEffect)}
      />
    </div>
  );
};

export default LoginPage;