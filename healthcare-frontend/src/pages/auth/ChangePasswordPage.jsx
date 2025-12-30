// src/pages/auth/ChangePasswordPage.jsx
import { ArrowLeftOutlined, EyeInvisibleOutlined, EyeOutlined, LockOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Form, Input, Row, Spin, Typography } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authAPI from '../../services/api/authAPI';
import './AuthPages.css';

const { Title, Text } = Typography;

const ChangePasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { message } = App.useApp();

  // Redirect to login nếu không authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('❌ Mật khẩu mới không khớp!');
      return;
    }

    if (values.currentPassword === values.newPassword) {
      message.error('❌ Mật khẩu mới phải khác mật khẩu hiện tại!');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.changePassword(values.currentPassword, values.newPassword, values.confirmPassword);

      if (response.data && response.data.success) {
        message.success({
          content: (
            <div>
              <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                ✅ Đổi mật khẩu thành công!
              </p>
              <p style={{ fontSize: '13px', marginBottom: '0' }}>
                ⏱️ Tự động chuyển về trang hồ sơ sau 2 giây...
              </p>
            </div>
          ),
          duration: 2,
        });

        form.resetFields();
        setTimeout(() => {
          navigate('/patient/profile', { replace: true });
        }, 2000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Đổi mật khẩu thất bại!';
      message.error({
        content: `❌ ${errorMsg}`,
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/patient/profile');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Animated Background */}
      <motion.div
        style={{
          position: 'fixed',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          top: '-100px',
          left: '10%',
          zIndex: 0,
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: '550px',
          width: '100%',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Back Button */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleGoBack}
          style={{
            color: 'white',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Quay lại hồ sơ
        </Button>

        <Card
          style={{
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: 'none',
            overflow: 'hidden',
          }}
          styles={{ body: { padding: '40px' } }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ marginBottom: '30px', textAlign: 'center' }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '70px',
                height: '70px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '50%',
                marginBottom: '20px',
                color: 'white',
                fontSize: '36px',
              }}
            >
              <LockOutlined />
            </motion.div>
            <Title level={2} style={{ margin: '0 0 8px 0' }}>
              Đổi mật khẩu
            </Title>
            <Text type="secondary">
              Cập nhật mật khẩu để bảo vệ tài khoản của bạn
            </Text>
          </motion.div>

          {/* Form */}
          <Spin spinning={loading}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              {/* Current Password */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Form.Item
                  label={<span style={{ fontWeight: 500, color: '#333' }}>Mật khẩu hiện tại</span>}
                  name="currentPassword"
                  rules={[
                    { required: true, message: '❌ Vui lòng nhập mật khẩu hiện tại' },
                  ]}
                >
                  <Input.Password
                    size="large"
                    placeholder="Nhập mật khẩu hiện tại"
                    prefix={<LockOutlined className="text-gray-400" />}
                    iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                    style={{ borderRadius: '10px' }}
                  />
                </Form.Item>
              </motion.div>

              {/* New Password */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Form.Item
                  label={<span style={{ fontWeight: 500, color: '#333' }}>Mật khẩu mới</span>}
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

              {/* Confirm Password */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Form.Item
                  label={<span style={{ fontWeight: 500, color: '#333' }}>Xác nhận mật khẩu mới</span>}
                  name="confirmPassword"
                  rules={[
                    { required: true, message: '❌ Vui lòng xác nhận mật khẩu' },
                  ]}
                >
                  <Input.Password
                    size="large"
                    placeholder="Nhập lại mật khẩu mới"
                    prefix={<LockOutlined className="text-gray-400" />}
                    iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                    style={{ borderRadius: '10px' }}
                  />
                </Form.Item>
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Form.Item>
                  <Row gutter={12}>
                    <Col span={12}>
                      <Button
                        size="large"
                        block
                        onClick={handleGoBack}
                        style={{ borderRadius: '10px', height: '45px' }}
                      >
                        Hủy
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button
                        type="primary"
                        size="large"
                        block
                        htmlType="submit"
                        loading={loading}
                        style={{
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          borderRadius: '10px',
                          height: '45px',
                          fontSize: '15px',
                          fontWeight: '600',
                        }}
                      >
                        Cập nhật
                      </Button>
                    </Col>
                  </Row>
                </Form.Item>
              </motion.div>
            </Form>
          </Spin>

          {/* Security Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{
              background: '#f0f5ff',
              padding: '15px',
              borderRadius: '10px',
              marginTop: '20px',
              borderLeft: '4px solid #667eea',
            }}
          >
            <Title level={5} style={{ margin: '0 0 8px 0' }}>
              🔒 Gợi ý bảo mật:
            </Title>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#666' }}>
              <li>Sử dụng mật khẩu độc nhất và không chia sẻ</li>
              <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
              <li>Thay đổi mật khẩu định kỳ để tăng bảo mật</li>
            </ul>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ChangePasswordPage;
