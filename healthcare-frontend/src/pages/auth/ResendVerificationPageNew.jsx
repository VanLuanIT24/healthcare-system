// src/pages/auth/ResendVerificationPageNew.jsx
import { ArrowLeftOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Space, Typography } from 'antd';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authAPI from '../../services/api/authAPI';
import './AuthPages.css';

const { Title, Text, Paragraph } = Typography;

const ResendVerificationPageNew = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await authAPI.resendVerification(values.email);

      if (response.data && response.data.success) {
        setSubmitted(true);
        message.success({
          content: (
            <div>
              <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                ✅ Email xác thực đã được gửi!
              </p>
              <p style={{ fontSize: '13px', marginBottom: '0' }}>
                📧 Vui lòng kiểm tra hộp thư của bạn (kiểm tra cả thư mục Spam)
              </p>
            </div>
          ),
          duration: 4,
        });

        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 4000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Gửi lại email thất bại!';
      message.error({
        content: `❌ ${errorMsg}`,
        duration: 3,
      });
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
      {/* Animated Background */}
      <motion.div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          top: '-150px',
          right: '-150px',
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
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
        <Link to="/login">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            style={{ marginBottom: '20px' }}
          >
            Quay lại
          </Button>
        </Link>

        {!submitted ? (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ textAlign: 'center', marginBottom: '30px' }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
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
                <MailOutlined />
              </motion.div>
              <Title level={2} style={{ margin: '0 0 8px 0' }}>
                Gửi lại email xác thực
              </Title>
              <Text type="secondary">
                Chưa nhận được email? Hãy yêu cầu gửi lại
              </Text>
            </motion.div>

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
                  label={<span style={{ fontWeight: 500 }}>Email của bạn</span>}
                  name="email"
                  rules={[
                    { required: true, message: '❌ Vui lòng nhập email' },
                    { type: 'email', message: '❌ Email không hợp lệ' },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="user@example.com"
                    prefix={<MailOutlined className="text-gray-400" />}
                    style={{ borderRadius: '10px' }}
                  />
                </Form.Item>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
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
                    {loading ? 'Đang gửi...' : 'Gửi lại email'}
                  </Button>
                </Form.Item>
              </motion.div>
            </Form>

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                background: '#f0f5ff',
                padding: '15px',
                borderRadius: '10px',
                marginTop: '20px',
                borderLeft: '4px solid #667eea',
              }}
            >
              <Text style={{ fontSize: '13px', color: '#333' }}>
                💡 <strong>Lưu ý:</strong> Email có thể mất vài phút. Kiểm tra cả thư mục "Spam" hoặc "Thư rác".
              </Text>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{ textAlign: 'center', marginTop: '20px' }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  Đã xác thực email?{' '}
                  <Link to="/login" style={{ color: '#667eea', fontWeight: '500' }}>
                    Đăng nhập ngay
                  </Link>
                </Text>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  Chưa có tài khoản?{' '}
                  <Link to="/register" style={{ color: '#667eea', fontWeight: '500' }}>
                    Đăng ký tại đây
                  </Link>
                </Text>
              </Space>
            </motion.div>
          </>
        ) : (
          /* Success State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', padding: '20px' }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #52c41a, #95de64)',
                borderRadius: '50%',
                marginBottom: '20px',
                color: 'white',
                fontSize: '40px',
              }}
            >
              ✓
            </motion.div>
            <Title level={2}>Email đã được gửi!</Title>
            <Paragraph type="secondary" style={{ marginBottom: '20px' }}>
              Vui lòng kiểm tra hộp thư của bạn để xác thực email. Nếu không thấy, hãy kiểm tra thư mục spam.
            </Paragraph>
            <Button
              type="primary"
              size="large"
              block
              onClick={() => navigate('/login')}
              style={{
                background: 'linear-gradient(135deg, #52c41a, #95de64)',
                borderRadius: '10px',
                height: '45px',
                fontSize: '15px',
              }}
            >
              Đi đến trang đăng nhập
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ResendVerificationPageNew;
