// src/pages/auth/ResetPasswordPageNew.jsx
import { ArrowLeftOutlined, EyeInvisibleOutlined, EyeOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Space, Typography } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authAPI from '../../services/api/authAPI';
import './AuthPages.css';

const { Title, Text, Paragraph } = Typography;

const ResetPasswordPageNew = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = searchParams.get('token');
    if (!t) {
      message.error('❌ Token không hợp lệ. Vui lòng kiểm tra link từ email!');
      navigate('/forgot-password');
    } else {
      setToken(t);
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (values) => {
    if (!token) return;

    if (values.newPassword !== values.confirmPassword) {
      message.error('❌ Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 800));

      const response = await authAPI.resetPassword(token, values.newPassword);

      if (response.data && response.data.success) {
        setCurrentStep(2);
        message.success({
          content: (
            <div>
              <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                ✅ Đặt lại mật khẩu thành công!
              </p>
              <p style={{ fontSize: '13px', marginBottom: '0' }}>
                ⏱️ Tự động chuyển đến trang đăng nhập sau 3 giây...
              </p>
            </div>
          ),
          duration: 3,
        });

        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Đặt lại mật khẩu thất bại!';
      message.error({
        content: (
          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>❌ {errorMsg}</p>
            <p style={{ fontSize: '12px', marginBottom: '0' }}>
              💡 Token có thể đã hết hạn. Vui lòng yêu cầu gửi lại link.
            </p>
          </div>
        ),
        duration: 4,
      });
      setCurrentStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <motion.div
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          top: '-100px',
          left: '-100px',
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          bottom: '-50px',
          right: '-50px',
        }}
        animate={{
          scale: [1, 1.3, 1],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '450px',
          width: '100%',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Back Button */}
        <Link to="/forgot-password">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            style={{ marginBottom: '20px' }}
          >
            Quay lại
          </Button>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ textAlign: 'center', marginBottom: '30px' }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '50%',
              marginBottom: '15px',
              color: 'white',
              fontSize: '32px',
            }}
          >
            <LockOutlined />
          </motion.div>
          <Title level={2} style={{ margin: '0 0 8px 0' }}>
            Đặt lại mật khẩu
          </Title>
          <Text type="secondary">
            Nhập mật khẩu mới để bảo vệ tài khoản của bạn
          </Text>
        </motion.div>

        {/* Progress Steps */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '30px',
          gap: '10px'
        }}>
          {[0, 1, 2].map((step) => (
            <motion.div
              key={step}
              style={{
                flex: 1,
                height: '4px',
                background: currentStep >= step ? 'linear-gradient(90deg, #667eea, #764ba2)' : '#f0f0f0',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
              animate={{
                background: currentStep >= step ? 'linear-gradient(90deg, #667eea, #764ba2)' : '#f0f0f0'
              }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>

        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Form.Item
              label={<span style={{ fontWeight: 500 }}>Mật khẩu mới</span>}
              name="newPassword"
              rules={[
                { required: true, message: '❌ Vui lòng nhập mật khẩu mới' },
                { min: 6, message: '❌ Mật khẩu tối thiểu 6 ký tự' },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Nhập mật khẩu mới"
                prefix={<LockOutlined className="text-gray-400" />}
                iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                style={{ borderRadius: '10px' }}
              />
            </Form.Item>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Form.Item
              label={<span style={{ fontWeight: 500 }}>Xác nhận mật khẩu</span>}
              name="confirmPassword"
              rules={[
                { required: true, message: '❌ Vui lòng xác nhận mật khẩu' },
                { min: 6, message: '❌ Mật khẩu tối thiểu 6 ký tự' },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Nhập lại mật khẩu"
                prefix={<LockOutlined className="text-gray-400" />}
                iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                style={{ borderRadius: '10px' }}
              />
            </Form.Item>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Form.Item>
              <Button
                type="primary"
                size="large"
                block
                loading={loading}
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '10px',
                  height: '45px',
                  fontSize: '15px',
                  fontWeight: '600',
                }}
              >
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </Button>
            </Form.Item>
          </motion.div>
        </Form>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            background: '#f0f5ff',
            padding: '15px',
            borderRadius: '10px',
            marginTop: '20px',
            borderLeft: '4px solid #667eea',
          }}
        >
          <Text style={{ fontSize: '13px', color: '#333' }}>
            💡 <strong>Gợi ý:</strong> Mật khẩu mạnh nên chứa chữ cái, số và ký tự đặc biệt.
          </Text>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ textAlign: 'center', marginTop: '20px' }}
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              Nhớ mật khẩu rồi?{' '}
              <Link to="/login" style={{ color: '#667eea', fontWeight: '500' }}>
                Đăng nhập ngay
              </Link>
            </Text>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              Cần gửi lại link?{' '}
              <Link to="/forgot-password" style={{ color: '#667eea', fontWeight: '500' }}>
                Yêu cầu lại
              </Link>
            </Text>
          </Space>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPageNew;
